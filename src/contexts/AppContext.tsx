'use client';

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Track } from '@/lib/mockData';
import { useWallet, UseWalletReturn, WalletState } from '@/hooks/useWallet';
import { useUserNFTs, UseUserNFTsReturn, NFTLoadingState } from '@/hooks/useUserNFTs';
import { MusicNFT } from '@/lib/nftService';
import { Playlist, PlaylistWithTracks, CreatePlaylistRequest, UpdatePlaylistRequest } from '@/lib/playlistTypes';
import { playlistService } from '@/lib/playlistService';
import { autoPlaylistService } from '@/lib/autoPlaylistService';
import { trackStatsService } from '@/lib/trackStatsService';

export enum RepeatMode {
  NONE = 'none',
  ALL = 'all',
  ONE = 'one'
}

interface AppContextType {
  // Theme
  isDark: boolean;
  toggleTheme: () => void;
  
  // Player
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTrackIndex: number;
  isShuffled: boolean;
  repeatMode: RepeatMode;
  shuffledIndices: number[];
  
  // Player actions
  setCurrentTrack: (track: Track) => void;
  togglePlayPause: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  
  // Track actions
  toggleLike: (trackId: string) => void;
  
  // UI state
  isMobile: boolean;
  
  // Wallet
  wallet: UseWalletReturn;
  
  // NFTs
  nfts: UseUserNFTsReturn;
  
  // Playlists
  playlists: Playlist[];
  autoPlaylists: Playlist[];
  currentPlaylist: PlaylistWithTracks | null;
  
  // Playlist actions
  createPlaylist: (request: CreatePlaylistRequest) => Playlist;
  updatePlaylist: (id: string, request: UpdatePlaylistRequest) => Playlist | null;
  deletePlaylist: (id: string) => boolean;
  addTrackToPlaylist: (playlistId: string, trackId: string) => boolean;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => boolean;
  reorderPlaylistTracks: (playlistId: string, trackIds: string[]) => boolean;
  setCurrentPlaylist: (playlist: PlaylistWithTracks | null) => void;
  refreshPlaylists: () => void;
  
  // Track statistics
  recordTrackPlay: (trackId: string, duration?: number, completed?: boolean) => void;
  getTrackStats: (trackId: string) => any;
  getOverallStats: () => any;
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
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [autoPlaylists, setAutoPlaylists] = useState<Playlist[]>([]);
  const [currentPlaylist, setCurrentPlaylist] = useState<PlaylistWithTracks | null>(null);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>(RepeatMode.NONE);
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);
  
  // Use ref to prevent infinite loops during track updates
  const isUpdatingTracksRef = useRef(false);
  
  // Fisher-Yates shuffle algorithm
  const shuffleArray = (array: number[]): number[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };
  
  // Generate shuffled indices for current track list
  const generateShuffledIndices = (trackList: Track[]): number[] => {
    const indices = Array.from({ length: trackList.length }, (_, i) => i);
    return shuffleArray(indices);
  };
  
  // Get the current track list based on context
  const getCurrentTrackList = (): Track[] => {
    return currentPlaylist ? currentPlaylist.tracks : tracks;
  };
  
  // Get the effective track index (considering shuffle)
  const getEffectiveTrackIndex = (trackList: Track[], logicalIndex: number): number => {
    if (!isShuffled || shuffledIndices.length === 0) {
      return logicalIndex;
    }
    return shuffledIndices[logicalIndex] || 0;
  };
  
  // Get logical index from actual track index
  const getLogicalIndex = (trackList: Track[], actualIndex: number): number => {
    if (!isShuffled || shuffledIndices.length === 0) {
      return actualIndex;
    }
    return shuffledIndices.indexOf(actualIndex);
  };
  
  // Initialize wallet hook
  const wallet = useWallet();
  
  // Initialize NFTs hook
  const nfts = useUserNFTs(wallet.walletInfo?.address);
  
  // Initialize playlists
  useEffect(() => {
    const loadedPlaylists = playlistService.getPlaylists();
    setPlaylists(loadedPlaylists);
  }, []);

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
    if (isUpdatingTracksRef.current) {
      return; // Prevent re-entrant updates
    }
    
    isUpdatingTracksRef.current = true;
    
    if (wallet.state === WalletState.CONNECTED) {
      // Use real NFT data when wallet is connected
      if (nfts.loadingState === NFTLoadingState.LOADED) {
        const nftTracks = convertNFTsToTracks(nfts.nfts);
        setTracks(nftTracks);
        console.log(`Updated tracks with ${nftTracks.length} NFTs`);
      } else if (nfts.loadingState === NFTLoadingState.IDLE || nfts.loadingState === NFTLoadingState.LOADING) {
        // Keep tracks empty while loading
        setTracks([]);
      }
    } else {
      // Use empty tracks when wallet is disconnected
      setTracks([]);
    }
    
    // Reset the flag after a short delay
    setTimeout(() => {
      isUpdatingTracksRef.current = false;
    }, 100);
  }, [wallet.state, nfts.loadingState, nfts.nfts]);

  // Reset current track if it's not in the tracks list (separate effect)
  useEffect(() => {
    if (currentTrack && tracks.length > 0 && !tracks.find(t => t.id === currentTrack.id)) {
      console.log('Resetting current track - not found in tracks list');
      setCurrentTrackState(null);
      setIsPlaying(false);
    }
  }, [tracks, currentTrack]);


  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newTheme);
  };


  const setCurrentTrack = (track: Track) => {
    const trackList = getCurrentTrackList();
    const actualIndex = trackList.findIndex(t => t.id === track.id);
    
    if (actualIndex >= 0) {
      const logicalIndex = getLogicalIndex(trackList, actualIndex);
      setCurrentTrackState(track);
      setCurrentTrackIndex(logicalIndex);
      setIsPlaying(true);
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    const trackList = getCurrentTrackList();
    
    if (trackList.length === 0) return;
    
    // Handle repeat one mode
    if (repeatMode === RepeatMode.ONE) {
      // Stay on the same track
      setIsPlaying(true);
      return;
    }
    
    let nextLogicalIndex: number;
    
    // Check if we're at the end of the list
    if (currentTrackIndex >= trackList.length - 1) {
      if (repeatMode === RepeatMode.ALL) {
        nextLogicalIndex = 0; // Start from beginning
      } else {
        // No repeat - stop playing
        setIsPlaying(false);
        return;
      }
    } else {
      nextLogicalIndex = currentTrackIndex + 1;
    }
    
    const actualIndex = getEffectiveTrackIndex(trackList, nextLogicalIndex);
    setCurrentTrackState(trackList[actualIndex]);
    setCurrentTrackIndex(nextLogicalIndex);
    setIsPlaying(true);
  };

  const previousTrack = () => {
    const trackList = getCurrentTrackList();
    
    if (trackList.length === 0) return;
    
    // Handle repeat one mode
    if (repeatMode === RepeatMode.ONE) {
      // Stay on the same track
      setIsPlaying(true);
      return;
    }
    
    const prevLogicalIndex = currentTrackIndex === 0 ? trackList.length - 1 : currentTrackIndex - 1;
    const actualIndex = getEffectiveTrackIndex(trackList, prevLogicalIndex);
    
    setCurrentTrackState(trackList[actualIndex]);
    setCurrentTrackIndex(prevLogicalIndex);
    setIsPlaying(true);
  };

  const toggleShuffle = () => {
    const trackList = getCurrentTrackList();
    
    if (!isShuffled) {
      // Turning shuffle on
      const newShuffledIndices = generateShuffledIndices(trackList);
      setShuffledIndices(newShuffledIndices);
      setIsShuffled(true);
      
      // Update current track index to maintain current song
      if (currentTrack) {
        const actualIndex = trackList.findIndex(t => t.id === currentTrack.id);
        const newLogicalIndex = newShuffledIndices.indexOf(actualIndex);
        setCurrentTrackIndex(newLogicalIndex);
      }
    } else {
      // Turning shuffle off
      setIsShuffled(false);
      setShuffledIndices([]);
      
      // Update current track index to maintain current song
      if (currentTrack) {
        const actualIndex = trackList.findIndex(t => t.id === currentTrack.id);
        setCurrentTrackIndex(actualIndex);
      }
    }
  };
  
  const toggleRepeat = () => {
    switch (repeatMode) {
      case RepeatMode.NONE:
        setRepeatMode(RepeatMode.ALL);
        break;
      case RepeatMode.ALL:
        setRepeatMode(RepeatMode.ONE);
        break;
      case RepeatMode.ONE:
        setRepeatMode(RepeatMode.NONE);
        break;
    }
  };
  
  const toggleLike = (trackId: string) => {
    setTracks(prevTracks =>
      prevTracks.map(track =>
        track.id === trackId ? { ...track, isLiked: !track.isLiked } : track
      )
    );
  };
  
  // Playlist management functions
  const createPlaylist = (request: CreatePlaylistRequest): Playlist => {
    const newPlaylist = playlistService.createPlaylist(request);
    setPlaylists(playlistService.getPlaylists());
    return newPlaylist;
  };
  
  const updatePlaylist = (id: string, request: UpdatePlaylistRequest): Playlist | null => {
    const updatedPlaylist = playlistService.updatePlaylist(id, request);
    if (updatedPlaylist) {
      setPlaylists(playlistService.getPlaylists());
      // Update current playlist if it's the one being edited
      if (currentPlaylist && currentPlaylist.id === id) {
        const updatedCurrentPlaylist = playlistService.getPlaylistWithTracks(id, tracks);
        setCurrentPlaylist(updatedCurrentPlaylist);
      }
    }
    return updatedPlaylist;
  };
  
  const deletePlaylist = (id: string): boolean => {
    const success = playlistService.deletePlaylist(id);
    if (success) {
      setPlaylists(playlistService.getPlaylists());
      // Clear current playlist if it's the one being deleted
      if (currentPlaylist && currentPlaylist.id === id) {
        setCurrentPlaylist(null);
      }
    }
    return success;
  };
  
  const addTrackToPlaylist = (playlistId: string, trackId: string): boolean => {
    const success = playlistService.addTrackToPlaylist(playlistId, trackId);
    if (success) {
      setPlaylists(playlistService.getPlaylists());
      // Update current playlist if it's the one being modified
      if (currentPlaylist && currentPlaylist.id === playlistId) {
        const updatedCurrentPlaylist = playlistService.getPlaylistWithTracks(playlistId, tracks);
        setCurrentPlaylist(updatedCurrentPlaylist);
      }
    }
    return success;
  };
  
  const removeTrackFromPlaylist = (playlistId: string, trackId: string): boolean => {
    const success = playlistService.removeTrackFromPlaylist(playlistId, trackId);
    if (success) {
      setPlaylists(playlistService.getPlaylists());
      // Update current playlist if it's the one being modified
      if (currentPlaylist && currentPlaylist.id === playlistId) {
        const updatedCurrentPlaylist = playlistService.getPlaylistWithTracks(playlistId, tracks);
        setCurrentPlaylist(updatedCurrentPlaylist);
      }
    }
    return success;
  };
  
  const reorderPlaylistTracks = (playlistId: string, trackIds: string[]): boolean => {
    const success = playlistService.reorderPlaylistTracks(playlistId, trackIds);
    if (success) {
      setPlaylists(playlistService.getPlaylists());
      // Update current playlist if it's the one being modified
      if (currentPlaylist && currentPlaylist.id === playlistId) {
        const updatedCurrentPlaylist = playlistService.getPlaylistWithTracks(playlistId, tracks);
        setCurrentPlaylist(updatedCurrentPlaylist);
      }
    }
    return success;
  };
  
  const refreshPlaylists = () => {
    setPlaylists(playlistService.getPlaylists());
  };
  
  const recordTrackPlay = (trackId: string, duration: number = 0, completed: boolean = false) => {
    trackStatsService.recordPlay(trackId, duration, completed);
    
    // Update auto-playlists after recording play
    const generatedAutoPlaylists = autoPlaylistService.generateAutoPlaylists(tracks);
    setAutoPlaylists(generatedAutoPlaylists);
  };
  
  const getTrackStats = (trackId: string) => {
    return trackStatsService.getTrackStats(trackId);
  };
  
  const getOverallStats = () => {
    return trackStatsService.getOverallStats();
  };
  
  const setCurrentPlaylistHandler = (playlist: PlaylistWithTracks | null) => {
    setCurrentPlaylist(playlist);
  };
  
  // Update current playlist when tracks change
  useEffect(() => {
    if (currentPlaylist) {
      const updatedCurrentPlaylist = playlistService.getPlaylistWithTracks(currentPlaylist.id, tracks);
      // Only update if there are actual changes
      if (updatedCurrentPlaylist && updatedCurrentPlaylist.tracks.length !== currentPlaylist.tracks.length) {
        setCurrentPlaylist(updatedCurrentPlaylist);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracks, currentPlaylist?.id, currentPlaylist?.tracks.length]);
  
  // Update shuffled indices when track list changes
  useEffect(() => {
    if (isShuffled) {
      const trackList = getCurrentTrackList();
      if (trackList.length > 0) {
        const newShuffledIndices = generateShuffledIndices(trackList);
        setShuffledIndices(newShuffledIndices);
        
        // Maintain current track if it exists
        if (currentTrack) {
          const actualIndex = trackList.findIndex(t => t.id === currentTrack.id);
          if (actualIndex >= 0) {
            const newLogicalIndex = newShuffledIndices.indexOf(actualIndex);
            setCurrentTrackIndex(newLogicalIndex);
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracks, currentPlaylist?.tracks, isShuffled]);

  const value: AppContextType = {
    // Theme
    isDark,
    toggleTheme,
    
    // Player
    tracks,
    currentTrack,
    isPlaying,
    currentTrackIndex,
    isShuffled,
    repeatMode,
    shuffledIndices,
    
    // Player actions
    setCurrentTrack,
    togglePlayPause,
    nextTrack,
    previousTrack,
    toggleShuffle,
    toggleRepeat,
    
    // Track actions
    toggleLike,
    
    // UI state
    isMobile,
    
    // Wallet
    wallet,
    
    // NFTs
    nfts,
    
    // Playlists
    playlists,
    autoPlaylists,
    currentPlaylist,
    
    // Playlist actions
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    reorderPlaylistTracks,
    setCurrentPlaylist: setCurrentPlaylistHandler,
    refreshPlaylists,
    
    // Track statistics
    recordTrackPlay,
    getTrackStats,
    getOverallStats,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};