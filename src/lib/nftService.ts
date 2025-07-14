'use client';

export interface NFTMetadata {
  name?: string;
  description?: string;
  image?: string;
  artifact_uri?: string;
  display_uri?: string;
  thumbnail_uri?: string;
  formats?: Array<{
    uri: string;
    mimeType: string;
    fileName?: string;
  }>;
  attributes?: Array<{
    name: string;
    value: string;
  }>;
  creators?: string[];
  rights?: string;
  rightUri?: string;
  tags?: string[];
  language?: string;
  identifier?: string;
  type?: string;
  genre?: string;
  duration?: number;
  bpm?: number;
}

export interface TzKTToken {
  id: number;
  account: {
    address: string;
  };
  token: {
    id: number;
    contract: {
      address: string;
      alias?: string;
    };
    tokenId: string;
    standard: string;
    metadata?: NFTMetadata;
  };
  balance: string;
  transfersCount: number;
  firstLevel: number;
  firstTime: string;
  lastLevel: number;
  lastTime: string;
}

export interface MusicNFT {
  id: string;
  title: string;
  artist: string;
  cover: string;
  duration: number;
  collection: string;
  contractAddress: string;
  tokenId: string;
  audioUrl?: string;
  isLiked: boolean;
  metadata?: NFTMetadata;
}

class NFTService {
  private readonly TZKT_API = 'https://api.tzkt.io/v1';
  private readonly IPFS_GATEWAYS = [
    'https://ipfs.io/ipfs/',
    'https://gateway.pinata.cloud/ipfs/',
    'https://cloudflare-ipfs.com/ipfs/',
    'https://dweb.link/ipfs/'
  ];

  async fetchUserNFTs(walletAddress: string): Promise<MusicNFT[]> {
    try {
      console.log('Fetching NFTs for wallet:', walletAddress);
      
      const allTokens: TzKTToken[] = [];
      let offset = 0;
      const limit = 1000; // Max per request
      let hasMore = true;

      // Fetch ALL tokens with pagination
      while (hasMore) {
        console.log(`Fetching tokens batch: offset ${offset}, limit ${limit}`);
        
        const response = await fetch(
          `${this.TZKT_API}/tokens/balances?account=${walletAddress}&token.standard=fa2&balance.gt=0&offset=${offset}&limit=${limit}`
        );

        if (!response.ok) {
          throw new Error(`TzKT API error: ${response.status}`);
        }

        const tokens: TzKTToken[] = await response.json();
        allTokens.push(...tokens);
        
        console.log(`Fetched ${tokens.length} tokens in this batch (total: ${allTokens.length})`);
        
        // Check if we got fewer tokens than the limit (indicates last page)
        hasMore = tokens.length === limit;
        offset += limit;

        // Safety limit to prevent infinite loops
        if (offset > 10000) {
          console.warn('Reached safety limit of 10,000 tokens');
          break;
        }
      }

      console.log(`Total FA2 tokens found: ${allTokens.length}`);

      // Process tokens in parallel but with rate limiting
      const musicNFTs: MusicNFT[] = [];
      const batchSize = 10; // Increased batch size since we're being more selective
      let processedCount = 0;
      
      for (let i = 0; i < allTokens.length; i += batchSize) {
        const batch = allTokens.slice(i, i + batchSize);
        const batchResults = await Promise.allSettled(
          batch.map(token => this.processToken(token))
        );

        batchResults.forEach((result, index) => {
          processedCount++;
          if (result.status === 'fulfilled' && result.value) {
            musicNFTs.push(result.value);
            console.log(`✓ Music NFT found: ${result.value.title} (${musicNFTs.length} total)`);
          } else if (result.status === 'rejected') {
            console.warn(`Failed to process token ${batch[index].token.tokenId}:`, result.reason);
          }
        });

        // Progress update
        if (processedCount % 50 === 0) {
          console.log(`Progress: ${processedCount}/${allTokens.length} tokens processed, ${musicNFTs.length} music NFTs found`);
        }

        // Smaller delay since we're fetching less metadata now
        if (i + batchSize < allTokens.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      console.log(`🎵 Final result: ${musicNFTs.length} music NFTs found from ${allTokens.length} total tokens`);
      return musicNFTs;

    } catch (error) {
      console.error('Error fetching user NFTs:', error);
      throw new Error('Failed to fetch NFTs from TzKT API');
    }
  }

  private async processToken(token: TzKTToken): Promise<MusicNFT | null> {
    try {
      // Get metadata from token or fetch from IPFS
      let metadata = token.token.metadata;
      
      if (!metadata && token.token.contract?.address && token.token.tokenId) {
        // Try to fetch metadata from TzKT's token endpoint
        try {
          const tokenResponse = await fetch(
            `${this.TZKT_API}/tokens?contract=${token.token.contract.address}&tokenId=${token.token.tokenId}&select=metadata`
          );
          if (tokenResponse.ok) {
            const tokenData = await tokenResponse.json();
            if (tokenData && Array.isArray(tokenData) && tokenData.length > 0 && tokenData[0]) {
              metadata = tokenData[0].metadata;
            }
          }
        } catch (metadataError) {
          console.warn('Failed to fetch metadata from TzKT:', metadataError);
        }
      }

      if (!metadata) {
        return null;
      }

      // Check if this is a music NFT with strict criteria
      const isMusicNFT = this.isMusicNFT(metadata);
      if (!isMusicNFT) {
        return null;
      }

      // Transform to MusicNFT format
      const musicNFT = this.transformToMusicNFT(token, metadata);
      return musicNFT;

    } catch (error) {
      console.warn(`Error processing token ${token.token.tokenId}:`, error);
      return null;
    }
  }

  private isMusicNFT(metadata: NFTMetadata): boolean {
    // STRICT music NFT detection - must have audio file OR explicit music indicators
    
    // PRIMARY CHECK: Audio files (most reliable)
    const hasAudioFile = 
      (metadata.artifact_uri && this.isAudioUrl(metadata.artifact_uri)) ||
      ((metadata as any).artifactUri && this.isAudioUrl((metadata as any).artifactUri)) ||
      (metadata.formats && metadata.formats.some(format => 
        this.isAudioMimeType(format.mimeType) || this.isAudioUrl(format.uri)
      )) ||
      ((metadata as any).mimeType && this.isAudioMimeType((metadata as any).mimeType));

    // If it has audio files, it's definitely music
    if (hasAudioFile) {
      return true;
    }

    // SECONDARY CHECK: Explicit music metadata (only for NFTs without audio files)
    const explicitMusicIndicators = [
      // Must have "music" explicitly in tags
      metadata.tags && metadata.tags.some(tag => 
        ['music', 'audio', 'song', 'track'].includes(tag.toLowerCase())
      ),
      
      // Must have explicit genre or music-specific attributes
      metadata.genre ||
      ((metadata as any).genres && (
        Array.isArray((metadata as any).genres) ? 
        (metadata as any).genres.length > 0 : 
        typeof (metadata as any).genres === 'string'
      )) ||
      (metadata.attributes && metadata.attributes.some(attr =>
        ['genre', 'bpm', 'tempo', 'key', 'album', 'artist'].includes(attr.name.toLowerCase())
      )),
      
      // Must have "music" in type field
      metadata.type && metadata.type.toLowerCase().includes('music')
    ];

    // Only count as music if it has explicit music indicators
    const hasExplicitMusicMetadata = explicitMusicIndicators.filter(Boolean).length >= 2;

    return hasExplicitMusicMetadata;
  }

  private isAudioUrl(url: string): boolean {
    if (!url) return false;
    const audioExtensions = [
      '.mp3', '.wav', '.wave',           // Common formats
      '.ogg', '.oga',                   // OGG formats  
      '.m4a', '.aac', '.mp4',           // AAC formats
      '.flac', '.wma', '.opus',         // Lossless/other
      '.webm', '.3gp'                   // Web/mobile formats
    ];
    const lowerUrl = url.toLowerCase();
    return audioExtensions.some(ext => lowerUrl.includes(ext));
  }

  private isAudioMimeType(mimeType?: string): boolean {
    if (!mimeType) return false;
    const audioMimeTypes = [
      'audio/mpeg',         // MP3
      'audio/mp3',          // MP3 alternative
      'audio/wav',          // WAV
      'audio/wave',         // WAV alternative
      'audio/x-wav',        // WAV alternative
      'audio/vnd.wave',     // WAV alternative
      'audio/ogg',          // OGG
      'audio/vorbis',       // OGG Vorbis
      'audio/flac',         // FLAC
      'audio/x-flac',       // FLAC alternative
      'audio/aac',          // AAC
      'audio/mp4',          // M4A/AAC
      'audio/x-m4a',        // M4A alternative
      'audio/webm',         // WebM Audio
      'audio/opus',         // Opus
      'audio/3gpp'          // 3GP audio
    ];
    return audioMimeTypes.some(type => mimeType.toLowerCase().includes(type));
  }

  private containsMusicKeywords(text: string): boolean {
    const musicKeywords = [
      'music', 'track', 'song', 'audio', 'beat', 'album', 'single', 'remix', 'sound',
      'electronic', 'ambient', 'techno', 'house', 'jazz', 'classical', 'hip hop', 'rap',
      'rock', 'pop', 'folk', 'country', 'blues', 'reggae', 'funk', 'soul', 'disco',
      'instrumental', 'vocal', 'synth', 'drum', 'bass', 'melody', 'harmony', 'rhythm',
      'bpm', 'tempo', 'key', 'chord', 'scale', 'composition', 'producer', 'musician'
    ];
    const lowerText = text.toLowerCase();
    return musicKeywords.some(keyword => lowerText.includes(keyword));
  }

  private transformToMusicNFT(token: TzKTToken, metadata: NFTMetadata): MusicNFT {
    // Extract title
    const title = metadata.name || `Token #${token.token.tokenId}`;
    
    // Extract artist from various fields
    let artist = 'Unknown Artist';
    if (metadata.creators && metadata.creators.length > 0) {
      artist = metadata.creators[0];
    } else if ((metadata as any).artist) {
      artist = (metadata as any).artist;
    } else if (metadata.attributes) {
      const artistAttr = metadata.attributes.find(attr => 
        ['artist', 'creator', 'author', 'musician', 'producer', 'composer'].includes(attr.name.toLowerCase())
      );
      if (artistAttr) {
        artist = artistAttr.value;
      }
    }

    // Extract cover image
    const cover = this.extractImageUrl(metadata) || this.generatePlaceholderCover(title);

    // Extract duration with better parsing
    let duration = 180; // Default 3 minutes
    if (metadata.duration) {
      if (typeof metadata.duration === 'number') {
        duration = metadata.duration;
      } else if (typeof metadata.duration === 'string') {
        // Parse various duration formats: "03:45", "00:03:45", "225" (seconds)
        duration = this.parseDuration(metadata.duration);
      }
    } else if (metadata.formats) {
      // Check formats array for duration
      const formatWithDuration = metadata.formats.find(format => (format as any).duration);
      if (formatWithDuration) {
        duration = this.parseDuration((formatWithDuration as any).duration);
      }
    } else if (metadata.attributes) {
      const durationAttr = metadata.attributes.find(attr => 
        ['duration', 'length', 'time'].includes(attr.name.toLowerCase())
      );
      if (durationAttr) {
        duration = this.parseDuration(durationAttr.value);
      }
    }

    // Extract collection name
    const collection = token.token.contract.alias || 
                      (metadata as any).collection ||
                      (metadata as any).album ||
                      metadata.attributes?.find(attr => 
                        ['collection', 'series', 'album', 'label', 'release'].includes(attr.name.toLowerCase())
                      )?.value ||
                      `Collection ${token.token.contract.address.slice(0, 8)}`;

    // Extract audio URL
    const audioUrl = this.extractAudioUrl(metadata);

    return {
      id: `${token.token.contract.address}_${token.token.tokenId}`,
      title,
      artist,
      cover,
      duration,
      collection,
      contractAddress: token.token.contract.address,
      tokenId: token.token.tokenId,
      audioUrl,
      isLiked: false,
      metadata
    };
  }

  private extractImageUrl(metadata: NFTMetadata): string | null {
    const imageFields = [
      metadata.display_uri,
      (metadata as any).displayUri,
      metadata.thumbnail_uri,
      (metadata as any).thumbnailUri,
      metadata.image,
      // Only use artifact_uri if it's actually an image
      metadata.artifact_uri && this.isImageUrl(metadata.artifact_uri) ? metadata.artifact_uri : null,
      (metadata as any).artifactUri && this.isImageUrl((metadata as any).artifactUri) ? (metadata as any).artifactUri : null
    ];

    for (const field of imageFields) {
      if (field && this.isImageUrl(field)) {
        return this.resolveIpfsUrl(field);
      }
    }

    // Check formats array for image formats
    if (metadata.formats) {
      const imageFormat = metadata.formats.find(format => 
        format.mimeType?.startsWith('image/') || this.isImageUrl(format.uri)
      );
      if (imageFormat) {
        return this.resolveIpfsUrl(imageFormat.uri);
      }
    }

    return null;
  }

  private extractAudioUrl(metadata: NFTMetadata): string | null {
    // Check artifact_uri first (TZIP-21 standard)
    if (metadata.artifact_uri && this.isAudioUrl(metadata.artifact_uri)) {
      return this.resolveIpfsUrl(metadata.artifact_uri);
    }

    // Check artifactUri (alternative spelling)
    if ((metadata as any).artifactUri && this.isAudioUrl((metadata as any).artifactUri)) {
      return this.resolveIpfsUrl((metadata as any).artifactUri);
    }

    // Check formats array (TZIP-21 standard)
    if (metadata.formats) {
      const audioFormat = metadata.formats.find(format => 
        this.isAudioMimeType(format.mimeType) || this.isAudioUrl(format.uri)
      );
      if (audioFormat) {
        return this.resolveIpfsUrl(audioFormat.uri);
      }
    }

    // Check for direct audio field
    if ((metadata as any).audio && this.isAudioUrl((metadata as any).audio)) {
      return this.resolveIpfsUrl((metadata as any).audio);
    }

    // Check for media field array
    if ((metadata as any).media && Array.isArray((metadata as any).media)) {
      const audioMedia = (metadata as any).media.find((media: any) => 
        this.isAudioMimeType(media.mimeType) || this.isAudioUrl(media.uri)
      );
      if (audioMedia) {
        return this.resolveIpfsUrl(audioMedia.uri);
      }
    }

    return null;
  }

  private isImageUrl(url: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'];
    const lowerUrl = url.toLowerCase();
    return imageExtensions.some(ext => lowerUrl.includes(ext));
  }

  private resolveIpfsUrl(url: string): string {
    if (!url) return '';
    
    // Handle IPFS URLs
    if (url.startsWith('ipfs://')) {
      const hash = url.replace('ipfs://', '');
      return `${this.IPFS_GATEWAYS[0]}${hash}`;
    }
    
    // Return as-is for HTTP URLs
    return url;
  }

  private parseDuration(durationStr: string | number): number {
    if (typeof durationStr === 'number') {
      return durationStr;
    }
    
    if (typeof durationStr !== 'string') {
      return 180; // Default 3 minutes
    }
    
    // Remove any non-numeric characters except colons and spaces
    const cleanStr = durationStr.trim();
    
    // Check if it's just a number (seconds)
    const numericValue = parseInt(cleanStr);
    if (!isNaN(numericValue) && cleanStr === numericValue.toString()) {
      return numericValue;
    }
    
    // Parse time formats: "03:45", "00:03:45", "3:45", "3m 45s", etc.
    const timeRegex = /(?:(\d+):)?(\d+):(\d+)|(\d+)m?\s*(\d+)s?|(\d+)\s*(?:min|minutes?)\s*(\d+)\s*(?:sec|seconds?)?/i;
    const match = cleanStr.match(timeRegex);
    
    if (match) {
      if (match[1] !== undefined) {
        // HH:MM:SS format
        const hours = parseInt(match[1]) || 0;
        const minutes = parseInt(match[2]) || 0;
        const seconds = parseInt(match[3]) || 0;
        return hours * 3600 + minutes * 60 + seconds;
      } else if (match[2] !== undefined && match[3] !== undefined) {
        // MM:SS format
        const minutes = parseInt(match[2]) || 0;
        const seconds = parseInt(match[3]) || 0;
        return minutes * 60 + seconds;
      } else if (match[4] !== undefined && match[5] !== undefined) {
        // 3m 45s format
        const minutes = parseInt(match[4]) || 0;
        const seconds = parseInt(match[5]) || 0;
        return minutes * 60 + seconds;
      } else if (match[6] !== undefined && match[7] !== undefined) {
        // 3 minutes 45 seconds format
        const minutes = parseInt(match[6]) || 0;
        const seconds = parseInt(match[7]) || 0;
        return minutes * 60 + seconds;
      }
    }
    
    // Fallback: try to extract just minutes and seconds
    const numbers = cleanStr.match(/\d+/g);
    if (numbers && numbers.length >= 2) {
      const minutes = parseInt(numbers[0]) || 0;
      const seconds = parseInt(numbers[1]) || 0;
      return minutes * 60 + seconds;
    }
    
    return 180; // Default 3 minutes if parsing fails
  }

  private generatePlaceholderCover(title: string): string {
    const colors = ['#3985ff', '#f97316', '#10b981', '#ef4444', '#8f5cf6', '#f59e42', '#34d399'];
    const colorIndex = title.length % colors.length;
    const color = colors[colorIndex];
    
    const initials = title.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    
    const svg = `
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="48" rx="8" fill="${color}"/>
        <text x="24" y="30" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16" font-weight="bold">${initials}</text>
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  // Generate a simple audio tone for testing
  private generateTestAudio(frequency: number = 440): string {
    try {
      // Create a simple sine wave audio buffer
      const sampleRate = 22050;
      const duration = 3; // 3 seconds
      const frequency = 440; // A4 note
      const samples = sampleRate * duration;
      
      // WAV file header
      const buffer = new ArrayBuffer(44 + samples * 2);
      const view = new DataView(buffer);
      
      // Write WAV header
      const writeString = (offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };
      
      writeString(0, 'RIFF');
      view.setUint32(4, 36 + samples * 2, true);
      writeString(8, 'WAVE');
      writeString(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, 1, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      writeString(36, 'data');
      view.setUint32(40, samples * 2, true);
      
      // Generate sine wave
      for (let i = 0; i < samples; i++) {
        const amplitude = 0.3; // Reduced volume
        const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate) * amplitude;
        const intSample = Math.round(sample * 32767);
        view.setInt16(44 + i * 2, intSample, true);
      }
      
      // Convert to base64
      const bytes = new Uint8Array(buffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      
      return `data:audio/wav;base64,${btoa(binary)}`;
    } catch (error) {
      console.warn('Failed to generate test audio:', error);
      return '';
    }
  }

  // Demo mode - provide sample music NFTs
  async fetchDemoNFTs(): Promise<MusicNFT[]> {
    try {
      // Use static demo data (external APIs have CORS restrictions)

      const demoNFTs: MusicNFT[] = [
        {
          id: 'demo_1',
          title: 'Ethereal Waves',
          artist: 'Digital Composer',
          cover: this.generatePlaceholderCover('Ethereal Waves'),
          duration: 245,
          collection: 'Electronic Dreams',
          contractAddress: 'KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton',
          tokenId: '1',
          audioUrl: null, // No audio - for testing UI
          isLiked: false,
          metadata: {
            name: 'Ethereal Waves',
            description: 'An ambient electronic composition',
            tags: ['electronic', 'ambient', 'music']
          }
        },
        {
          id: 'demo_2',
          title: 'Blockchain Symphony',
          artist: 'CryptoBeats',
          cover: this.generatePlaceholderCover('Blockchain Symphony'),
          duration: 198,
          collection: 'Tech Anthems',
          contractAddress: 'KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton',
          tokenId: '2',
          audioUrl: null, // No audio - for testing UI
          isLiked: true,
          metadata: {
            name: 'Blockchain Symphony',
            description: 'A orchestral piece inspired by technology',
            tags: ['orchestral', 'technology', 'music']
          }
        },
        {
          id: 'demo_3',
          title: 'Tezos Rhythm',
          artist: 'NFT Musician',
          cover: this.generatePlaceholderCover('Tezos Rhythm'),
          duration: 167,
          collection: 'Crypto Sounds',
          contractAddress: 'KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton',
          tokenId: '3',
          audioUrl: null,
          isLiked: false,
          metadata: {
            name: 'Tezos Rhythm',
            description: 'Rhythmic beats from the blockchain',
            tags: ['rhythm', 'beats', 'music']
          }
        },
        {
          id: 'demo_4',
          title: 'Digital Dreams',
          artist: 'Synth Master',
          cover: this.generatePlaceholderCover('Digital Dreams'),
          duration: 312,
          collection: 'Synthwave Collection',
          contractAddress: 'KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton',
          tokenId: '4',
          audioUrl: null, // No audio - for testing UI
          isLiked: true,
          metadata: {
            name: 'Digital Dreams',
            description: 'Synthwave track with retro vibes',
            tags: ['synthwave', 'retro', 'music']
          }
        },
        {
          id: 'demo_5',
          title: 'Ambient Space',
          artist: 'Cosmic Sound',
          cover: this.generatePlaceholderCover('Ambient Space'),
          duration: 423,
          collection: 'Space Music',
          contractAddress: 'KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton',
          tokenId: '5',
          audioUrl: null,
          isLiked: false,
          metadata: {
            name: 'Ambient Space',
            description: 'Atmospheric sounds from outer space',
            tags: ['ambient', 'space', 'atmospheric', 'music']
          }
        }
      ];

      console.log(`Demo mode loaded ${demoNFTs.length} tracks`);
      return demoNFTs;

    } catch (error) {
      console.error('Error in demo mode:', error);
      
      // Return minimal demo data as fallback
      return [{
        id: 'demo_fallback',
        title: 'Demo Track',
        artist: 'Demo Artist',
        cover: this.generatePlaceholderCover('Demo Track'),
        duration: 180,
        collection: 'Demo Collection',
        contractAddress: 'demo',
        tokenId: '1',
        audioUrl: null,
        isLiked: false,
        metadata: { name: 'Demo Track' }
      }];
    }
  }

  private transformObjktToMusicNFT(token: any): MusicNFT {
    const metadata = token.metadata || {};
    const title = metadata.name || `Token #${token.token_id}`;
    
    return {
      id: `${token.fa2_address}_${token.token_id}`,
      title,
      artist: metadata.creators?.[0] || 'Unknown Artist',
      cover: this.extractImageUrl(metadata) || this.generatePlaceholderCover(title),
      duration: metadata.duration || 180,
      collection: metadata.collection || 'Demo Collection',
      contractAddress: token.fa2_address,
      tokenId: token.token_id,
      audioUrl: this.extractAudioUrl(metadata),
      isLiked: false,
      metadata
    };
  }
}

export const nftService = new NFTService();