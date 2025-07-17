'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useApp } from '@/contexts/AppContext';
import { 
  ChevronDown,
  Music,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  MoreHorizontal,
} from 'lucide-react';
import { RepeatMode } from '@/contexts/AppContext';

interface MobilePlayerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobilePlayer({ isOpen, onClose }: MobilePlayerProps) {
  const [isLiked, setIsLiked] = useState(false);
  
  const { 
    currentTrack, 
    isPlaying, 
    togglePlayPause, 
    nextTrack, 
    previousTrack,
    isShuffled,
    repeatMode,
    toggleShuffle,
    toggleRepeat,
    currentTime,
    duration,
    seekTo,
    isLoading
  } = useApp();

  if (!isOpen || !currentTrack) return null;

  // Format time in MM:SS format
  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (value: number[]) => {
    const newTime = (value[0] / 100) * duration;
    seekTo(newTime);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="w-10 h-10"
        >
          <ChevronDown className="w-6 h-6" />
        </Button>
        
        <div className="text-center flex-1">
          <p className="text-sm text-muted-foreground">Playing from</p>
          <p className="text-sm font-medium">{currentTrack.collection || 'My NFTs'}</p>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10"
        >
          <MoreHorizontal className="w-6 h-6" />
        </Button>
      </div>

      {/* Album Art */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="relative">
          <Avatar className="w-80 h-80 rounded-xl shadow-2xl">
            <AvatarImage 
              src={currentTrack.cover} 
              alt={`Album cover for ${currentTrack.title}`}
              className="object-cover"
            />
            <AvatarFallback className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/40">
              <Music className="w-20 h-20 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          
          {/* Vinyl effect - optional visual enhancement */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Track Info */}
      <div className="px-8 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold truncate">{currentTrack.title}</h1>
            <p className="text-lg text-muted-foreground truncate">{currentTrack.artist}</p>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsLiked(!isLiked)}
            className="w-12 h-12 ml-4"
          >
            <Heart className={`w-6 h-6 ${isLiked ? 'fill-primary text-primary' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-8 pb-6">
        <Slider
          value={[progress]}
          onValueChange={handleSeek}
          max={100}
          step={1}
          className="w-full"
          disabled={!duration || isLoading}
        />
        
        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Player Controls */}
      <div className="px-8 pb-8">
        {/* Secondary Controls */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleShuffle}
            className={`w-12 h-12 ${isShuffled ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <Shuffle className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={previousTrack}
              className="w-14 h-14 text-foreground"
            >
              <SkipBack className="w-6 h-6" />
            </Button>
            
            <Button
              variant="default"
              size="icon"
              onClick={togglePlayPause}
              className="w-20 h-20 rounded-full shadow-xl hover:shadow-2xl transition-all"
              disabled={!currentTrack.audioUrl || isLoading}
            >
              {isLoading ? (
                <div className="w-8 h-8 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8 ml-1" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={nextTrack}
              className="w-14 h-14 text-foreground"
            >
              <SkipForward className="w-6 h-6" />
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleRepeat}
            className={`w-12 h-12 ${repeatMode !== RepeatMode.NONE ? 'text-primary' : 'text-muted-foreground'}`}
          >
            {repeatMode === RepeatMode.ONE ? (
              <Repeat1 className="w-5 h-5" />
            ) : (
              <Repeat className="w-5 h-5" />
            )}
          </Button>
        </div>
        
        {/* Audio URL indicator */}
        {!currentTrack.audioUrl && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">No audio file available for this track</p>
          </div>
        )}
      </div>
    </div>
  );
}