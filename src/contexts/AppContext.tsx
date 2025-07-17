'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { Track } from '@/lib/mockData';
import { useWallet, UseWalletReturn, WalletState } from '@/hooks/useWallet';
import { useUserNFTs, UseUserNFTsReturn, NFTLoadingState } from '@/hooks/useUserNFTs';
import { useTezRadio, UseTezRadioReturn, TezRadioLoadingState } from '@/hooks/useTezRadio';
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
  isShuffled: boolean;
  repeatMode: RepeatMode;
  playQueue: Track[];
  queueIndex: number;
  currentTime: number;
  duration: number;
  isLoading: boolean;
  
  // Player actions
  setCurrentTrack: (track: Track) => void;
  togglePlayPause: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  seekTo: (time: number) => void;
  updateProgress: (currentTime: number, duration: number) => void;
  setLoading: (loading: boolean) => void;
  
  // Track actions
  toggleLike: (trackId: string) => void;
  
  // UI state
  isMobile: boolean;
  isMobilePlayerOpen: boolean;
  openMobilePlayer: () => void;
  closeMobilePlayer: () => void;
  
  // Wallet
  wallet: UseWalletReturn;
  
  // NFTs
  nfts: UseUserNFTsReturn;
  
  // TezRadio
  tezRadio: UseTezRadioReturn;
  
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
  getTrackStats: (trackId: string) => unknown;
  getOverallStats: () => unknown;
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
  const [isMobile, setIsMobile] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [autoPlaylists, setAutoPlaylists] = useState<Playlist[]>([]);
  const [currentPlaylist, setCurrentPlaylist] = useState<PlaylistWithTracks | null>(null);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>(RepeatMode.NONE);
  const [playQueue, setPlayQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobilePlayerOpen, setIsMobilePlayerOpen] = useState(false);
  const [seekingRef] = useState({ current: null as number | null });
  
  // Use ref to prevent infinite loops during track updates
  const isUpdatingTracksRef = useRef(false);
  
  // Get the current track list based on context
  const getCurrentTrackList = (): Track[] => {
    return currentPlaylist ? currentPlaylist.tracks : tracks;
  };
  
  // Generate play queue with optional shuffle
  const generatePlayQueue = (sourceList: Track[], shuffle: boolean): Track[] => {
    if (sourceList.length === 0) return [];
    
    if (shuffle) {
      // Fisher-Yates shuffle of actual tracks
      const shuffled = [...sourceList];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    }
    
    return [...sourceList]; // Copy to avoid mutations
  };
  
  // Initialize wallet hook
  const wallet = useWallet();
  
  // Initialize NFTs hook
  const nfts = useUserNFTs(wallet.walletInfo?.address);
  
  // Initialize TezRadio hook with wallet address  
  const tezRadio = useTezRadio(wallet.walletInfo?.address);
  
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

  // Merge NFT data with TezRadio audio streaming
  const mergeNFTsWithTezRadio = (nftTracks: MusicNFT[], tezRadioTracks: MusicNFT[]): MusicNFT[] => {
    const tezRadioLookup = new Map();
    
    // Create lookup map for TezRadio tracks by contract and token ID
    tezRadioTracks.forEach(track => {
      if (track.contractAddress && track.tokenId) {
        const key = `${track.contractAddress}_${track.tokenId}`;
        tezRadioLookup.set(key, track);
      }
    });
    
    // Merge NFT tracks with TezRadio audio URLs and enhanced metadata
    const mergedTracks = nftTracks.map(nft => {
      const lookupKey = `${nft.contractAddress}_${nft.tokenId}`;
      const tezRadioMatch = tezRadioLookup.get(lookupKey);
      
      if (tezRadioMatch) {
        console.log(`Enhanced NFT with TezRadio audio: ${nft.title}`);
        return {
          ...nft,
          // Use TezRadio's audio URL if available
          audioUrl: tezRadioMatch.audioUrl || nft.audioUrl,
          // Use TezRadio's enhanced metadata when available
          title: tezRadioMatch.title || nft.title,
          artist: tezRadioMatch.artist || nft.artist,
          duration: tezRadioMatch.duration || nft.duration,
          cover: tezRadioMatch.cover || nft.cover,
        };
      }
      
      return nft;
    });
    
    console.log(`Merged ${nftTracks.length} NFTs with ${tezRadioTracks.length} TezRadio tracks, ${tezRadioLookup.size} potential matches`);
    return mergedTracks;
  };

  // Separate effect to trigger TezRadio fetching when NFTs are loaded
  useEffect(() => {
    if (wallet.state === WalletState.CONNECTED && 
        nfts.loadingState === NFTLoadingState.LOADED && 
        nfts.nfts.length > 0 &&
        tezRadio.loadingState === TezRadioLoadingState.IDLE) {
      
      // Extract contract/token pairs from NFT tracks
      const tokenPairs = nfts.nfts
        .filter(nft => nft.contractAddress && nft.tokenId)
        .map(nft => ({
          contractAddress: nft.contractAddress!,
          tokenId: nft.tokenId!
        }));
      
      if (tokenPairs.length > 0) {
        console.log(`NFTs loaded, fetching TezRadio data for ${tokenPairs.length} tokens`);
        tezRadio.fetchTracksByTokens(tokenPairs);
      }
    }
  }, [wallet.state, nfts.loadingState, nfts.nfts.length, tezRadio.loadingState]);

  // Update tracks based on wallet state, NFTs, and TezRadio data
  useEffect(() => {
    if (isUpdatingTracksRef.current) {
      return; // Prevent re-entrant updates
    }
    
    isUpdatingTracksRef.current = true;
    
    if (wallet.state === WalletState.CONNECTED) {
      // Get NFTs from TzKT API
      const nftTracks = nfts.loadingState === NFTLoadingState.LOADED ? nfts.nfts : [];
      
      // Merge NFT data with TezRadio audio when both are loaded
      let mergedNFTs: MusicNFT[] = [];
      if (nfts.loadingState === NFTLoadingState.LOADED) {
        const tezRadioTracks = tezRadio.loadingState === TezRadioLoadingState.LOADED ? tezRadio.tracks : [];
        
        if (tezRadio.loadingState === TezRadioLoadingState.LOADED) {
          // Both sources loaded - merge them
          mergedNFTs = mergeNFTsWithTezRadio(nftTracks, tezRadioTracks);
        } else {
          // Only NFTs loaded - use NFT data (TezRadio still loading)
          mergedNFTs = nftTracks;
        }
      }
      
      const finalTracks = convertNFTsToTracks(mergedNFTs);
      
      setTracks(finalTracks);
      console.log(`Updated tracks: ${finalTracks.length} (${nftTracks.length} NFTs + ${tezRadio.tracks.length} TezRadio)`, {
        walletAddress: wallet.walletInfo?.address,
        nftLoadingState: nfts.loadingState,
        tezRadioLoadingState: tezRadio.loadingState,
        nftError: nfts.error,
        tezRadioError: tezRadio.error,
        mergedCount: mergedNFTs.length,
        sampleTrack: finalTracks[0] || null
      });
    } else {
      // Clear everything when wallet is disconnected
      setTracks([]);
      setCurrentTrackState(null);
      setIsPlaying(false);
      setPlayQueue([]);
      setQueueIndex(0);
      setCurrentPlaylist(null);
      setCurrentTime(0);
      setDuration(0);
      setIsLoading(false);
      console.log('Wallet disconnected - cleared player state');
    }
    
    // Reset the flag after a short delay
    setTimeout(() => {
      isUpdatingTracksRef.current = false;
    }, 100);
  }, [wallet.state, wallet.walletInfo?.address, nfts.loadingState, nfts.nfts, tezRadio.loadingState, tezRadio.tracks, nfts.error, tezRadio.error]);

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
    const sourceList = getCurrentTrackList();
    
    // Generate queue if needed or if source changed
    if (playQueue.length === 0 || playQueue.length !== sourceList.length) {
      const newQueue = generatePlayQueue(sourceList, isShuffled);
      setPlayQueue(newQueue);
      
      // Find track in new queue
      const trackIndex = newQueue.findIndex(t => t.id === track.id);
      if (trackIndex >= 0) {
        setQueueIndex(trackIndex);
        setCurrentTrackState(track);
        setIsPlaying(true);
      }
    } else {
      // Find track in current queue
      const trackIndex = playQueue.findIndex(t => t.id === track.id);
      if (trackIndex >= 0) {
        setQueueIndex(trackIndex);
        setCurrentTrackState(track);
        setIsPlaying(true);
      }
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    if (playQueue.length === 0) return;
    
    // Handle repeat one mode - stay on current track
    if (repeatMode === RepeatMode.ONE) {
      setIsPlaying(true);
      return;
    }
    
    // Check if at end of queue
    if (queueIndex >= playQueue.length - 1) {
      if (repeatMode === RepeatMode.ALL) {
        // Go to start of queue
        setQueueIndex(0);
        setCurrentTrackState(playQueue[0]);
        setIsPlaying(true);
      } else {
        // No repeat - stop playing
        setIsPlaying(false);
      }
      return;
    }
    
    // Move to next track in queue
    const nextIndex = queueIndex + 1;
    setQueueIndex(nextIndex);
    setCurrentTrackState(playQueue[nextIndex]);
    setIsPlaying(true);
  };

  const previousTrack = () => {
    if (playQueue.length === 0) return;
    
    // Handle repeat one mode - stay on current track
    if (repeatMode === RepeatMode.ONE) {
      setIsPlaying(true);
      return;
    }
    
    // Check if at beginning of queue
    if (queueIndex <= 0) {
      if (repeatMode === RepeatMode.ALL) {
        // Go to end of queue
        const lastIndex = playQueue.length - 1;
        setQueueIndex(lastIndex);
        setCurrentTrackState(playQueue[lastIndex]);
        setIsPlaying(true);
      } else {
        // No repeat - stop playing or stay at first track
        setIsPlaying(false);
      }
      return;
    }
    
    // Move to previous track in queue
    const prevIndex = queueIndex - 1;
    setQueueIndex(prevIndex);
    setCurrentTrackState(playQueue[prevIndex]);
    setIsPlaying(true);
  };

  const toggleShuffle = () => {
    const sourceList = getCurrentTrackList();
    if (sourceList.length === 0) return;
    
    const newShuffleState = !isShuffled;
    
    // Generate new queue with shuffle state
    const newQueue = generatePlayQueue(sourceList, newShuffleState);
    
    // Find current track in new queue
    let newIndex = 0;
    if (currentTrack) {
      newIndex = newQueue.findIndex(t => t.id === currentTrack.id);
      if (newIndex === -1) newIndex = 0;
    }
    
    setIsShuffled(newShuffleState);
    setPlayQueue(newQueue);
    setQueueIndex(newIndex);
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
  
  const seekTo = useCallback((time: number) => {
    console.log('Seeking to:', time);
    seekingRef.current = time;
    setCurrentTime(time);
    // Clear seeking flag after a short delay
    setTimeout(() => {
      seekingRef.current = null;
    }, 100);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateProgress = useCallback((currentTime: number, duration: number) => {
    if (seekingRef.current === null) {
      setCurrentTime(currentTime);
    }
    setDuration(duration);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLoadingState = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  const openMobilePlayer = useCallback(() => {
    setIsMobilePlayerOpen(true);
  }, []);

  const closeMobilePlayer = useCallback(() => {
    setIsMobilePlayerOpen(false);
  }, []);

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
  
  // Update play queue when track list changes
  useEffect(() => {
    const sourceList = getCurrentTrackList();
    
    if (sourceList.length > 0) {
      // Regenerate queue when source changes significantly
      if (playQueue.length !== sourceList.length) {
        const newQueue = generatePlayQueue(sourceList, isShuffled);
        setPlayQueue(newQueue);
        
        // Maintain current track if it exists
        if (currentTrack) {
          const trackIndex = newQueue.findIndex(t => t.id === currentTrack.id);
          setQueueIndex(trackIndex >= 0 ? trackIndex : 0);
        } else {
          setQueueIndex(0);
        }
      }
    } else {
      // Clear queue when no tracks
      setPlayQueue([]);
      setQueueIndex(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracks.length, currentPlaylist?.tracks.length]);

  const value: AppContextType = {
    // Theme
    isDark,
    toggleTheme,
    
    // Player
    tracks,
    currentTrack,
    isPlaying,
    isShuffled,
    repeatMode,
    playQueue,
    queueIndex,
    currentTime,
    duration,
    isLoading,
    
    // Player actions
    setCurrentTrack,
    togglePlayPause,
    nextTrack,
    previousTrack,
    toggleShuffle,
    toggleRepeat,
    seekTo,
    updateProgress,
    setLoading: setLoadingState,
    
    // Track actions
    toggleLike,
    
    // UI state
    isMobile,
    isMobilePlayerOpen,
    openMobilePlayer,
    closeMobilePlayer,
    
    // Wallet
    wallet,
    
    // NFTs
    nfts,
    
    // TezRadio
    tezRadio,
    
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