'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Music, 
  Home, 
  Disc, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Sun, 
  Moon,
  Wallet,
  Loader2,
  AlertCircle,
  ListMusic,
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useApp, RepeatMode } from '@/contexts/AppContext';
import { WalletState } from '@/hooks/useWallet';
import KeyboardShortcutsHelp from './KeyboardShortcutsHelp';
import PlaylistPanel from './PlaylistPanel';

interface SidebarProps {
  onThemeToggle: () => void;
  isDark: boolean;
  activeSection?: string;
  onSectionChange?: (section: string) => void;
  isMobile?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ 
  onThemeToggle, 
  isDark, 
  activeSection = 'home',
  onSectionChange,
  isMobile = false,
  onClose
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showPlaylistPanel, setShowPlaylistPanel] = useState(false);
  const { 
    wallet, 
    currentTrack, 
    isPlaying, 
    togglePlayPause, 
    nextTrack, 
    previousTrack,
    isShuffled,
    repeatMode,
    toggleShuffle,
    toggleRepeat
  } = useApp();

  // Format duration in MM:SS format
  const formatDuration = (seconds: number): string => {
    if (!seconds || isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const navigationItems = [
    { id: 'home', label: 'Home', icon: Home },
    ...(wallet.state === WalletState.CONNECTED ? [
      { id: 'nfts', label: 'Meine NFTs', icon: Disc },
      { id: 'playlists', label: 'Playlists', icon: ListMusic, onClick: () => setShowPlaylistPanel(!showPlaylistPanel) },
      { id: 'search', label: 'Suchen', icon: Search },
    ] : [])
  ];

  return (
    <div className="flex h-full">
      {/* Main Sidebar */}
      <div className={`${isCollapsed ? 'w-16' : 'w-64'} h-full bg-background border-r border-border transition-all duration-300 flex flex-col`}>
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
          <Music className="w-6 h-6 text-primary" />
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-foreground">TezosBeats</h1>
          )}
        </div>
        {isMobile ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-8 h-8"
          >
            <X className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-8 h-8"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        )}
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeSection === item.id || (item.id === 'playlists' && showPlaylistPanel) ? 'secondary' : 'ghost'}
              className={`w-full ${isCollapsed ? 'justify-center px-2' : 'justify-start'} h-10`}
              onClick={() => {
                if (item.onClick) {
                  item.onClick();
                } else {
                  onSectionChange?.(item.id);
                }
              }}
            >
              <Icon className="w-4 h-4" />
              {!isCollapsed && <span className="ml-3">{item.label}</span>}
            </Button>
          );
        })}
      </nav>

      {/* Music Controls */}
      {currentTrack && (
        <>
          <Separator />
          <div className="p-4 space-y-3">
            {/* Current Track Info with Album Art */}
            {!isCollapsed && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground font-medium">Now Playing</p>
                
                {/* Track info with album art */}
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 rounded-lg flex-shrink-0">
                    <AvatarImage 
                      src={currentTrack.cover} 
                      alt={`Album cover for ${currentTrack.title}`}
                      className="object-cover"
                    />
                    <AvatarFallback className="rounded-lg">
                      <Music className="w-6 h-6 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-sm font-medium truncate" title={currentTrack.title}>
                      {currentTrack.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate" title={currentTrack.artist}>
                      {currentTrack.artist}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDuration(currentTrack.duration)}
                      {currentTrack.audioUrl ? '' : ' • No audio'}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Collapsed mode - just show album art */}
            {isCollapsed && (
              <div className="flex justify-center">
                <Avatar className="w-10 h-10 rounded-lg">
                  <AvatarImage 
                    src={currentTrack.cover} 
                    alt={`Album cover for ${currentTrack.title}`}
                    className="object-cover"
                  />
                  <AvatarFallback className="rounded-lg">
                    <Music className="w-5 h-5 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
            
            {/* Controls */}
            <div className={`flex items-center gap-1 ${isCollapsed ? 'flex-col' : 'justify-center'}`}>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleShuffle}
                className={`w-8 h-8 ${isShuffled ? 'text-primary' : 'text-muted-foreground'} hover:text-primary transition-colors`}
                title={`Shuffle: ${isShuffled ? 'On' : 'Off'}`}
              >
                <Shuffle className="w-3 h-3" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={previousTrack}
                className="w-8 h-8 text-muted-foreground hover:text-foreground transition-colors"
                title="Previous track"
              >
                <SkipBack className="w-3 h-3" />
              </Button>
              
              <Button
                variant="default"
                size="icon"
                onClick={togglePlayPause}
                className="w-10 h-10 shadow-lg hover:shadow-xl transition-all"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4 ml-0.5" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={nextTrack}
                className="w-8 h-8 text-muted-foreground hover:text-foreground transition-colors"
                title="Next track"
              >
                <SkipForward className="w-3 h-3" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleRepeat}
                className={`w-8 h-8 ${repeatMode !== RepeatMode.NONE ? 'text-primary' : 'text-muted-foreground'} hover:text-primary transition-colors`}
                title={`Repeat: ${repeatMode === RepeatMode.NONE ? 'Off' : repeatMode === RepeatMode.ALL ? 'All' : 'One'}`}
              >
                {repeatMode === RepeatMode.ONE ? (
                  <Repeat1 className="w-3 h-3" />
                ) : (
                  <Repeat className="w-3 h-3" />
                )}
              </Button>
            </div>
          </div>
        </>
      )}

      <Separator />

      {/* Bottom section */}
      <div className="p-4 space-y-2">
        {/* Theme and Shortcuts */}
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size={isCollapsed ? 'icon' : 'default'}
            onClick={onThemeToggle}
            className={`${isCollapsed ? 'w-full justify-center px-2' : 'flex-1 justify-start'} h-10`}
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {!isCollapsed && <span className="ml-3">Theme</span>}
          </Button>
          {!isCollapsed && <KeyboardShortcutsHelp />}
        </div>

        {/* Wallet connection */}
        {wallet.state === WalletState.CONNECTED ? (
          <div className="space-y-2">
            {!isCollapsed && (
              <div className="px-3 py-2 bg-primary/10 rounded-lg">
                <div className="text-xs text-muted-foreground">Connected</div>
                <div className="text-sm font-medium text-primary truncate">
                  {wallet.formatAddress(wallet.walletInfo?.address || '')}
                </div>
                <div className="text-xs text-muted-foreground">
                  {wallet.walletInfo?.balance}
                </div>
              </div>
            )}
            <Button
              variant="outline"
              size={isCollapsed ? 'icon' : 'default'}
              className={`w-full ${isCollapsed ? 'justify-center px-2' : 'justify-start'} h-10`}
              onClick={wallet.disconnect}
            >
              <Wallet className="w-4 h-4" />
              {!isCollapsed && <span className="ml-3">Disconnect</span>}
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size={isCollapsed ? 'icon' : 'default'}
            className={`w-full ${isCollapsed ? 'justify-center px-2' : 'justify-start'} h-10`}
            onClick={wallet.connect}
            disabled={wallet.isConnecting}
          >
            {wallet.isConnecting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : wallet.state === WalletState.ERROR ? (
              <AlertCircle className="w-4 h-4" />
            ) : (
              <Wallet className="w-4 h-4" />
            )}
            {!isCollapsed && (
              <span className="ml-3">
                {wallet.isConnecting ? 'Connecting...' : 
                 wallet.state === WalletState.ERROR ? 'Retry' : 'Connect Wallet'}
              </span>
            )}
          </Button>
        )}
        
        {/* Error message */}
        {wallet.error && !isCollapsed && (
          <div className="px-3 py-2 bg-destructive/10 rounded-lg">
            <div className="text-xs text-destructive">
              {wallet.error.message}
            </div>
          </div>
        )}
      </div>
      </div>

      {/* Playlist Panel */}
      {showPlaylistPanel && !isCollapsed && (
        <div className="w-80 h-full">
          <PlaylistPanel
            onPlaylistSelect={() => {
              onSectionChange?.('playlists');
              setShowPlaylistPanel(false);
            }}
            onClose={() => setShowPlaylistPanel(false)}
          />
        </div>
      )}
    </div>
  );
}