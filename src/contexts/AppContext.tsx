'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Track } from '@/lib/mockData';
import { useWallet, UseWalletReturn, WalletState } from '@/hooks/useWallet';
import { useUserNFTs, UseUserNFTsReturn, NFTLoadingState } from '@/hooks/useUserNFTs';
import { MusicNFT } from '@/lib/nftService';

interface AppContextType {
  // Theme
  isDark: boolean;
  toggleTheme: () => void;
  
  // Player
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTrackIndex: number;
  
  // Player actions
  setCurrentTrack: (track: Track) => void;
  togglePlayPause: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  
  // Track actions
  toggleLike: (trackId: string) => void;
  
  // UI state
  isMobile: boolean;
  
  // Wallet
  wallet: UseWalletReturn;
  
  // NFTs
  nfts: UseUserNFTsReturn;
  demoMode: boolean;
  toggleDemoMode: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrackState] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  
  // Initialize wallet hook
  const wallet = useWallet();
  
  // Initialize NFTs hook
  const nfts = useUserNFTs(wallet.walletInfo?.address);

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDark(shouldBeDark);
    document.documentElement.classList.toggle('dark', shouldBeDark);
  }, []);

  // Handle responsive design
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Convert MusicNFT to Track format
  const convertNFTsToTracks = (musicNFTs: MusicNFT[]): Track[] => {
    return musicNFTs.map(nft => ({
      id: nft.id,
      title: nft.title,
      artist: nft.artist,
      cover: nft.cover,
      duration: nft.duration,
      collection: nft.collection,
      isLiked: nft.isLiked,
      audioUrl: nft.audioUrl
    }));
  };

  // Update tracks based on wallet state and NFT data
  useEffect(() => {
    if (wallet.state === WalletState.CONNECTED && !demoMode) {
      // Use real NFT data when wallet is connected and not in demo mode
      if (nfts.loadingState === NFTLoadingState.LOADED) {
        const nftTracks = convertNFTsToTracks(nfts.nfts);
        setTracks(nftTracks);
        console.log(`Updated tracks with ${nftTracks.length} NFTs`);
      } else if (nfts.loadingState === NFTLoadingState.IDLE || nfts.loadingState === NFTLoadingState.LOADING) {
        // Keep tracks empty while loading
        setTracks([]);
      }
    } else if (demoMode) {
      // Use demo data when in demo mode
      if (nfts.loadingState === NFTLoadingState.LOADED) {
        const demoTracks = convertNFTsToTracks(nfts.nfts);
        setTracks(demoTracks);
      }
    } else {
      // Use empty tracks when wallet is disconnected
      setTracks([]);
    }
    
    // Reset current track if it's not in the new tracks list
    if (currentTrack && tracks.length > 0 && !tracks.find(t => t.id === currentTrack.id)) {
      setCurrentTrackState(null);
      setIsPlaying(false);
    }
  }, [wallet.state, nfts.loadingState, nfts.nfts, demoMode, currentTrack, tracks]);

  // Initialize demo mode from localStorage
  useEffect(() => {
    const savedDemoMode = localStorage.getItem('tezosbeats_demo_mode');
    if (savedDemoMode === 'true') {
      setDemoMode(true);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newTheme);
  };

  const toggleDemoMode = async () => {
    const newDemoMode = !demoMode;
    setDemoMode(newDemoMode);
    localStorage.setItem('tezosbeats_demo_mode', newDemoMode.toString());
    
    if (newDemoMode) {
      // Load demo NFTs
      await nfts.loadDemoNFTs();
    } else {
      // Clear demo data and reload user NFTs if wallet is connected
      nfts.clearNFTs();
      if (wallet.state === WalletState.CONNECTED) {
        await nfts.refreshNFTs();
      }
    }
  };

  const setCurrentTrack = (track: Track) => {
    const index = tracks.findIndex(t => t.id === track.id);
    setCurrentTrackState(track);
    setCurrentTrackIndex(index);
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    const nextIndex = (currentTrackIndex + 1) % tracks.length;
    setCurrentTrackState(tracks[nextIndex]);
    setCurrentTrackIndex(nextIndex);
    setIsPlaying(true);
  };

  const previousTrack = () => {
    const prevIndex = currentTrackIndex === 0 ? tracks.length - 1 : currentTrackIndex - 1;
    setCurrentTrackState(tracks[prevIndex]);
    setCurrentTrackIndex(prevIndex);
    setIsPlaying(true);
  };

  const toggleLike = (trackId: string) => {
    setTracks(prevTracks =>
      prevTracks.map(track =>
        track.id === trackId ? { ...track, isLiked: !track.isLiked } : track
      )
    );
  };

  const value: AppContextType = {
    // Theme
    isDark,
    toggleTheme,
    
    // Player
    tracks,
    currentTrack,
    isPlaying,
    currentTrackIndex,
    
    // Player actions
    setCurrentTrack,
    togglePlayPause,
    nextTrack,
    previousTrack,
    
    // Track actions
    toggleLike,
    
    // UI state
    isMobile,
    
    // Wallet
    wallet,
    
    // NFTs
    nfts,
    demoMode,
    toggleDemoMode,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};