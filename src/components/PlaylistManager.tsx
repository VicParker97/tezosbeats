'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Music2, 
  Edit, 
  Trash2, 
  Play, 
  Copy
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Playlist } from '@/lib/playlistTypes';
import { playlistService } from '@/lib/playlistService';

interface PlaylistManagerProps {
  onPlaylistSelect?: (playlist: Playlist) => void;
}

export default function PlaylistManager({ onPlaylistSelect }: PlaylistManagerProps) {
  const { playlists, tracks, deletePlaylist, setCurrentPlaylist, updatePlaylist } = useApp();
  const [editingPlaylist, setEditingPlaylist] = useState<string | null>(null);
  const [editName, setEditName] = useState('');


  const handleEditPlaylist = (playlist: Playlist) => {
    setEditingPlaylist(playlist.id);
    setEditName(playlist.name);
  };

  const handleSaveEdit = (playlistId: string) => {
    if (!editName.trim()) return;
    
    updatePlaylist(playlistId, { name: editName.trim() });
    
    setEditingPlaylist(null);
    setEditName('');
  };

  const handleCancelEdit = () => {
    setEditingPlaylist(null);
    setEditName('');
  };

  const handleDeletePlaylist = (playlistId: string) => {
    if (confirm('Are you sure you want to delete this playlist?')) {
      deletePlaylist(playlistId);
    }
  };

  const handlePlayPlaylist = (playlist: Playlist) => {
    const playlistWithTracks = playlistService.getPlaylistWithTracks(playlist.id, tracks);
    if (playlistWithTracks && playlistWithTracks.tracks.length > 0) {
      setCurrentPlaylist(playlistWithTracks);
      if (onPlaylistSelect) {
        onPlaylistSelect(playlist);
      }
    }
  };

  const handleDuplicatePlaylist = (playlist: Playlist) => {
    playlistService.duplicatePlaylist(playlist.id);
  };

  const getTrackCount = (playlist: Playlist): number => {
    return playlist.trackIds.filter(trackId => 
      tracks.some(track => track.id === trackId)
    ).length;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Playlists</h2>
        <p className="text-sm text-muted-foreground">Create playlists from the sidebar</p>
      </div>

      <Separator />

      {/* Playlists list */}
      <div className="space-y-3">
        {playlists.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Music2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No playlists yet</p>
            <p className="text-sm">Create your first playlist to get started</p>
          </div>
        ) : (
          playlists.map((playlist) => (
            <Card key={playlist.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  {editingPlaylist === playlist.id ? (
                    <div className="flex gap-2">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(playlist.id);
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                        className="flex-1"
                        autoFocus
                      />
                      <Button 
                        onClick={() => handleSaveEdit(playlist.id)} 
                        size="sm"
                      >
                        Save
                      </Button>
                      <Button 
                        onClick={handleCancelEdit} 
                        variant="outline" 
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-semibold text-foreground truncate">
                        {playlist.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {getTrackCount(playlist)} tracks
                        {playlist.description && ` • ${playlist.description}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Created {playlist.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                {editingPlaylist !== playlist.id && (
                  <div className="flex gap-1 ml-3">
                    <Button
                      onClick={() => handlePlayPlaylist(playlist)}
                      size="icon"
                      variant="ghost"
                      className="w-8 h-8"
                      disabled={getTrackCount(playlist) === 0}
                      title="Play playlist"
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleEditPlaylist(playlist)}
                      size="icon"
                      variant="ghost"
                      className="w-8 h-8"
                      title="Edit playlist"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDuplicatePlaylist(playlist)}
                      size="icon"
                      variant="ghost"
                      className="w-8 h-8"
                      title="Duplicate playlist"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDeletePlaylist(playlist.id)}
                      size="icon"
                      variant="ghost"
                      className="w-8 h-8 text-destructive hover:text-destructive"
                      title="Delete playlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}