'use client';

import { useApp } from '@/contexts/AppContext';
import Sidebar from '@/components/Sidebar';
import MainContent from '@/components/MainContent';
import AudioPlayer from '@/components/AudioPlayer';
import MobilePlayer from '@/components/MobilePlayer';
import MobilePlayerBar from '@/components/MobilePlayerBar';
import { useEffect, useState } from 'react';
import { WalletState } from '@/hooks/useWallet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

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
    toggleLike,
    isMobile,
    wallet,
    isMobilePlayerOpen,
    closeMobilePlayer,
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
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div className="sticky top-0 h-screen">
          <Sidebar 
            onThemeToggle={toggleTheme} 
            isDark={isDark} 
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />
        </div>
      )}

      {/* Mobile Header */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(true)}
                className="w-10 h-10"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <h1 className="text-lg font-bold text-foreground">TezosBeats</h1>
            </div>
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
          <div className="fixed top-0 left-0 h-full w-80 bg-background border-r border-border shadow-2xl animate-in slide-in-from-left duration-300">
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
      <div className={`flex-1 ${isMobile ? 'pt-16' : ''} ${isMobile && currentTrack ? 'pb-20' : ''}`}>
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

      {/* Audio Player (Hidden) */}
      <AudioPlayer />

      {/* Mobile Player Components */}
      {isMobile && (
        <>
          <MobilePlayerBar />
          <MobilePlayer 
            isOpen={isMobilePlayerOpen}
            onClose={closeMobilePlayer}
          />
        </>
      )}

    </div>
  );
}
