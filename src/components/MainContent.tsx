'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Music, Wallet, Loader2, AlertCircle, RefreshCw, ListMusic } from 'lucide-react';
import PlaylistManager from './PlaylistManager';
import PlaylistEditor from './PlaylistEditor';
import HomePage from './HomePage';
import { Playlist } from '@/lib/playlistTypes';
import TrackItem from './TrackItem';
import { TrackListSkeleton, NFTLoadingCard } from './LoadingStates';
import { WalletNotConnectedState, ErrorState } from './EmptyStates';
import { useApp } from '@/contexts/AppContext';
import { WalletState } from '@/hooks/useWallet';
import { NFTLoadingState } from '@/hooks/useUserNFTs';
import { Track } from '@/lib/mockData';

interface MainContentProps {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlay: (track: Track) => void;
  onLike: (trackId: string) => void;
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export default function MainContent({ 
  tracks, 
  currentTrack, 
  isPlaying, 
  onPlay, 
  onLike,
  activeSection = 'home',
  onSectionChange
}: MainContentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const { wallet, nfts, currentPlaylist } = useApp();
  

  const filteredTracks = tracks.filter(track =>
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.collection.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render track list (used in both connected and demo modes)
  const renderTrackList = () => {
    return (
      <div className="space-y-1">
        {filteredTracks.length > 0 ? (
          filteredTracks.map((track) => (
            <TrackItem
              key={track.id}
              track={track}
              isPlaying={isPlaying}
              isCurrentTrack={currentTrack?.id === track.id}
              onPlay={onPlay}
              onLike={onLike}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchQuery ? 'No tracks found' : 'No music NFTs found'}
            </h3>
            <p className="text-sm md:text-base text-muted-foreground mb-4">
              {searchQuery 
                ? 'Try adjusting your search terms'
                : 'Your wallet doesn\'t contain any music NFTs yet'
              }
            </p>
            {!searchQuery && (
              <div className="flex gap-2 justify-center">
                <Button onClick={nfts.refreshNFTs} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };


  // Render different states based on wallet connection
  const renderWalletState = () => {
    switch (wallet.state) {
      case WalletState.DISCONNECTED:
        return (
          <WalletNotConnectedState onConnect={wallet.connect} />
        );
      
      case WalletState.CONNECTING:
        return (
          <div className="text-center py-12">
            <Loader2 className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Connecting to wallet
            </h3>
            <p className="text-sm md:text-base text-muted-foreground">
              Please approve the connection in your wallet
            </p>
          </div>
        );
      
      case WalletState.ERROR:
        return (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Connection failed
            </h3>
            <p className="text-sm md:text-base text-destructive mb-4">
              {wallet.error?.message || 'Failed to connect wallet'}
            </p>
            <Button onClick={wallet.connect} variant="outline">
              <Wallet className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        );
      
      case WalletState.CONNECTED:
        // Show loading state while fetching NFTs
        if (nfts.loadingState === NFTLoadingState.LOADING) {
          return (
            <div className="space-y-6">
              <NFTLoadingCard />
              <TrackListSkeleton count={3} />
            </div>
          );
        }

        // Show error state
        if (nfts.loadingState === NFTLoadingState.ERROR) {
          return (
            <ErrorState
              title="Failed to load NFTs"
              description={nfts.error || 'Unable to fetch your music NFTs'}
              onRetry={nfts.refreshNFTs}
            />
          );
        }

        // Show tracks or empty state
        return renderTrackList();
      
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 p-3 md:p-6 overflow-y-auto">

      {/* Render content based on active section */}
      {activeSection === 'home' ? (
        <HomePage onSectionChange={onSectionChange} />
      ) : activeSection === 'playlists' ? (
        editingPlaylist ? (
          <PlaylistEditor
            playlist={editingPlaylist}
            onBack={() => setEditingPlaylist(null)}
          />
        ) : (
          <PlaylistManager
            onPlaylistSelect={async (playlist) => {
              const { playlistService } = await import('@/lib/playlistService');
              const playlistWithTracks = playlistService.getPlaylistWithTracks(playlist.id, tracks);
              if (playlistWithTracks) {
                setEditingPlaylist(playlistWithTracks);
              }
            }}
          />
        )
      ) : activeSection === 'nfts' || activeSection === 'search' ? (
        <>
          {/* Search Bar - Show when connected */}
          {wallet.isConnected && (
            <div className="relative mb-6 md:mb-8">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tracks, artists, or collections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 text-sm md:text-base bg-background/50 backdrop-blur-sm border-2 border-border/50 focus:border-primary/50 transition-all duration-300 rounded-xl"
              />
            </div>
          )}

          {/* Track List Header - Show when connected */}
          {wallet.isConnected && (
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  {searchQuery ? `Results (${filteredTracks.length})` : activeSection === 'search' ? 'Search Music NFTs' : 'Your Music NFTs'}
                </h2>
                {currentPlaylist && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-full">
                    <ListMusic className="w-3 h-3" />
                    Playing: {currentPlaylist.name}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="text-xs md:text-sm hover:bg-primary/10 transition-all duration-200">
                  Sort
                </Button>
                <Button variant="outline" size="sm" className="text-xs md:text-sm hover:bg-primary/10 transition-all duration-200">
                  Filter
                </Button>
              </div>
            </div>
          )}

          {/* Content based on wallet state */}
          {renderWalletState()}
        </>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Section Not Found</h2>
          <p className="text-muted-foreground">The requested section could not be found.</p>
        </div>
      )}
    </div>
  );
}