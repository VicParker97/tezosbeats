'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Music, Clock, Heart, Package, Wallet, Loader2, AlertCircle, FlaskConical, RefreshCw } from 'lucide-react';
import TrackItem from './TrackItem';
import { TrackListSkeleton, NFTLoadingCard, LoadingProgressState } from './LoadingStates';
import { NoMusicNFTsState, WalletNotConnectedState, ErrorState } from './EmptyStates';
import { useApp } from '@/contexts/AppContext';
import { WalletState } from '@/hooks/useWallet';
import { NFTLoadingState } from '@/hooks/useUserNFTs';

interface Track {
  id: string;
  title: string;
  artist: string;
  cover: string;
  duration: number;
  collection: string;
  isLiked: boolean;
}

interface MainContentProps {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlay: (track: Track) => void;
  onLike: (trackId: string) => void;
}

export default function MainContent({ 
  tracks, 
  currentTrack, 
  isPlaying, 
  onPlay, 
  onLike 
}: MainContentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { wallet, nfts, demoMode, toggleDemoMode } = useApp();

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
              {searchQuery ? 'No tracks found' : (demoMode ? 'No demo tracks loaded' : 'No music NFTs found')}
            </h3>
            <p className="text-sm md:text-base text-muted-foreground mb-4">
              {searchQuery 
                ? 'Try adjusting your search terms'
                : (demoMode 
                    ? 'Demo mode is active but no tracks were loaded'
                    : 'Your wallet doesn\'t contain any music NFTs yet'
                  )
              }
            </p>
            {!searchQuery && (
              <div className="flex gap-2 justify-center">
                {!demoMode && (
                  <Button onClick={toggleDemoMode} variant="secondary">
                    <FlaskConical className="w-4 h-4 mr-2" />
                    Try Demo Mode
                  </Button>
                )}
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

  const stats = [
    {
      title: 'Total NFTs',
      value: (wallet.isConnected || demoMode) ? tracks.length.toString() : '0',
      icon: Music,
      description: demoMode ? 'Demo tracks available' : 'Music NFTs in collection'
    },
    {
      title: 'Recently Played',
      value: (wallet.isConnected || demoMode) ? (demoMode ? '3' : '12') : '0',
      icon: Clock,
      description: 'Tracks played this week'
    },
    {
      title: 'Favorite Genre',
      value: (wallet.isConnected || demoMode) ? 'Electronic' : 'N/A',
      icon: Heart,
      description: 'Most played genre'
    },
    {
      title: 'Collections',
      value: (wallet.isConnected || demoMode) ? new Set(tracks.map(t => t.collection)).size.toString() : '0',
      icon: Package,
      description: 'Unique collections'
    }
  ];

  // Render different states based on wallet connection
  const renderWalletState = () => {
    // In demo mode, always show tracks regardless of wallet state
    if (demoMode) {
      return renderTrackList();
    }

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
    <div className={`flex-1 p-3 md:p-6 overflow-y-auto ${currentTrack ? 'pb-20' : 'pb-3'}`}>
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-card to-card/80">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1 hidden md:block">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search Bar - Show when connected or in demo mode */}
      {(wallet.isConnected || demoMode) && (
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

      {/* Track List Header - Show when connected or in demo mode */}
      {(wallet.isConnected || demoMode) && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              {searchQuery ? `Results (${filteredTracks.length})` : (demoMode ? 'Demo Music' : 'Your Music NFTs')}
            </h2>
            {demoMode && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-full">
                <FlaskConical className="w-3 h-3" />
                Demo Mode
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {demoMode && (
              <Button onClick={toggleDemoMode} variant="ghost" size="sm" className="text-xs md:text-sm">
                Exit Demo
              </Button>
            )}
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
    </div>
  );
}