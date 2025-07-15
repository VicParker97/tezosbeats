'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, Play, Pause, Plus } from 'lucide-react';
import PlaylistQuickAdd from './PlaylistQuickAdd';

interface Track {
  id: string;
  title: string;
  artist: string;
  cover: string;
  duration: number;
  collection: string;
  isLiked: boolean;
  audioUrl?: string | null;
}

interface TrackItemProps {
  track: Track;
  isPlaying: boolean;
  isCurrentTrack: boolean;
  onPlay: (track: Track) => void;
  onLike: (trackId: string) => void;
}

export default function TrackItem({ 
  track, 
  isPlaying, 
  isCurrentTrack, 
  onPlay, 
  onLike 
}: TrackItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showPlaylistDialog, setShowPlaylistDialog] = useState(false);

  const formatDuration = (seconds: number) => {
    if (!seconds || isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayClick = () => {
    onPlay(track);
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike(track.id);
  };
  
  const handleAddToPlaylist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPlaylistDialog(true);
  };

  return (
    <div
      className={`group flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg transition-all duration-300 cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]
        ${isCurrentTrack ? 'bg-primary/10 border border-primary/20 shadow-sm' : 'hover:bg-muted/50 hover:shadow-md'}
        ${isHovered ? 'bg-muted/50' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handlePlayClick}
    >
      {/* Cover Image */}
      <div className="relative">
        <Avatar className="w-10 h-10 md:w-12 md:h-12 rounded-lg">
          <AvatarImage src={track.cover} alt={track.title} />
          <AvatarFallback>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="48" height="48" rx="6" fill="hsl(var(--muted))" />
              <circle cx="24" cy="20" r="6" fill="hsl(var(--muted-foreground))" opacity="0.3" />
              <path d="M18 32l12-6-12-6v12z" fill="hsl(var(--muted-foreground))" opacity="0.5" />
            </svg>
          </AvatarFallback>
        </Avatar>
        
        {/* Play overlay */}
        <div className={`absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-full transition-all duration-300 transform
          ${isHovered || isCurrentTrack ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}
        `}>
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6 md:w-8 md:h-8 text-white hover:bg-white/20 transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handlePlayClick}
            disabled={!track.audioUrl}
            title={!track.audioUrl ? 'No audio available' : isCurrentTrack && isPlaying ? 'Pause' : 'Play'}
          >
            {isCurrentTrack && isPlaying ? (
              <Pause className="w-3 h-3 md:w-4 md:h-4" />
            ) : (
              <Play className="w-3 h-3 md:w-4 md:h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Track Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className={`font-medium truncate text-sm md:text-base ${isCurrentTrack ? 'text-primary' : 'text-foreground'}`}>
            {track.title}
          </h3>
          <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full hidden md:inline-flex">
            {track.collection}
          </span>
        </div>
        <p className="text-xs md:text-sm text-muted-foreground truncate">
          {track.artist}
        </p>
      </div>

      {/* Duration */}
      <div className="text-xs md:text-sm text-muted-foreground min-w-[35px] md:min-w-[40px] text-right">
        {formatDuration(track.duration)}
        {!track.audioUrl && (
          <div className="text-xs text-yellow-600 dark:text-yellow-400">
            No audio
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLikeClick}
          className={`w-6 h-6 md:w-8 md:h-8 transition-all duration-200 hover:scale-110 ${track.isLiked ? 'text-red-500 animate-pulse' : 'text-muted-foreground hover:text-red-500'}`}
        >
          <Heart className={`w-3 h-3 md:w-4 md:h-4 ${track.isLiked ? 'fill-current' : ''}`} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleAddToPlaylist}
          className="w-6 h-6 md:w-8 md:h-8 text-muted-foreground hover:text-primary transition-colors"
          title="Add to playlist"
        >
          <Plus className="w-3 h-3 md:w-4 md:h-4" />
        </Button>
      </div>
      
      {/* Playlist Add Dialog */}
      <PlaylistQuickAdd
        track={track}
        isOpen={showPlaylistDialog}
        onClose={() => setShowPlaylistDialog(false)}
      />
    </div>
  );
}