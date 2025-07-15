'use client';

import { useEffect, useRef, useState } from 'react';
import { useApp } from '@/contexts/AppContext';

export default function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [hasValidAudio, setHasValidAudio] = useState(false);
  const { currentTrack, isPlaying, nextTrack } = useApp();

  // Handle track changes and audio loading
  useEffect(() => {
    if (!audioRef.current) return;
    
    const audio = audioRef.current;
    
    // Reset states when track changes
    setIsReady(false);
    setHasValidAudio(false);
    
    if (currentTrack?.audioUrl) {
      audio.src = currentTrack.audioUrl;
      audio.load();
    } else {
      audio.src = '';
    }
  }, [currentTrack?.audioUrl]);

  // Handle play/pause when state changes
  useEffect(() => {
    if (!audioRef.current || !hasValidAudio || !isReady) return;

    const audio = audioRef.current;
    
    if (isPlaying) {
      audio.play().catch((error) => {
        console.warn('Playback failed:', error.message);
        // Don't auto-skip on playback errors, let user try again
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, hasValidAudio, isReady]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setIsReady(true);
      setHasValidAudio(true);
    };

    const handleCanPlay = () => {
      setIsReady(true);
      setHasValidAudio(true);
    };

    const handleEnded = () => {
      nextTrack();
    };

    const handleError = (event) => {
      console.warn('Audio error for track:', currentTrack?.title, event.target?.error);
      setIsReady(false);
      setHasValidAudio(false);
      // Don't auto-skip, let user see there's an audio issue
    };

    const handleLoadStart = () => {
      setIsReady(false);
    };

    // Add event listeners
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadstart', handleLoadStart);

    return () => {
      // Remove event listeners
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadstart', handleLoadStart);
    };
  }, [nextTrack, currentTrack?.title]);

  return (
    <audio
      ref={audioRef}
      preload="metadata"
      className="hidden"
      aria-label={`Audio player for ${currentTrack?.title || 'current track'}`}
    />
  );
}