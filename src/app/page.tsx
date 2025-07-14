'use client';

import { useApp } from '@/contexts/AppContext';
import Sidebar from '@/components/Sidebar';
import MainContent from '@/components/MainContent';
import Player from '@/components/Player';
import { useEffect, useState } from 'react';

export default function Home() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  const {
    isDark,
    toggleTheme,
    tracks,
    currentTrack,
    isPlaying,
    setCurrentTrack,
    togglePlayPause,
    nextTrack,
    previousTrack,
    toggleLike,
    isMobile,
  } = useApp();

  if (!isClient) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-background text-foreground">
      {/* Sidebar */}
      {!isMobile && (
        <Sidebar onThemeToggle={toggleTheme} isDark={isDark} />
      )}

      {/* Main Content Area */}
      <MainContent
        tracks={tracks}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onPlay={setCurrentTrack}
        onLike={toggleLike}
      />

      {/* Player */}
      <Player
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onPlayPause={togglePlayPause}
        onNext={nextTrack}
        onPrevious={previousTrack}
      />

      {/* Mobile Sidebar Overlay */}
      {isMobile && (
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-background border border-border shadow-lg"
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      )}
    </div>
  );
}
