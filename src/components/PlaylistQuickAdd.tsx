'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, Plus, X } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Track } from '@/lib/mockData';

interface PlaylistQuickAddProps {
  track: Track;
  onClose: () => void;
  isOpen: boolean;
}

export default function PlaylistQuickAdd({ track, onClose, isOpen }: PlaylistQuickAddProps) {
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
      description: ''
    });
    
    addTrackToPlaylist(newPlaylist.id, track.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-background border border-border rounded-lg w-full max-w-sm mx-4 shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold">Add to Playlist</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 max-h-60 overflow-y-auto">
          {/* Create New Playlist */}
          {showCreateNew ? (
            <div className="flex gap-2">
              <Input
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="Playlist name"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateAndAdd();
                  if (e.key === 'Escape') setShowCreateNew(false);
                }}
                className="flex-1"
                autoFocus
              />
              <Button onClick={handleCreateAndAdd} size="sm">
                <Check className="w-4 h-4" />
              </Button>
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

          {/* Existing Playlists */}
          {playlists.length > 0 && (
            <div className="space-y-1">
              {playlists.map((playlist) => (
                <Button
                  key={playlist.id}
                  onClick={() => handleAddToPlaylist(playlist.id)}
                  variant="ghost"
                  className="w-full justify-start"
                >
                  {playlist.name}
                </Button>
              ))}
            </div>
          )}

          {playlists.length === 0 && !showCreateNew && (
            <p className="text-center text-muted-foreground text-sm py-4">
              No playlists yet. Create your first one!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}