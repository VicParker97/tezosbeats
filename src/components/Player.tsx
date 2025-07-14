'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { 
  SkipBack, 
  Play, 
  Pause, 
  SkipForward, 
  Volume2,
  VolumeX
} from 'lucide-react';

interface Track {
  id: string;
  title: string;
  artist: string;
  cover: string;
  duration: number;
  audioUrl?: string | null;
}

interface PlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export default function Player({ 
  currentTrack, 
  isPlaying, 
  onPlayPause, 
  onNext, 
  onPrevious 
}: PlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState([0]);
  const [volume, setVolume] = useState([80]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Reset states when track changes
  useEffect(() => {
    if (!currentTrack) {
      setHasAudio(false);
      setIsLoading(false);
      setAudioError(false);
      setIsReady(false);
      setCurrentTime(0);
      setProgress([0]);
      setDuration(0);
      return;
    }

    // Reset states for new track
    setIsLoading(false);
    setAudioError(false);
    setIsReady(false);
    setCurrentTime(0);
    setProgress([0]);
    setDuration(0);

    if (currentTrack.audioUrl && audioRef.current) {
      setHasAudio(true);
      setIsLoading(true);
      const audio = audioRef.current;
      audio.src = currentTrack.audioUrl;
      audio.load();
    } else {
      setHasAudio(false);
    }
  }, [currentTrack]); // Only trigger on track change

  // Handle play/pause when state changes
  useEffect(() => {
    if (!audioRef.current || !hasAudio || !isReady) return;

    const audio = audioRef.current;
    
    if (isPlaying) {
      audio.play().catch((error) => {
        console.error('Playback failed:', error);
        setAudioError(true);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, hasAudio, isReady]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      if (audio.duration > 0) {
        setCurrentTime(audio.currentTime);
        const progressPercent = (audio.currentTime / audio.duration) * 100;
        setProgress([progressPercent]);
      }
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      setAudioError(false);
      setIsReady(true);
      // Set volume when audio is ready
      audio.volume = isMuted ? 0 : volume[0] / 100;
    };

    const handleError = () => {
      setIsLoading(false);
      setAudioError(true);
      setIsReady(false);
    };

    const handleEnded = () => {
      onNext();
    };

    const handleLoadStart = () => {
      setIsLoading(true);
      setIsReady(false);
    };

    // Add event listeners
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadstart', handleLoadStart);

    return () => {
      // Remove event listeners
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadstart', handleLoadStart);
    };
  }, [onNext, volume, isMuted]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume[0] / 100;
    }
  }, [volume, isMuted]);

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressChange = (value: number[]) => {
    if (audioRef.current && hasAudio && duration > 0) {
      const newTime = (value[0] / 100) * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      setProgress(value);
    }
  };

  const handleVolumeToggle = () => {
    setIsMuted(!isMuted);
  };

  const handlePlayPause = () => {
    // Always allow toggle for visual feedback, audio will be handled by useEffect
    onPlayPause();
  };

  const handleVolumeUp = () => {
    setVolume(prev => [Math.min(100, prev[0] + 10)]);
    if (isMuted) setIsMuted(false);
  };

  const handleVolumeDown = () => {
    setVolume(prev => [Math.max(0, prev[0] - 10)]);
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onPlayPause: handlePlayPause,
    onNext,
    onPrevious,
    onVolumeUp: handleVolumeUp,
    onVolumeDown: handleVolumeDown,
    onMute: handleVolumeToggle,
  });

  if (!currentTrack) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 md:left-64 right-0 h-16 md:h-18 bg-background/95 backdrop-blur-sm border-t border-border px-2 md:px-4 flex items-center justify-between z-30 shadow-lg">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        preload="metadata"
        className="hidden"
        aria-label={`Audio player for ${currentTrack?.title || 'current track'}`}
      />
      
      {/* Track Info */}
      <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1 touch-manipulation">
        <Avatar className="w-10 h-10 md:w-12 md:h-12 rounded-lg">
          <AvatarImage 
            src={currentTrack.cover} 
            alt={`Album cover for ${currentTrack.title} by ${currentTrack.artist}`} 
          />
          <AvatarFallback>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Default album cover">
              <rect width="48" height="48" rx="4" fill="hsl(var(--muted))" />
              <path d="M24 16v16m-8-8h16" stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-foreground truncate text-sm md:text-base">{currentTrack.title}</h3>
          <p className="text-xs md:text-sm text-muted-foreground truncate">
            {currentTrack.artist}
            {!hasAudio && <span className="ml-2 text-yellow-500">• No audio</span>}
            {audioError && <span className="ml-2 text-red-500">• Audio error</span>}
            {isLoading && <span className="ml-2 text-blue-500">• Loading...</span>}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-1 md:gap-2 flex-1 max-w-sm md:max-w-md touch-manipulation">
        <div className="flex items-center gap-1 md:gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onPrevious}
            className="w-7 h-7 md:w-8 md:h-8 transition-all duration-200 hover:scale-110 active:scale-95"
            aria-label="Previous track"
            title="Previous track (←)"
          >
            <SkipBack className="w-3 h-3 md:w-4 md:h-4" />
          </Button>
          <Button 
            variant="default" 
            size="icon" 
            onClick={handlePlayPause}
            className="w-8 h-8 md:w-10 md:h-10 transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg"
            disabled={isLoading}
            aria-label={isLoading ? 'Loading...' : isPlaying ? 'Pause' : 'Play'}
            title={isLoading ? 'Loading...' : isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isLoading ? (
              <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-current border-t-transparent rounded-full animate-spin" aria-hidden="true" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4 md:w-5 md:h-5" />
            ) : (
              <Play className="w-4 h-4 md:w-5 md:h-5" />
            )}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onNext}
            className="w-7 h-7 md:w-8 md:h-8 transition-all duration-200 hover:scale-110 active:scale-95"
            aria-label="Next track"
            title="Next track (→)"
          >
            <SkipForward className="w-3 h-3 md:w-4 md:h-4" />
          </Button>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-1 md:gap-2 w-full">
          <span className="text-xs text-muted-foreground min-w-[30px] md:min-w-[35px]">
            {formatTime(currentTime)}
          </span>
          <Slider
            value={progress}
            onValueChange={handleProgressChange}
            max={100}
            step={0.1}
            className="flex-1"
            disabled={!hasAudio || audioError}
            aria-label="Track progress"
            title="Seek through track"
          />
          <span className="text-xs text-muted-foreground min-w-[30px] md:min-w-[35px]">
            {formatTime(duration > 0 ? duration : currentTrack.duration)}
          </span>
        </div>
      </div>

      {/* Volume - Hidden on mobile */}
      <div className="hidden md:flex items-center gap-2 flex-1 justify-end touch-manipulation">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleVolumeToggle}
          className="w-8 h-8 transition-all duration-200 hover:scale-110 active:scale-95"
          disabled={!hasAudio || audioError}
          aria-label={isMuted || volume[0] === 0 ? 'Unmute' : 'Mute'}
          title={`${isMuted || volume[0] === 0 ? 'Unmute' : 'Mute'} (M)`}
        >
          {isMuted || volume[0] === 0 ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </Button>
        <Slider
          value={isMuted ? [0] : volume}
          onValueChange={isMuted ? () => {} : setVolume}
          max={100}
          step={1}
          className="w-24"
          disabled={!hasAudio || audioError}
          aria-label="Volume control"
          title="Adjust volume (↑/↓)"
        />
      </div>
    </div>
  );
}