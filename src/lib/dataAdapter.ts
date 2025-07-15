'use client';

import { TezRadioTrack, ipfsToGatewayUrl } from './tezradioService';
import { MusicNFT } from './nftService';

/**
 * Converts a TezRadio track to the MusicNFT format used by TezosBeats
 */
export const convertTezRadioToMusicNFT = (tezRadioTrack: TezRadioTrack): MusicNFT => {
    // Generate a placeholder cover if no thumbnail
    const generatePlaceholderCover = (title: string): string => {
        const colors = ['#3985ff', '#f97316', '#10b981', '#ef4444', '#8f5cf6', '#f59e42', '#34d399'];
        const colorIndex = title.length % colors.length;
        const color = colors[colorIndex];
        
        // Safely extract initials and handle Unicode characters
        const initials = title.split(' ')
            .map(word => {
                // Get first character and ensure it's safe for btoa
                const firstChar = word[0] || '';
                // Replace non-Latin characters with safe alternatives
                return firstChar.replace(/[^\x00-\x7F]/g, '?');
            })
            .join('')
            .toUpperCase()
            .slice(0, 2) || '??';
        
        const svg = `
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="48" height="48" rx="8" fill="${color}"/>
                <text x="24" y="30" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16" font-weight="bold">${initials}</text>
            </svg>
        `;
        
        try {
            // Safely encode SVG, handling Unicode characters
            return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
        } catch (error) {
            console.warn('Failed to encode SVG, using fallback', error);
            // Fallback: use URL encoding instead of base64
            return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
        }
    };

    return {
        id: `tezradio_${tezRadioTrack.contract_address}_${tezRadioTrack.token_id}`,
        title: tezRadioTrack.track_title || 'Untitled Track',
        artist: tezRadioTrack.artist_name || 'Unknown Artist',
        cover: tezRadioTrack.thumbnail_ipfs_uri 
            ? ipfsToGatewayUrl(tezRadioTrack.thumbnail_ipfs_uri)
            : generatePlaceholderCover(tezRadioTrack.track_title || 'Untitled Track'),
        duration: tezRadioTrack.duration_seconds || 180, // Default 3 minutes if no duration
        collection: `Contract ${tezRadioTrack.contract_address.slice(0, 8)}...`, // Shortened contract address
        contractAddress: tezRadioTrack.contract_address,
        tokenId: tezRadioTrack.token_id.toString(),
        audioUrl: tezRadioTrack.audio_ipfs_uri 
            ? ipfsToGatewayUrl(tezRadioTrack.audio_ipfs_uri)
            : null,
        isLiked: false,
        metadata: {
            name: tezRadioTrack.track_title,
            description: tezRadioTrack.description,
            creators: tezRadioTrack.artist_name ? [tezRadioTrack.artist_name] : undefined,
            duration: tezRadioTrack.duration_seconds,
            type: 'music'
        }
    };
};

/**
 * Converts multiple TezRadio tracks to MusicNFT format
 */
export const convertTezRadioTracksToMusicNFTs = (tezRadioTracks: TezRadioTrack[]): MusicNFT[] => {
    return tezRadioTracks.map(convertTezRadioToMusicNFT);
};

/**
 * Combined data source type for unified handling
 */
export enum DataSource {
    WALLET = 'wallet',
    TEZRADIO = 'tezradio'
}

export interface UnifiedTrack extends MusicNFT {
    source: DataSource;
    originalData?: TezRadioTrack;
}

/**
 * Converts MusicNFT to UnifiedTrack with source information
 */
export const createUnifiedTrack = (musicNFT: MusicNFT, source: DataSource, originalData?: TezRadioTrack): UnifiedTrack => {
    return {
        ...musicNFT,
        source,
        originalData
    };
};