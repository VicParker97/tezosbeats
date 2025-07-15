export interface Playlist {
  id: string;
  name: string;
  description?: string;
  trackIds: string[];
  createdAt: Date;
  updatedAt: Date;
  coverImage?: string;
  isPublic: boolean;
}

export interface PlaylistTrack {
  trackId: string;
  addedAt: Date;
  position: number;
}

export interface CreatePlaylistRequest {
  name: string;
  description?: string;
  isPublic?: boolean;
}

export interface UpdatePlaylistRequest {
  name?: string;
  description?: string;
  isPublic?: boolean;
}

export interface PlaylistWithTracks extends Playlist {
  tracks: import('@/lib/mockData').Track[];
}