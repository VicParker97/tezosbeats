'use client';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useApp } from '@/contexts/AppContext';
import { 
  Music,
  Play,
  Pause,
  SkipForward,
} from 'lucide-react';

export default function MobilePlayerBar() {
  const { 
    currentTrack, 
    isPlaying, 
    togglePlayPause, 
    nextTrack,
    openMobilePlayer,
    isLoading
  } = useApp();

  if (!currentTrack) return null;

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-t border-border"
      onClick={openMobilePlayer}
    >
      <div className="flex items-center px-4 py-3 gap-3">
        {/* Album Art */}
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
        
        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{currentTrack.title}</p>
          <p className="text-xs text-muted-foreground truncate">{currentTrack.artist}</p>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              togglePlayPause();
            }}
            className="w-10 h-10"
            disabled={!currentTrack.audioUrl || isLoading}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              nextTrack();
            }}
            className="w-10 h-10"
          >
            <SkipForward className="w-5 h-5" />
          </Button>
        </div>
      </div>
      
      {/* Audio URL indicator */}
      {!currentTrack.audioUrl && (
        <div className="px-4 pb-2">
          <p className="text-xs text-muted-foreground text-center">No audio available</p>
        </div>
      )}
    </div>
  );
}