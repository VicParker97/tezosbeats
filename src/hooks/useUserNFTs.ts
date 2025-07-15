'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { nftService, MusicNFT } from '@/lib/nftService';

export enum NFTLoadingState {
  IDLE = 'idle',
  LOADING = 'loading',
  LOADED = 'loaded',
  ERROR = 'error'
}

export interface UseUserNFTsReturn {
  nfts: MusicNFT[];
  loadingState: NFTLoadingState;
  error: string | null;
  refreshNFTs: () => Promise<void>;
  clearNFTs: () => void;
  retryCount: number;
}

// Constants outside the hook to avoid dependency issues
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_RETRIES = 3;

export const useUserNFTs = (walletAddress?: string): UseUserNFTsReturn => {
  const [nfts, setNfts] = useState<MusicNFT[]>([]);
  const [loadingState, setLoadingState] = useState<NFTLoadingState>(NFTLoadingState.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Use refs to avoid infinite loops in callbacks
  const cacheRef = useRef<Map<string, { nfts: MusicNFT[]; timestamp: number }>>(new Map());
  const retryCountRef = useRef(0);

  const fetchNFTs = useCallback(async (address: string, isRetry = false) => {
    if (!address) return;

    // Check cache first using ref
    const cached = cacheRef.current.get(address);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('Using cached NFTs for', address);
      setNfts(cached.nfts);
      setLoadingState(NFTLoadingState.LOADED);
      setError(null);
      return;
    }

    try {
      if (!isRetry) {
        setLoadingState(NFTLoadingState.LOADING);
        setError(null);
      }

      console.log(`Fetching NFTs for wallet: ${address} (attempt ${retryCountRef.current + 1})`);
      
      const userNFTs = await nftService.fetchUserNFTs(address);
      
      // Cache the results using ref
      cacheRef.current.set(address, {
        nfts: userNFTs,
        timestamp: Date.now()
      });

      setNfts(userNFTs);
      setLoadingState(NFTLoadingState.LOADED);
      setError(null);
      retryCountRef.current = 0;
      setRetryCount(0);

      console.log(`Successfully loaded ${userNFTs.length} music NFTs`);

    } catch (err) {
      console.error('Failed to fetch NFTs:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to load NFTs';
      
      if (retryCountRef.current < MAX_RETRIES) {
        console.log(`Retrying NFT fetch (${retryCountRef.current + 1}/${MAX_RETRIES})...`);
        retryCountRef.current += 1;
        setRetryCount(retryCountRef.current);
        
        // Retry with exponential backoff
        setTimeout(() => {
          fetchNFTs(address, true);
        }, 1000 * Math.pow(2, retryCountRef.current - 1));
        
        return;
      }

      setError(errorMessage);
      setLoadingState(NFTLoadingState.ERROR);
      setNfts([]);
    }
  }, []); // Constants are stable

  const refreshNFTs = useCallback(async () => {
    if (!walletAddress) return;
    
    // Clear cache for this address to force refresh using ref
    cacheRef.current.delete(walletAddress);
    
    retryCountRef.current = 0;
    setRetryCount(0);
    await fetchNFTs(walletAddress);
  }, [walletAddress, fetchNFTs]); // fetchNFTs is stable


  const clearNFTs = useCallback(() => {
    setNfts([]);
    setLoadingState(NFTLoadingState.IDLE);
    setError(null);
    retryCountRef.current = 0;
    setRetryCount(0);
  }, []);

  // Auto-fetch NFTs when wallet address changes
  useEffect(() => {
    if (walletAddress) {
      retryCountRef.current = 0;
      setRetryCount(0);
      fetchNFTs(walletAddress);
    } else {
      clearNFTs();
    }
  }, [walletAddress, fetchNFTs, clearNFTs]);

  // Cleanup cache periodically
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      const currentCache = cacheRef.current;
      
      // Remove expired entries from cache ref
      for (const [address, data] of currentCache.entries()) {
        if (now - data.timestamp >= CACHE_DURATION) {
          currentCache.delete(address);
        }
      }
    }, 60000); // Clean every minute

    return () => clearInterval(cleanupInterval);
  }, []); // CACHE_DURATION is a constant

  return {
    nfts,
    loadingState,
    error,
    refreshNFTs,
    clearNFTs,
    retryCount
  };
};