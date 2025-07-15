'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { X, Music2, Edit, Trash2, Play, Copy, Plus } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Playlist } from '@/lib/playlistTypes';
import { playlistService } from '@/lib/playlistService';
import CreatePlaylistModal from './CreatePlaylistModal';
import PlaylistCover from './PlaylistCover';

interface PlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaylistSelect?: (playlist: Playlist) => void;
}

export default function PlaylistModal({ isOpen, onClose, onPlaylistSelect }: PlaylistModalProps) {
  const { playlists, autoPlaylists, tracks, deletePlaylist, setCurrentPlaylist, updatePlaylist } = useApp();
  const [editingPlaylist, setEditingPlaylist] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

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
      onClose(); // Close modal after selecting playlist
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

  const handleClose = () => {
    setEditingPlaylist(null);
    setEditName('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]" onClick={handleClose}>
      <div 
        className="bg-background border border-border rounded-lg w-full max-w-2xl max-h-[80vh] mx-4 shadow-lg flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold">Playlists</h2>
          <div className="flex items-center gap-2">
            <Button onClick={() => setShowCreateModal(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Playlist
            </Button>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Auto-playlists section */}
          {autoPlaylists.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Smart Playlists</h3>
              <div className="space-y-3">
                {autoPlaylists.map((autoPlaylist) => (
                  <Card key={autoPlaylist.id} className="p-4 bg-primary/5 border-primary/20">
                    <div className="flex items-center gap-4">
                      {/* Auto-playlist Cover */}
                      <div className="flex-shrink-0">
                        <PlaylistCover 
                          tracks={autoPlaylist.tracks}
                          size={60}
                          className="rounded-lg"
                        />
                      </div>
                      
                      {/* Auto-playlist Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate flex items-center gap-2">
                          <span>{autoPlaylist.name}</span>
                          <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">AUTO</span>
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {autoPlaylist.tracks.length} tracks • {autoPlaylist.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Updated {autoPlaylist.lastUpdated.toLocaleDateString()}
                        </p>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          onClick={() => {
                            const playlistWithTracks = {
                              ...autoPlaylist,
                              trackIds: autoPlaylist.tracks.map(t => t.id),
                              createdAt: autoPlaylist.lastUpdated,
                              updatedAt: autoPlaylist.lastUpdated,
                              isPublic: false
                            };
                            setCurrentPlaylist(playlistWithTracks);
                            if (onPlaylistSelect) {
                              onPlaylistSelect(playlistWithTracks);
                            }
                            onClose();
                          }}
                          size="icon"
                          variant="ghost"
                          className="w-8 h-8"
                          disabled={autoPlaylist.tracks.length === 0}
                          title="Play auto-playlist"
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {/* Regular playlists section */}
          <div>
            {autoPlaylists.length > 0 && (
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Your Playlists</h3>
            )}
            {playlists.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Music2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No playlists yet</p>
                <p className="text-sm">Create your first playlist to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {playlists.map((playlist) => (
                <Card key={playlist.id} className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Playlist Cover */}
                    <div className="flex-shrink-0">
                      <PlaylistCover 
                        tracks={playlist.trackIds
                          .map(trackId => tracks.find(t => t.id === trackId))
                          .filter((track): track is typeof tracks[0] => track !== undefined)
                        }
                        size={60}
                        className="rounded-lg"
                      />
                    </div>
                    
                    {/* Playlist Info */}
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
                    
                    {/* Actions */}

                    {editingPlaylist !== playlist.id && (
                      <div className="flex gap-1 flex-shrink-0">
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
              ))}
            </div>
          )}
          </div>
        </div>

        {/* Create Playlist Modal */}
        <CreatePlaylistModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      </div>
    </div>
  );
}