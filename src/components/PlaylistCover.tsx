'use client';

import { useMemo } from 'react';
import { Music } from 'lucide-react';
import OptimizedImage from '@/components/ui/optimized-image';
import { Track } from '@/lib/mockData';

interface PlaylistCoverProps {
  tracks: Track[];
  size?: number;
  className?: string;
}

export default function PlaylistCover({ tracks, size = 160, className = '' }: PlaylistCoverProps) {
  // Generate a stable color based on playlist content
  const generateColor = (tracks: Track[]): string => {
    if (tracks.length === 0) return '#6366f1'; // Default indigo
    
    // Create a simple hash from track titles and artists
    const hash = tracks
      .slice(0, 4)
      .map(t => `${t.title}${t.artist}`)
      .join('')
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Generate a hue based on the hash
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 50%)`;
  };

  // Get unique covers from tracks
  const uniqueCovers = useMemo(() => {
    const covers = tracks
      .filter(track => track.cover && track.cover.trim() !== '')
      .map(track => track.cover)
      .filter((cover, index, array) => array.indexOf(cover) === index) // Remove duplicates
      .slice(0, 4); // Only take first 4 unique covers
    
    return covers;
  }, [tracks]);

  const primaryColor = generateColor(tracks);
  const gridSize = size;
  const imageSize = size / 2;

  if (uniqueCovers.length === 0) {
    // Empty playlist or no covers - show default icon
    return (
      <div 
        className={`flex items-center justify-center rounded-lg ${className}`}
        style={{ 
          width: gridSize, 
          height: gridSize, 
          background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}99)` 
        }}
      >
        <Music className="w-1/2 h-1/2 text-white opacity-80" />
      </div>
    );
  }

  if (uniqueCovers.length === 1) {
    // Single cover - show it full size
    return (
      <div className={`rounded-lg overflow-hidden ${className}`}>
        <OptimizedImage 
          src={uniqueCovers[0]} 
          alt="Playlist cover"
          width={gridSize}
          height={gridSize}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Multiple covers - create a 2x2 grid
  const renderCoverGrid = () => {
    const covers = [...uniqueCovers];
    
    // Fill remaining spots with duplicates or gradient if needed
    while (covers.length < 4) {
      if (uniqueCovers.length > 0) {
        covers.push(uniqueCovers[covers.length % uniqueCovers.length]);
      } else {
        covers.push(''); // Will show gradient
      }
    }

    return (
      <div 
        className={`grid grid-cols-2 gap-0 rounded-lg overflow-hidden ${className}`}
        style={{ width: gridSize, height: gridSize }}
      >
        {covers.slice(0, 4).map((cover, index) => (
          <div
            key={index}
            className="relative"
            style={{ width: imageSize, height: imageSize }}
          >
            {cover ? (
              <OptimizedImage 
                src={cover} 
                alt={`Playlist cover ${index + 1}`}
                width={imageSize}
                height={imageSize}
                className="w-full h-full object-cover"
              />
            ) : (
              <div 
                className="w-full h-full flex items-center justify-center"
                style={{ 
                  background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}99)` 
                }}
              >
                <Music className="w-1/3 h-1/3 text-white opacity-60" />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return renderCoverGrid();
}