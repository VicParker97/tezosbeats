'use client';

import { Track } from './mockData';

interface TrackStats {
  trackId: string;
  playCount: number;
  lastPlayed: Date;
  addedAt: Date;
  skipCount: number;
  totalPlayTime: number; // in seconds
}

interface PlayHistory {
  trackId: string;
  playedAt: Date;
  duration: number; // how long it was played in seconds
  completed: boolean; // whether the track was played to completion
}

class TrackStatsService {
  private readonly STATS_STORAGE_KEY = 'tezosbeats_track_stats';
  private readonly HISTORY_STORAGE_KEY = 'tezosbeats_play_history';
  private readonly MAX_HISTORY_ENTRIES = 1000;

  // Get track statistics
  getTrackStats(trackId: string): TrackStats | null {
    const stats = this.getAllStats();
    return stats.find(s => s.trackId === trackId) || null;
  }

  // Get all track statistics
  getAllStats(): TrackStats[] {
    try {
      const stored = localStorage.getItem(this.STATS_STORAGE_KEY);
      if (!stored) return [];
      
      const stats = JSON.parse(stored) as TrackStats[];
      return stats.map(stat => ({
        ...stat,
        lastPlayed: new Date(stat.lastPlayed),
        addedAt: new Date(stat.addedAt)
      }));
    } catch (error) {
      console.error('Error loading track stats:', error);
      return [];
    }
  }

  // Record a track play
  recordPlay(trackId: string, duration: number = 0, completed: boolean = false): void {
    // Update stats
    const stats = this.getAllStats();
    const existingStats = stats.find(s => s.trackId === trackId);
    
    if (existingStats) {
      existingStats.playCount += 1;
      existingStats.lastPlayed = new Date();
      existingStats.totalPlayTime += duration;
      if (!completed) {
        existingStats.skipCount += 1;
      }
    } else {
      stats.push({
        trackId,
        playCount: 1,
        lastPlayed: new Date(),
        addedAt: new Date(),
        skipCount: completed ? 0 : 1,
        totalPlayTime: duration
      });
    }
    
    this.saveStats(stats);
    
    // Add to play history
    this.addToHistory({
      trackId,
      playedAt: new Date(),
      duration,
      completed
    });
  }

  // Record when a track is first added to the library
  recordTrackAdded(trackId: string): void {
    const stats = this.getAllStats();
    const existingStats = stats.find(s => s.trackId === trackId);
    
    if (!existingStats) {
      stats.push({
        trackId,
        playCount: 0,
        lastPlayed: new Date(0), // Epoch time for never played
        addedAt: new Date(),
        skipCount: 0,
        totalPlayTime: 0
      });
      this.saveStats(stats);
    }
  }

  // Get play history
  getPlayHistory(): PlayHistory[] {
    try {
      const stored = localStorage.getItem(this.HISTORY_STORAGE_KEY);
      if (!stored) return [];
      
      const history = JSON.parse(stored) as PlayHistory[];
      return history.map(entry => ({
        ...entry,
        playedAt: new Date(entry.playedAt)
      }));
    } catch (error) {
      console.error('Error loading play history:', error);
      return [];
    }
  }

  // Get recently played tracks
  getRecentlyPlayed(limit: number = 50): TrackStats[] {
    const stats = this.getAllStats();
    return stats
      .filter(stat => stat.playCount > 0)
      .sort((a, b) => b.lastPlayed.getTime() - a.lastPlayed.getTime())
      .slice(0, limit);
  }

  // Get most played tracks
  getMostPlayed(limit: number = 50): TrackStats[] {
    const stats = this.getAllStats();
    return stats
      .filter(stat => stat.playCount > 0)
      .sort((a, b) => b.playCount - a.playCount)
      .slice(0, limit);
  }

  // Get recently added tracks
  getRecentlyAdded(limit: number = 50): TrackStats[] {
    const stats = this.getAllStats();
    return stats
      .sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime())
      .slice(0, limit);
  }

  // Generate auto-playlists based on current tracks
  generateAutoPlaylists(tracks: Track[]): {
    recentlyPlayed: Track[];
    mostPlayed: Track[];
    recentlyAdded: Track[];
  } {
    const trackMap = new Map(tracks.map(t => [t.id, t]));
    
    const recentlyPlayedStats = this.getRecentlyPlayed(25);
    const mostPlayedStats = this.getMostPlayed(25);
    const recentlyAddedStats = this.getRecentlyAdded(25);
    
    const recentlyPlayed = recentlyPlayedStats
      .map(stat => trackMap.get(stat.trackId))
      .filter((track): track is Track => track !== undefined);
    
    const mostPlayed = mostPlayedStats
      .map(stat => trackMap.get(stat.trackId))
      .filter((track): track is Track => track !== undefined);
    
    const recentlyAdded = recentlyAddedStats
      .map(stat => trackMap.get(stat.trackId))
      .filter((track): track is Track => track !== undefined);
    
    return {
      recentlyPlayed,
      mostPlayed,
      recentlyAdded
    };
  }

  // Get overall statistics
  getOverallStats(): {
    totalTracks: number;
    totalPlays: number;
    totalPlayTime: number;
    averagePlayTime: number;
    mostPlayedTrack: string | null;
    recentActivity: number; // plays in last 7 days
  } {
    const stats = this.getAllStats();
    const history = this.getPlayHistory();
    
    const totalTracks = stats.length;
    const totalPlays = stats.reduce((sum, stat) => sum + stat.playCount, 0);
    const totalPlayTime = stats.reduce((sum, stat) => sum + stat.totalPlayTime, 0);
    const averagePlayTime = totalTracks > 0 ? totalPlayTime / totalTracks : 0;
    
    const mostPlayedStat = stats.reduce((max, stat) => 
      stat.playCount > max.playCount ? stat : max, 
      { playCount: 0, trackId: '' }
    );
    
    const mostPlayedTrack = mostPlayedStat.playCount > 0 ? mostPlayedStat.trackId : null;
    
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentActivity = history.filter(entry => entry.playedAt >= sevenDaysAgo).length;
    
    return {
      totalTracks,
      totalPlays,
      totalPlayTime,
      averagePlayTime,
      mostPlayedTrack,
      recentActivity
    };
  }

  // Initialize stats for new tracks
  initializeNewTracks(tracks: Track[]): void {
    const stats = this.getAllStats();
    const existingTrackIds = new Set(stats.map(s => s.trackId));
    
    const newTracks = tracks.filter(track => !existingTrackIds.has(track.id));
    
    if (newTracks.length > 0) {
      newTracks.forEach(track => {
        this.recordTrackAdded(track.id);
      });
    }
  }

  // Clear all statistics (for testing/reset)
  clearAllStats(): void {
    localStorage.removeItem(this.STATS_STORAGE_KEY);
    localStorage.removeItem(this.HISTORY_STORAGE_KEY);
  }

  // Private helper methods
  private saveStats(stats: TrackStats[]): void {
    try {
      localStorage.setItem(this.STATS_STORAGE_KEY, JSON.stringify(stats));
    } catch (error) {
      console.error('Error saving track stats:', error);
    }
  }

  private addToHistory(entry: PlayHistory): void {
    try {
      const history = this.getPlayHistory();
      history.unshift(entry); // Add to beginning
      
      // Limit history size
      if (history.length > this.MAX_HISTORY_ENTRIES) {
        history.splice(this.MAX_HISTORY_ENTRIES);
      }
      
      localStorage.setItem(this.HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving play history:', error);
    }
  }
}

export const trackStatsService = new TrackStatsService();