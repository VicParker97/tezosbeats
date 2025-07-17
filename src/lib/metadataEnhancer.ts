'use client';

import { createClient } from '@supabase/supabase-js';
import { TezRadioTrack } from './tezradioService';
import { NFTMetadata } from './nftService';

const supabaseUrl = 'https://hxerlgynhtwbxqwkghog.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4ZXJsZ3luaHR3Ynhxd2tnaG9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjA1NjEsImV4cCI6MjA2NzQ5NjU2MX0.trdCEb8X6_IUwMEW0zO4L2CKfU6tuU3NNG3tYzijAnM';

const supabase = createClient(supabaseUrl, supabaseKey);

export interface EnhancedMetadata {
  title: string;
  artist: string;
  duration: number;
  cover?: string;
  audioUrl?: string;
  collection?: string;
  description?: string;
  source: 'tezradio' | 'nft_metadata' | 'fallback';
}

class MetadataEnhancer {
  private cache = new Map<string, TezRadioTrack>();
  private cacheExpiry = new Map<string, number>();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  /**
   * Enhance NFT metadata using TezRadio's processed data as ground truth
   */
  async enhanceMetadata(
    contractAddress: string, 
    tokenId: string, 
    fallbackMetadata: NFTMetadata
  ): Promise<EnhancedMetadata> {
    // Process NFT metadata directly (TezRadio merging is now handled in AppContext)
    return {
      title: this.extractTitleFromMetadata(fallbackMetadata),
      artist: this.extractArtistFromMetadata(fallbackMetadata),
      duration: this.extractDurationFromMetadata(fallbackMetadata),
      collection: this.extractCollectionFromMetadata(fallbackMetadata, contractAddress),
      description: fallbackMetadata.description,
      source: 'nft_metadata'
    };
  }

  /**
   * Get metadata from TezRadio database by contract and token ID
   */
  private async getTezRadioMetadata(contractAddress: string, tokenId: string): Promise<TezRadioTrack | null> {
    const cacheKey = `${contractAddress}_${tokenId}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const expiry = this.cacheExpiry.get(cacheKey) || 0;
      if (Date.now() < expiry) {
        return this.cache.get(cacheKey) || null;
      }
    }

    try {
      const { data, error } = await supabase
        .from('music_nfts')
        .select('*')
        .eq('contract_address', contractAddress)
        .eq('token_id', parseInt(tokenId))
        .limit(1);

      if (error) {
        console.warn('TezRadio metadata query error:', error);
        return null;
      }

      const result = data && data.length > 0 ? data[0] : null;
      
      // Cache the result
      if (result) {
        this.cache.set(cacheKey, result);
        this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_DURATION);
      }

      return result;
    } catch (error) {
      console.warn('TezRadio metadata fetch error:', error);
      return null;
    }
  }

  /**
   * Extract title from NFT metadata with fallbacks
   */
  private extractTitleFromMetadata(metadata: NFTMetadata): string {
    // Strategy 1: Direct name field
    if (metadata.name) {
      return metadata.name;
    }

    // Strategy 2: Check for title field
    const metadataRecord = metadata as Record<string, unknown>;
    if (metadataRecord.title && typeof metadataRecord.title === 'string') {
      return metadataRecord.title;
    }

    // Strategy 3: Check attributes for title-related fields
    if (metadata.attributes) {
      const titleFields = ['title', 'track_name', 'song_name', 'name'];
      const titleAttr = metadata.attributes.find(attr => 
        titleFields.includes(attr.name.toLowerCase())
      );
      if (titleAttr) {
        return titleAttr.value;
      }
    }

    // Strategy 4: Check description for title pattern (some collections store it there)
    if (metadata.description) {
      const titleMatch = metadata.description.match(/^([^-\n]+)/);
      if (titleMatch && titleMatch[1] && titleMatch[1].trim().length > 0) {
        return titleMatch[1].trim();
      }
    }

    return 'Untitled Track';
  }

  /**
   * Extract artist from NFT metadata with multiple fallback strategies
   */
  private extractArtistFromMetadata(metadata: NFTMetadata): string {
    // Strategy 1: Check creators array
    if (metadata.creators && metadata.creators.length > 0) {
      return metadata.creators[0];
    }

    // Strategy 2: Check direct artist field
    const metadataRecord = metadata as Record<string, unknown>;
    if (metadataRecord.artist && typeof metadataRecord.artist === 'string') {
      return metadataRecord.artist;
    }

    // Strategy 3: Check attributes for artist-related fields
    if (metadata.attributes) {
      const artistFields = ['artist', 'creator', 'author', 'musician', 'producer', 'composer', 'by', 'made_by'];
      const artistAttr = metadata.attributes.find(attr => 
        artistFields.includes(attr.name.toLowerCase())
      );
      if (artistAttr) {
        return artistAttr.value;
      }
    }

    // Strategy 4: Parse from description (some collections format as "Title - Artist")
    if (metadata.description) {
      const artistMatch = metadata.description.match(/^[^-]+-\s*(.+)/);
      if (artistMatch && artistMatch[1] && artistMatch[1].trim().length > 0) {
        return artistMatch[1].trim();
      }
    }

    // Strategy 5: Check for common alternate field names
    const alternateFields = ['created_by', 'performer', 'band', 'singer'];
    for (const field of alternateFields) {
      if (metadataRecord[field] && typeof metadataRecord[field] === 'string') {
        return metadataRecord[field] as string;
      }
    }

    return 'Unknown Artist';
  }

  /**
   * Extract duration from NFT metadata with various format support
   */
  private extractDurationFromMetadata(metadata: NFTMetadata): number {
    // Strategy 1: Direct duration field
    if (metadata.duration) {
      if (typeof metadata.duration === 'number') {
        return metadata.duration;
      }
      if (typeof metadata.duration === 'string') {
        return this.parseDuration(metadata.duration);
      }
    }

    // Strategy 2: Check formats array
    if (metadata.formats) {
      const formatWithDuration = metadata.formats.find(format => 
        (format as Record<string, unknown>).duration
      );
      if (formatWithDuration) {
        const duration = (formatWithDuration as Record<string, unknown>).duration;
        return this.parseDuration(duration as string | number);
      }
    }

    // Strategy 3: Check attributes
    if (metadata.attributes) {
      const durationAttr = metadata.attributes.find(attr => 
        ['duration', 'length', 'time'].includes(attr.name.toLowerCase())
      );
      if (durationAttr) {
        return this.parseDuration(durationAttr.value);
      }
    }

    return 180; // Default 3 minutes
  }

  /**
   * Extract collection name from metadata
   */
  private extractCollectionFromMetadata(metadata: NFTMetadata, contractAddress: string): string {
    const metadataRecord = metadata as Record<string, unknown>;
    
    // Check various collection fields
    const collectionSources = [
      metadataRecord.collection,
      metadataRecord.album,
      metadataRecord.series,
      metadata.attributes?.find(attr => 
        ['collection', 'series', 'album', 'label', 'release'].includes(attr.name.toLowerCase())
      )?.value
    ];

    for (const source of collectionSources) {
      if (source && typeof source === 'string') {
        return source;
      }
    }

    return `Collection ${contractAddress.slice(0, 8)}...`;
  }

  /**
   * Parse duration from various string formats
   */
  private parseDuration(durationInput: string | number): number {
    if (typeof durationInput === 'number') {
      return durationInput;
    }
    
    if (typeof durationInput !== 'string') {
      return 180;
    }
    
    const cleanStr = durationInput.trim();
    
    // Check if it's just a number (seconds)
    const numericValue = parseInt(cleanStr);
    if (!isNaN(numericValue) && cleanStr === numericValue.toString()) {
      return numericValue;
    }
    
    // Parse time formats: "03:45", "00:03:45", "3m 45s", etc.
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
      }
    }
    
    return 180; // Default fallback
  }

  /**
   * Resolve IPFS URLs to HTTP gateway URLs
   */
  private resolveIpfsUrl(url: string): string {
    if (!url) return '';
    
    if (url.startsWith('ipfs://')) {
      const hash = url.replace('ipfs://', '');
      return `https://ipfs.io/ipfs/${hash}`;
    }
    
    return url;
  }

  /**
   * Clear cache (useful for testing or memory management)
   */
  clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }
}

export const metadataEnhancer = new MetadataEnhancer();