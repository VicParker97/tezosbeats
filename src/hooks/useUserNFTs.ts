'use client';

import { useState, useEffect, useCallback } from 'react';
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
  loadDemoNFTs: () => Promise<void>;
  clearNFTs: () => void;
  retryCount: number;
}

export const useUserNFTs = (walletAddress?: string): UseUserNFTsReturn => {
  const [nfts, setNfts] = useState<MusicNFT[]>([]);
  const [loadingState, setLoadingState] = useState<NFTLoadingState>(NFTLoadingState.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [cache, setCache] = useState<Map<string, { nfts: MusicNFT[]; timestamp: number }>>(new Map());

  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  const MAX_RETRIES = 3;

  const fetchNFTs = useCallback(async (address: string, isRetry = false) => {
    if (!address) return;

    // Check cache first
    const cached = cache.get(address);
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

      console.log(`Fetching NFTs for wallet: ${address} (attempt ${retryCount + 1})`);
      
      const userNFTs = await nftService.fetchUserNFTs(address);
      
      // Cache the results
      setCache(prev => new Map(prev.set(address, {
        nfts: userNFTs,
        timestamp: Date.now()
      })));

      setNfts(userNFTs);
      setLoadingState(NFTLoadingState.LOADED);
      setError(null);
      setRetryCount(0);

      console.log(`Successfully loaded ${userNFTs.length} music NFTs`);

    } catch (err) {
      console.error('Failed to fetch NFTs:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to load NFTs';
      
      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying NFT fetch (${retryCount + 1}/${MAX_RETRIES})...`);
        setRetryCount(prev => prev + 1);
        
        // Retry with exponential backoff
        setTimeout(() => {
          fetchNFTs(address, true);
        }, 1000 * Math.pow(2, retryCount));
        
        return;
      }

      setError(errorMessage);
      setLoadingState(NFTLoadingState.ERROR);
      setNfts([]);
    }
  }, [cache, retryCount]);

  const refreshNFTs = useCallback(async () => {
    if (!walletAddress) return;
    
    // Clear cache for this address to force refresh
    setCache(prev => {
      const newCache = new Map(prev);
      newCache.delete(walletAddress);
      return newCache;
    });
    
    setRetryCount(0);
    await fetchNFTs(walletAddress);
  }, [walletAddress, fetchNFTs]);

  const loadDemoNFTs = useCallback(async () => {
    try {
      setLoadingState(NFTLoadingState.LOADING);
      setError(null);
      
      console.log('Loading demo NFTs...');
      const demoNFTs = await nftService.fetchDemoNFTs();
      
      setNfts(demoNFTs);
      setLoadingState(NFTLoadingState.LOADED);
      setRetryCount(0);
      
      console.log(`Loaded ${demoNFTs.length} demo NFTs`);
      
    } catch (err) {
      console.error('Failed to load demo NFTs:', err);
      setError('Failed to load demo NFTs');
      setLoadingState(NFTLoadingState.ERROR);
    }
  }, []);

  const clearNFTs = useCallback(() => {
    setNfts([]);
    setLoadingState(NFTLoadingState.IDLE);
    setError(null);
    setRetryCount(0);
  }, []);

  // Auto-fetch NFTs when wallet address changes
  useEffect(() => {
    if (walletAddress) {
      setRetryCount(0);
      fetchNFTs(walletAddress);
    } else {
      clearNFTs();
    }
  }, [walletAddress, fetchNFTs, clearNFTs]);

  // Cleanup cache periodically
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setCache(prev => {
        const now = Date.now();
        const newCache = new Map();
        
        for (const [address, data] of prev.entries()) {
          if (now - data.timestamp < CACHE_DURATION) {
            newCache.set(address, data);
          }
        }
        
        return newCache;
      });
    }, 60000); // Clean every minute

    return () => clearInterval(cleanupInterval);
  }, []);

  return {
    nfts,
    loadingState,
    error,
    refreshNFTs,
    loadDemoNFTs,
    clearNFTs,
    retryCount
  };
};