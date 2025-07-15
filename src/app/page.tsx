'use client';

import { useApp } from '@/contexts/AppContext';
import Sidebar from '@/components/Sidebar';
import MainContent from '@/components/MainContent';
import Player from '@/components/Player';
import { useEffect, useState } from 'react';
import { WalletState } from '@/hooks/useWallet';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    wallet,
  } = useApp();

  // Redirect to home when wallet disconnects
  useEffect(() => {
    if (wallet.state === WalletState.DISCONNECTED && activeSection !== 'home') {
      setActiveSection('home');
    }
  }, [wallet.state, activeSection]);

  if (!isClient) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-background text-foreground">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sidebar 
          onThemeToggle={toggleTheme} 
          isDark={isDark} 
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
      )}

      {/* Mobile Header */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <h1 className="text-lg font-bold text-foreground">TezosBeats</h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
            >
              {isDark ? '☀️' : '🌙'}
            </Button>
          </div>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Background overlay */}
          <div 
            className="fixed inset-0 bg-black/50" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Menu panel */}
          <div className="fixed top-0 left-0 h-full w-64 bg-background border-r border-border">
            <Sidebar 
              onThemeToggle={toggleTheme} 
              isDark={isDark} 
              activeSection={activeSection}
              onSectionChange={(section) => {
                setActiveSection(section);
                setIsMobileMenuOpen(false);
              }}
              isMobile={true}
              onClose={() => setIsMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className={`flex-1 ${isMobile ? 'pt-16' : ''}`}>
        <MainContent
          tracks={tracks}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          onPlay={setCurrentTrack}
          onLike={toggleLike}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
      </div>

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
