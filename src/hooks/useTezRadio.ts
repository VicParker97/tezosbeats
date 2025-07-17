'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchTezRadioTracksForWallet, searchTezRadioTracksForWallet, fetchTezRadioTracksByTokens, TezRadioTrack } from '@/lib/tezradioService';
import { convertTezRadioTracksToMusicNFTs } from '@/lib/dataAdapter';
import { MusicNFT } from '@/lib/nftService';

export enum TezRadioLoadingState {
  IDLE = 'idle',
  LOADING = 'loading',
  LOADED = 'loaded',
  ERROR = 'error'
}

export interface UseTezRadioReturn {
  tracks: MusicNFT[];
  loadingState: TezRadioLoadingState;
  error: string | null;
  searchTracks: (searchTerm: string) => Promise<void>;
  refreshTracks: () => Promise<void>;
  fetchTracksByTokens: (tokenPairs: Array<{contractAddress: string, tokenId: string}>) => Promise<void>;
  clearTracks: () => void;
}

export const useTezRadio = (walletAddress?: string): UseTezRadioReturn => {
  const [tracks, setTracks] = useState<MusicNFT[]>([]);
  const [loadingState, setLoadingState] = useState<TezRadioLoadingState>(TezRadioLoadingState.IDLE);
  const [error, setError] = useState<string | null>(null);

  const fetchAndConvertTracks = useCallback(async (fetchFunction: () => Promise<TezRadioTrack[]>) => {
    if (!walletAddress) {
      setTracks([]);
      setLoadingState(TezRadioLoadingState.IDLE);
      setError(null);
      return;
    }

    try {
      setLoadingState(TezRadioLoadingState.LOADING);
      setError(null);

      console.log(`Fetching tracks from TezRadio database for wallet: ${walletAddress}`);
      
      const tezRadioTracks = await fetchFunction();
      const convertedTracks = convertTezRadioTracksToMusicNFTs(tezRadioTracks);
      
      setTracks(convertedTracks);
      setLoadingState(TezRadioLoadingState.LOADED);
      
      console.log(`Successfully loaded ${convertedTracks.length} tracks from TezRadio for wallet`, {
        rawTracks: tezRadioTracks.length,
        convertedTracks: convertedTracks.length,
        sampleRawTrack: tezRadioTracks[0] || null,
        sampleConvertedTrack: convertedTracks[0] || null
      });

    } catch (err) {
      console.error('Failed to fetch TezRadio tracks:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load tracks from TezRadio';
      setError(errorMessage);
      setLoadingState(TezRadioLoadingState.ERROR);
      setTracks([]);
    }
  }, [walletAddress]);

  const refreshTracks = useCallback(async () => {
    if (!walletAddress) return;
    await fetchAndConvertTracks(() => fetchTezRadioTracksForWallet(walletAddress));
  }, [fetchAndConvertTracks, walletAddress]);

  const searchTracks = useCallback(async (searchTerm: string) => {
    if (!walletAddress) return;
    await fetchAndConvertTracks(() => searchTezRadioTracksForWallet(searchTerm, walletAddress));
  }, [fetchAndConvertTracks, walletAddress]);

  const fetchTracksByTokens = useCallback(async (tokenPairs: Array<{contractAddress: string, tokenId: string}>) => {
    await fetchAndConvertTracks(() => fetchTezRadioTracksByTokens(tokenPairs));
  }, [fetchAndConvertTracks]);

  const clearTracks = useCallback(() => {
    setTracks([]);
    setLoadingState(TezRadioLoadingState.IDLE);
    setError(null);
  }, []);

  // Only clear tracks when wallet disconnects, don't auto-load
  useEffect(() => {
    if (!walletAddress) {
      clearTracks();
    }
  }, [walletAddress, clearTracks]);

  return {
    tracks,
    loadingState,
    error,
    searchTracks,
    refreshTracks,
    fetchTracksByTokens,
    clearTracks
  };
};