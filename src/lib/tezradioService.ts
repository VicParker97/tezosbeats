'use client';

import { createClient } from '@supabase/supabase-js';

export interface TezRadioTrack {
  id: number;
  contract_address: string;
  token_id: number;
  track_title: string | null;
  artist_address: string | null;
  artist_name: string | null;
  audio_ipfs_uri: string | null;
  thumbnail_ipfs_uri: string | null;
  mime_type: string | null;
  duration_seconds: number | null;
  file_size_bytes: number | null;
  description: string | null;
  minted_at: string | null;
  inserted_at: string;
}

const supabaseUrl = 'https://hxerlgynhtwbxqwkghog.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4ZXJsZ3luaHR3Ynhxd2tnaG9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjA1NjEsImV4cCI6MjA2NzQ5NjU2MX0.trdCEb8X6_IUwMEW0zO4L2CKfU6tuU3NNG3tYzijAnM';

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL or Key is missing.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

const PAGE_SIZE = 1000; // Supabase default max rows per request
const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';

export const ipfsToGatewayUrl = (ipfsUri: string | null): string => {
    if (!ipfsUri || !ipfsUri.startsWith('ipfs://')) return '';
    return `${IPFS_GATEWAY}${ipfsUri.substring(7)}`;
};

export const fetchTezRadioTracksForWallet = async (walletAddress: string): Promise<TezRadioTrack[]> => {
    if (!walletAddress) {
        return [];
    }

    let allTracks: TezRadioTrack[] = [];
    let page = 0;
    let hasMore = true;

    console.log(`Fetching TezRadio tracks for wallet: ${walletAddress}`);

    while (hasMore) {
        const from = page * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        const { data, error } = await supabase
            .from('music_nfts')
            .select('*')
            .eq('artist_address', walletAddress) // Filter by wallet address
            .order('id', { ascending: false })
            .range(from, to);

        if (error) {
            console.error('Error fetching tracks page:', page, error);
            throw new Error(error.message);
        }

        if (data && data.length > 0) {
            allTracks = allTracks.concat(data);
            page++;
            if (data.length < PAGE_SIZE) {
                hasMore = false;
            }
        } else {
            hasMore = false;
        }
    }
    
    // Filter and normalize tracks
    const normalizedTracks = allTracks
        .filter(t => t.audio_ipfs_uri) // Only tracks with valid audio
        .map(t => ({
            ...t,
            track_title: t.track_title || 'Untitled Track',
            artist_name: t.artist_name || 'Unknown Artist',
        }));

    // Deduplicate tracks by title and artist
    const uniqueTracks: TezRadioTrack[] = [];
    const seen = new Set<string>();

    for (const track of normalizedTracks) {
        const uniqueKey = `${track.track_title?.toLowerCase()}|${track.artist_name?.toLowerCase()}`;
        if (!seen.has(uniqueKey) && track.audio_ipfs_uri) {
            seen.add(uniqueKey);
            uniqueTracks.push(track);
        }
    }

    console.log(`Found ${uniqueTracks.length} music NFTs for wallet ${walletAddress} in TezRadio database`);
    return uniqueTracks;
};

// Search function for TezRadio tracks for a specific wallet
export const searchTezRadioTracksForWallet = async (searchTerm: string, walletAddress: string): Promise<TezRadioTrack[]> => {
    if (!walletAddress) {
        return [];
    }

    if (!searchTerm.trim()) {
        return fetchTezRadioTracksForWallet(walletAddress);
    }

    const { data, error } = await supabase
        .from('music_nfts')
        .select('*')
        .eq('artist_address', walletAddress) // Filter by wallet address
        .or(`track_title.ilike.%${searchTerm}%,artist_name.ilike.%${searchTerm}%`)
        .not('audio_ipfs_uri', 'is', null)
        .order('id', { ascending: false })
        .limit(500); // Limit search results

    if (error) {
        console.error('Error searching tracks:', error);
        throw new Error(error.message);
    }

    const normalizedTracks = (data || [])
        .map(t => ({
            ...t,
            track_title: t.track_title || 'Untitled Track',
            artist_name: t.artist_name || 'Unknown Artist',
        }));

    // Deduplicate search results
    const uniqueTracks: TezRadioTrack[] = [];
    const seen = new Set<string>();

    for (const track of normalizedTracks) {
        const uniqueKey = `${track.track_title?.toLowerCase()}|${track.artist_name?.toLowerCase()}`;
        if (!seen.has(uniqueKey)) {
            seen.add(uniqueKey);
            uniqueTracks.push(track);
        }
    }

    console.log(`Found ${uniqueTracks.length} tracks matching "${searchTerm}" for wallet ${walletAddress}`);
    return uniqueTracks;
};