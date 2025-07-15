'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Play, 
  Plus, 
  Music2, 
  MoreVertical,
  Edit,
  Trash2,
  Copy
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Playlist } from '@/lib/playlistTypes';
import { playlistService } from '@/lib/playlistService';

interface PlaylistPanelProps {
  onPlaylistSelect?: (playlist: Playlist) => void;
  onClose?: () => void;
}

export default function PlaylistPanel({ onPlaylistSelect }: PlaylistPanelProps) {
  const { playlists, tracks, setCurrentPlaylist, deletePlaylist, updatePlaylist, createPlaylist } = useApp();
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [contextMenuId, setContextMenuId] = useState<string | null>(null);

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) return;
    
    createPlaylist({
      name: newPlaylistName.trim(),
      description: ''
    });
    
    setNewPlaylistName('');
    setIsCreating(false);
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

  const handleDeletePlaylist = (playlistId: string) => {
    if (confirm('Delete this playlist?')) {
      deletePlaylist(playlistId);
    }
    setContextMenuId(null);
  };

  const handleEditStart = (playlist: Playlist) => {
    setEditingId(playlist.id);
    setEditName(playlist.name);
    setContextMenuId(null);
  };

  const handleEditSave = () => {
    if (!editName.trim() || !editingId) return;
    
    updatePlaylist(editingId, { name: editName.trim() });
    setEditingId(null);
    setEditName('');
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleDuplicate = (playlist: Playlist) => {
    createPlaylist({
      name: `${playlist.name} (Copy)`,
      description: playlist.description
    });
    setContextMenuId(null);
  };

  const getTrackCount = (playlist: Playlist): number => {
    return playlist.trackIds.filter(trackId => 
      tracks.some(track => track.id === trackId)
    ).length;
  };

  return (
    <div className="h-full flex flex-col bg-background/95 backdrop-blur-sm border-l border-border/50 shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-border/50 bg-gradient-to-r from-background to-muted/30">
        <div className="flex items-center gap-2 mb-4">
          <Music2 className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Playlists</h2>
        </div>
        
        {/* Create New Playlist */}
        {isCreating ? (
          <div className="space-y-2">
            <Input
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="Enter playlist name..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreatePlaylist();
                if (e.key === 'Escape') {
                  setIsCreating(false);
                  setNewPlaylistName('');
                }
              }}
              className="w-full"
              autoFocus
            />
            <div className="flex gap-2">
              <Button onClick={handleCreatePlaylist} size="sm" className="flex-1">
                Create
              </Button>
              <Button 
                onClick={() => {
                  setIsCreating(false);
                  setNewPlaylistName('');
                }} 
                variant="outline" 
                size="sm"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button 
            onClick={() => setIsCreating(true)} 
            variant="outline" 
            className="w-full hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Playlist
          </Button>
        )}
      </div>

      {/* Playlist List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border">
        {playlists.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 text-muted-foreground">
            <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
              <Music2 className="w-8 h-8 opacity-60" />
            </div>
            <p className="text-sm font-medium mb-1">No playlists yet</p>
            <p className="text-xs opacity-70">Create your first playlist to get started</p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {playlists.map((playlist) => (
              <div 
                key={playlist.id} 
                className="relative group p-3 rounded-xl hover:bg-muted/40 hover:shadow-sm transition-all duration-200 border border-transparent hover:border-border/50"
              >
                <div className="flex items-center gap-3">
                  {/* Play Button */}
                  <div className="relative">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                      <Button
                        onClick={() => handlePlayPlaylist(playlist)}
                        size="icon"
                        variant="ghost"
                        className="w-8 h-8 hover:bg-primary/20 transition-colors"
                        disabled={getTrackCount(playlist) === 0}
                        title={getTrackCount(playlist) === 0 ? 'No tracks to play' : 'Play playlist'}
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Playlist Info */}
                  <div className="flex-1 min-w-0">
                    {editingId === playlist.id ? (
                      <div className="space-y-2">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleEditSave();
                            if (e.key === 'Escape') handleEditCancel();
                          }}
                          className="h-8 text-sm"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <Button onClick={handleEditSave} size="sm" className="flex-1 h-7 text-xs">
                            Save
                          </Button>
                          <Button onClick={handleEditCancel} variant="outline" size="sm" className="flex-1 h-7 text-xs">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="font-medium text-sm truncate text-foreground" title={playlist.name}>
                          {playlist.name}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-muted-foreground">
                            {getTrackCount(playlist)} {getTrackCount(playlist) === 1 ? 'track' : 'tracks'}
                          </p>
                          {getTrackCount(playlist) === 0 && (
                            <span className="text-xs px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full">
                              Empty
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Context Menu Button */}
                  {editingId !== playlist.id && (
                    <div className="relative">
                      <Button
                        onClick={() => setContextMenuId(contextMenuId === playlist.id ? null : playlist.id)}
                        size="icon"
                        variant="ghost"
                        className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-muted"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>

                      {/* Context Menu */}
                      {contextMenuId === playlist.id && (
                        <div className="absolute right-0 top-full mt-2 bg-background/95 backdrop-blur-sm border border-border/50 rounded-lg shadow-xl z-20 min-w-[140px] overflow-hidden">
                          <div className="py-1">
                            <button
                              onClick={() => handleEditStart(playlist)}
                              className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted/50 flex items-center gap-3 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                              Rename
                            </button>
                            <button
                              onClick={() => handleDuplicate(playlist)}
                              className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted/50 flex items-center gap-3 transition-colors"
                            >
                              <Copy className="w-4 h-4" />
                              Duplicate
                            </button>
                            <div className="border-t border-border/50 my-1"></div>
                            <button
                              onClick={() => handleDeletePlaylist(playlist.id)}
                              className="w-full px-4 py-2.5 text-left text-sm hover:bg-destructive/10 text-destructive flex items-center gap-3 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Click outside to close context menu */}
      {contextMenuId && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setContextMenuId(null)}
        />
      )}
    </div>
  );
}