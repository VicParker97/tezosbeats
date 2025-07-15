'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Play, 
  Trash2, 
  GripVertical,
  Plus,
  Search
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { PlaylistWithTracks } from '@/lib/playlistTypes';
import { Track } from '@/lib/mockData';
import OptimizedImage from '@/components/ui/optimized-image';

interface PlaylistEditorProps {
  playlist: PlaylistWithTracks;
  onBack: () => void;
}

export default function PlaylistEditor({ playlist, onBack }: PlaylistEditorProps) {
  const { 
    tracks, 
    setCurrentTrack, 
    removeTrackFromPlaylist, 
    reorderPlaylistTracks,
    addTrackToPlaylist,
    setCurrentPlaylist
  } = useApp();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddTracks, setShowAddTracks] = useState(false);
  const [draggedTrack, setDraggedTrack] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Get available tracks to add (not already in playlist)
  const availableTracksToAdd = tracks.filter(track => 
    !playlist.trackIds.includes(track.id) &&
    (searchQuery === '' || 
     track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     track.artist.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handlePlayTrack = (track: Track) => {
    setCurrentTrack(track);
    setCurrentPlaylist(playlist);
  };

  const handleRemoveTrack = (trackId: string) => {
    removeTrackFromPlaylist(playlist.id, trackId);
  };

  const handleAddTrack = (trackId: string) => {
    if (addTrackToPlaylist(playlist.id, trackId)) {
      setSearchQuery('');
    }
  };

  const handlePlayPlaylist = () => {
    if (playlist.tracks.length > 0) {
      setCurrentTrack(playlist.tracks[0]);
      setCurrentPlaylist(playlist);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, trackId: string) => {
    setDraggedTrack(trackId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (!draggedTrack) return;
    
    const currentIndex = playlist.trackIds.indexOf(draggedTrack);
    if (currentIndex === -1) return;
    
    const newTrackIds = [...playlist.trackIds];
    newTrackIds.splice(currentIndex, 1);
    newTrackIds.splice(dropIndex, 0, draggedTrack);
    
    reorderPlaylistTracks(playlist.id, newTrackIds);
    
    setDraggedTrack(null);
    setDragOverIndex(null);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button onClick={onBack} variant="ghost" size="icon">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-foreground">{playlist.name}</h2>
          <p className="text-sm text-muted-foreground">
            {playlist.tracks.length} tracks
            {playlist.description && ` • ${playlist.description}`}
          </p>
        </div>
        <Button 
          onClick={handlePlayPlaylist}
          disabled={playlist.tracks.length === 0}
          className="flex items-center gap-2"
        >
          <Play className="w-4 h-4" />
          Play All
        </Button>
      </div>

      {/* Add tracks section */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowAddTracks(!showAddTracks)}
            variant="outline"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Tracks
          </Button>
          {showAddTracks && (
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search tracks to add..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          )}
        </div>

        {/* Available tracks to add */}
        {showAddTracks && (
          <Card className="p-4">
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {availableTracksToAdd.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {searchQuery ? 'No tracks found matching search' : 'No tracks available to add'}
                </p>
              ) : (
                availableTracksToAdd.map((track) => (
                  <div 
                    key={track.id}
                    className="flex items-center justify-between p-2 hover:bg-muted/50 rounded"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{track.title}</p>
                      <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                    </div>
                    <Button
                      onClick={() => handleAddTrack(track.id)}
                      size="sm"
                      variant="outline"
                    >
                      Add
                    </Button>
                  </div>
                ))
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Playlist tracks */}
      <div className="space-y-2">
        {playlist.tracks.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">This playlist is empty</p>
            <p className="text-sm text-muted-foreground">Add some tracks to get started</p>
          </Card>
        ) : (
          playlist.tracks.map((track, index) => (
            <Card 
              key={track.id} 
              className={`p-3 transition-all ${
                dragOverIndex === index ? 'border-primary' : ''
              }`}
              draggable
              onDragStart={(e) => handleDragStart(e, track.id)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
            >
              <div className="flex items-center gap-3">
                <div className="cursor-move">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                </div>
                
                <div className="flex-shrink-0">
                  <OptimizedImage 
                    src={track.cover} 
                    alt={track.title}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{track.title}</p>
                  <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {formatDuration(track.duration)}
                  </span>
                  <Button
                    onClick={() => handlePlayTrack(track)}
                    size="icon"
                    variant="ghost"
                    className="w-8 h-8"
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleRemoveTrack(track.id)}
                    size="icon"
                    variant="ghost"
                    className="w-8 h-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}