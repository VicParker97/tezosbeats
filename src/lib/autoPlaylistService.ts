'use client';

import { Track } from './mockData';
import { Playlist, PlaylistWithTracks } from './playlistTypes';
import { trackStatsService } from './trackStatsService';

export interface AutoPlaylist {
  id: string;
  name: string;
  description: string;
  type: 'recently_played' | 'most_played' | 'recently_added';
  tracks: Track[];
  lastUpdated: Date;
  isAuto: true;
}

class AutoPlaylistService {
  // Generate all auto-playlists
  generateAutoPlaylists(tracks: Track[]): AutoPlaylist[] {
    const autoPlaylists = trackStatsService.generateAutoPlaylists(tracks);
    const now = new Date();
    
    const result: AutoPlaylist[] = [];
    
    // Recently Played
    if (autoPlaylists.recentlyPlayed.length > 0) {
      result.push({
        id: 'auto_recently_played',
        name: 'Recently Played',
        description: 'Your most recently played tracks',
        type: 'recently_played',
        tracks: autoPlaylists.recentlyPlayed,
        lastUpdated: now,
        isAuto: true
      });
    }
    
    // Most Played
    if (autoPlaylists.mostPlayed.length > 0) {
      result.push({
        id: 'auto_most_played',
        name: 'Most Played',
        description: 'Your most frequently played tracks',
        type: 'most_played',
        tracks: autoPlaylists.mostPlayed,
        lastUpdated: now,
        isAuto: true
      });
    }
    
    // Recently Added
    if (autoPlaylists.recentlyAdded.length > 0) {
      result.push({
        id: 'auto_recently_added',
        name: 'Recently Added',
        description: 'Your most recently added NFTs',
        type: 'recently_added',
        tracks: autoPlaylists.recentlyAdded,
        lastUpdated: now,
        isAuto: true
      });
    }
    
    return result;
  }

  // Convert auto-playlist to regular playlist format for compatibility
  convertToPlaylistWithTracks(autoPlaylist: AutoPlaylist): PlaylistWithTracks {
    return {
      id: autoPlaylist.id,
      name: autoPlaylist.name,
      description: autoPlaylist.description,
      trackIds: autoPlaylist.tracks.map(t => t.id),
      createdAt: autoPlaylist.lastUpdated,
      updatedAt: autoPlaylist.lastUpdated,
      isPublic: false,
      tracks: autoPlaylist.tracks
    };
  }

  // Get a specific auto-playlist by type
  getAutoPlaylist(type: AutoPlaylist['type'], tracks: Track[]): AutoPlaylist | null {
    const autoPlaylists = this.generateAutoPlaylists(tracks);
    return autoPlaylists.find(playlist => playlist.type === type) || null;
  }

  // Check if a playlist ID is an auto-playlist
  isAutoPlaylist(playlistId: string): boolean {
    return playlistId.startsWith('auto_');
  }

  // Get auto-playlist type from ID
  getAutoPlaylistType(playlistId: string): AutoPlaylist['type'] | null {
    if (!this.isAutoPlaylist(playlistId)) return null;
    
    switch (playlistId) {
      case 'auto_recently_played':
        return 'recently_played';
      case 'auto_most_played':
        return 'most_played';
      case 'auto_recently_added':
        return 'recently_added';
      default:
        return null;
    }
  }

  // Get display info for auto-playlists
  getAutoPlaylistInfo(type: AutoPlaylist['type']): {
    name: string;
    description: string;
    icon: string;
  } {
    switch (type) {
      case 'recently_played':
        return {
          name: 'Recently Played',
          description: 'Your most recently played tracks',
          icon: '🕐'
        };
      case 'most_played':
        return {
          name: 'Most Played',
          description: 'Your most frequently played tracks',
          icon: '⭐'
        };
      case 'recently_added':
        return {
          name: 'Recently Added',
          description: 'Your most recently added NFTs',
          icon: '🆕'
        };
      default:
        return {
          name: 'Unknown',
          description: 'Unknown auto-playlist',
          icon: '❓'
        };
    }
  }

  // Get statistics for auto-playlists
  getAutoPlaylistStats(tracks: Track[]): {
    recentlyPlayedCount: number;
    mostPlayedCount: number;
    recentlyAddedCount: number;
    totalAutoTracks: number;
  } {
    const autoPlaylists = this.generateAutoPlaylists(tracks);
    
    return {
      recentlyPlayedCount: autoPlaylists.recentlyPlayed.length,
      mostPlayedCount: autoPlaylists.mostPlayed.length,
      recentlyAddedCount: autoPlaylists.recentlyAdded.length,
      totalAutoTracks: autoPlaylists.recentlyPlayed.length + 
                       autoPlaylists.mostPlayed.length + 
                       autoPlaylists.recentlyAdded.length
    };
  }
}

export const autoPlaylistService = new AutoPlaylistService();