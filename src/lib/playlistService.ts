'use client';

import { 
  Playlist, 
  PlaylistWithTracks, 
  CreatePlaylistRequest, 
  UpdatePlaylistRequest 
} from './playlistTypes';
import { Track } from './mockData';

class PlaylistService {
  private readonly STORAGE_KEY = 'tezosbeats_playlists';

  // Get all playlists from localStorage
  getPlaylists(): Playlist[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const playlists = JSON.parse(stored) as Playlist[];
      // Convert date strings back to Date objects
      return playlists.map(playlist => ({
        ...playlist,
        createdAt: new Date(playlist.createdAt),
        updatedAt: new Date(playlist.updatedAt)
      }));
    } catch (error) {
      console.error('Error loading playlists:', error);
      return [];
    }
  }

  // Get a specific playlist by ID
  getPlaylist(id: string): Playlist | null {
    const playlists = this.getPlaylists();
    return playlists.find(p => p.id === id) || null;
  }

  // Get playlist with populated tracks
  getPlaylistWithTracks(id: string, availableTracks: Track[]): PlaylistWithTracks | null {
    const playlist = this.getPlaylist(id);
    if (!playlist) return null;

    // Filter available tracks based on playlist trackIds
    const tracks = playlist.trackIds
      .map(trackId => availableTracks.find(t => t.id === trackId))
      .filter((track): track is Track => track !== undefined);

    return {
      ...playlist,
      tracks
    };
  }

  // Create a new playlist
  createPlaylist(request: CreatePlaylistRequest): Playlist {
    const now = new Date();
    const playlist: Playlist = {
      id: this.generateId(),
      name: request.name,
      description: request.description,
      trackIds: [],
      createdAt: now,
      updatedAt: now,
      isPublic: request.isPublic ?? false
    };

    const playlists = this.getPlaylists();
    playlists.push(playlist);
    this.savePlaylists(playlists);

    return playlist;
  }

  // Update an existing playlist
  updatePlaylist(id: string, request: UpdatePlaylistRequest): Playlist | null {
    const playlists = this.getPlaylists();
    const index = playlists.findIndex(p => p.id === id);
    
    if (index === -1) return null;

    const playlist = playlists[index];
    const updatedPlaylist: Playlist = {
      ...playlist,
      name: request.name ?? playlist.name,
      description: request.description ?? playlist.description,
      isPublic: request.isPublic ?? playlist.isPublic,
      updatedAt: new Date()
    };

    playlists[index] = updatedPlaylist;
    this.savePlaylists(playlists);

    return updatedPlaylist;
  }

  // Delete a playlist
  deletePlaylist(id: string): boolean {
    const playlists = this.getPlaylists();
    const filteredPlaylists = playlists.filter(p => p.id !== id);
    
    if (filteredPlaylists.length === playlists.length) {
      return false; // Playlist not found
    }

    this.savePlaylists(filteredPlaylists);
    return true;
  }

  // Add track to playlist
  addTrackToPlaylist(playlistId: string, trackId: string): boolean {
    const playlists = this.getPlaylists();
    const playlist = playlists.find(p => p.id === playlistId);
    
    if (!playlist) return false;

    // Check if track is already in playlist
    if (playlist.trackIds.includes(trackId)) {
      return false; // Track already exists
    }

    playlist.trackIds.push(trackId);
    playlist.updatedAt = new Date();
    this.savePlaylists(playlists);

    return true;
  }

  // Remove track from playlist
  removeTrackFromPlaylist(playlistId: string, trackId: string): boolean {
    const playlists = this.getPlaylists();
    const playlist = playlists.find(p => p.id === playlistId);
    
    if (!playlist) return false;

    const initialLength = playlist.trackIds.length;
    playlist.trackIds = playlist.trackIds.filter(id => id !== trackId);
    
    if (playlist.trackIds.length === initialLength) {
      return false; // Track not found
    }

    playlist.updatedAt = new Date();
    this.savePlaylists(playlists);

    return true;
  }

  // Reorder tracks in playlist
  reorderPlaylistTracks(playlistId: string, trackIds: string[]): boolean {
    const playlists = this.getPlaylists();
    const playlist = playlists.find(p => p.id === playlistId);
    
    if (!playlist) return false;

    // Validate that all provided trackIds exist in the playlist
    const validTrackIds = trackIds.filter(id => playlist.trackIds.includes(id));
    if (validTrackIds.length !== playlist.trackIds.length) {
      return false; // Invalid track IDs provided
    }

    playlist.trackIds = trackIds;
    playlist.updatedAt = new Date();
    this.savePlaylists(playlists);

    return true;
  }

  // Get playlists that contain a specific track
  getPlaylistsContainingTrack(trackId: string): Playlist[] {
    const playlists = this.getPlaylists();
    return playlists.filter(p => p.trackIds.includes(trackId));
  }

  // Duplicate a playlist
  duplicatePlaylist(id: string, newName?: string): Playlist | null {
    const originalPlaylist = this.getPlaylist(id);
    if (!originalPlaylist) return null;

    const now = new Date();
    const duplicatedPlaylist: Playlist = {
      ...originalPlaylist,
      id: this.generateId(),
      name: newName || `${originalPlaylist.name} (Copy)`,
      createdAt: now,
      updatedAt: now
    };

    const playlists = this.getPlaylists();
    playlists.push(duplicatedPlaylist);
    this.savePlaylists(playlists);

    return duplicatedPlaylist;
  }

  // Clear all playlists (for testing/reset)
  clearAllPlaylists(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Private helper methods
  private savePlaylists(playlists: Playlist[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(playlists));
    } catch (error) {
      console.error('Error saving playlists:', error);
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }
}

export const playlistService = new PlaylistService();