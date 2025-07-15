'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { 
  Plus, 
  Check, 
  X,
  Music2
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Track } from '@/lib/mockData';
import OptimizedImage from '@/components/ui/optimized-image';

interface PlaylistAddDialogProps {
  track: Track;
  onClose: () => void;
  isOpen: boolean;
}

export default function PlaylistAddDialog({ track, onClose, isOpen }: PlaylistAddDialogProps) {
  const { playlists, addTrackToPlaylist, createPlaylist } = useApp();
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showCreateNew, setShowCreateNew] = useState(false);

  if (!isOpen) return null;

  const handleAddToPlaylist = (playlistId: string) => {
    const success = addTrackToPlaylist(playlistId, track.id);
    if (success) {
      onClose();
    }
  };

  const handleCreateAndAdd = () => {
    if (!newPlaylistName.trim()) return;
    
    const newPlaylist = createPlaylist({
      name: newPlaylistName.trim(),
      isPublic: false
    });
    
    addTrackToPlaylist(newPlaylist.id, track.id);
    setNewPlaylistName('');
    setShowCreateNew(false);
    onClose();
  };

  const isTrackInPlaylist = (playlistId: string): boolean => {
    const playlist = playlists.find(p => p.id === playlistId);
    return playlist ? playlist.trackIds.includes(track.id) : false;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]" onClick={onClose}>
      <Card className="w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Add to Playlist</h3>
          <Button onClick={onClose} variant="ghost" size="icon">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-3">
            <OptimizedImage 
              src={track.cover} 
              alt={track.title}
              width={48}
              height={48}
              className="w-12 h-12 rounded object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{track.title}</p>
              <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {/* Create new playlist option */}
          {showCreateNew ? (
            <div className="p-3 border rounded-lg space-y-3">
              <Input
                placeholder="Enter playlist name..."
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateAndAdd();
                  if (e.key === 'Escape') setShowCreateNew(false);
                }}
                autoFocus
              />
              <div className="flex gap-2">
                <Button onClick={handleCreateAndAdd} size="sm">
                  Create & Add
                </Button>
                <Button 
                  onClick={() => setShowCreateNew(false)} 
                  variant="outline" 
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={() => setShowCreateNew(true)}
              variant="outline"
              className="w-full justify-start"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Playlist
            </Button>
          )}

          {/* Existing playlists */}
          {playlists.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Music2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No playlists yet</p>
            </div>
          ) : (
            playlists.map((playlist) => {
              const isAdded = isTrackInPlaylist(playlist.id);
              
              return (
                <Button
                  key={playlist.id}
                  onClick={() => !isAdded && handleAddToPlaylist(playlist.id)}
                  variant={isAdded ? "secondary" : "outline"}
                  className="w-full justify-between"
                  disabled={isAdded}
                >
                  <div className="flex items-center gap-2">
                    <span className="truncate">{playlist.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({playlist.trackIds.length} tracks)
                    </span>
                  </div>
                  {isAdded && <Check className="w-4 h-4" />}
                </Button>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}