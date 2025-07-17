'use client';

import { useEffect, useRef, useState } from 'react';
import { useApp } from '@/contexts/AppContext';

export default function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [hasValidAudio, setHasValidAudio] = useState(false);
  const { currentTrack, isPlaying, nextTrack, updateProgress, setLoading, currentTime } = useApp();
  
  const currentTrackRef = useRef(currentTrack);

  // Keep ref in sync
  useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);

  // Handle track changes and audio loading
  useEffect(() => {
    if (!audioRef.current) return;
    
    const audio = audioRef.current;
    
    // Reset states when track changes
    setIsReady(false);
    setHasValidAudio(false);
    
    if (currentTrack?.audioUrl) {
      console.log('Loading audio:', {
        title: currentTrack.title,
        audioUrl: currentTrack.audioUrl,
        isValidUrl: currentTrack.audioUrl.startsWith('http')
      });
      setLoading(true);
      audio.src = currentTrack.audioUrl;
      audio.load();
    } else if (currentTrack) {
      console.log('No audio URL for track:', {
        title: currentTrack.title,
        audioUrl: currentTrack.audioUrl,
        hasAudioUrl: !!currentTrack.audioUrl
      });
      setLoading(false);
      audio.src = '';
    } else {
      // Only log once per no-track state to avoid spam
      if (audio.src) {
        console.log('No current track available, clearing audio source');
        audio.src = '';
      }
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack?.id, currentTrack?.audioUrl, currentTrack?.title, setLoading]);

  // Handle play/pause when state changes
  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    
    console.log('Play state changed:', { isPlaying, hasValidAudio, isReady, audioSrc: audio.src });
    
    if (isPlaying && hasValidAudio && isReady) {
      console.log('Attempting to play audio');
      audio.play().catch((error) => {
        console.error('Playback failed:', error);
        // Don't auto-skip on playback errors, let user try again
      });
    } else if (!isPlaying && audio.src) {
      console.log('Pausing audio');
      audio.pause();
    }
  }, [isPlaying, hasValidAudio, isReady]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      const trackTitle = currentTrackRef.current?.title || 'Unknown track';
      console.log('Audio metadata loaded for:', trackTitle, { duration: audio.duration, src: audio.src });
      setIsReady(true);
      setHasValidAudio(true);
      setLoading(false);
      if (audio.duration) {
        updateProgress(audio.currentTime, audio.duration);
      }
    };

    const handleCanPlay = () => {
      const trackTitle = currentTrackRef.current?.title || 'Unknown track';
      console.log('Audio can play for:', trackTitle, audio.src);
      setIsReady(true);
      setHasValidAudio(true);
      setLoading(false);
    };

    const handleTimeUpdate = () => {
      if (audio.duration) {
        updateProgress(audio.currentTime, audio.duration);
      }
    };

    const handleEnded = () => {
      console.log('Audio ended, going to next track');
      nextTrack();
    };

    const handleError = (event) => {
      // Only handle errors if we have a valid track and audio source
      if (!currentTrackRef.current || !audio.src) {
        console.log('Audio error ignored - no current track or source');
        return;
      }
      
      const trackTitle = currentTrackRef.current.title;
      const errorDetails = event.target?.error;
      console.error('Audio error for track:', trackTitle, {
        error: errorDetails,
        errorCode: errorDetails?.code,
        errorMessage: errorDetails?.message,
        networkState: audio.networkState,
        readyState: audio.readyState,
        src: audio.src
      });
      setIsReady(false);
      setHasValidAudio(false);
      setLoading(false);
      // Don't auto-skip, let user see there's an audio issue
    };

    const handleLoadStart = () => {
      const trackTitle = currentTrackRef.current?.title || 'Unknown track';
      console.log('Audio load started for:', trackTitle);
      setIsReady(false);
      setLoading(true);
    };

    // Add event listeners
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadstart', handleLoadStart);

    return () => {
      // Remove event listeners
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadstart', handleLoadStart);
    };
  }, [nextTrack, currentTrack?.title, updateProgress, setLoading]);

  // Handle seeking
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !hasValidAudio) return;

    // Only seek if there's a significant difference (avoid constant seeking during normal playback)
    if (Math.abs(audio.currentTime - currentTime) > 1) {
      console.log('Seeking audio to:', currentTime);
      audio.currentTime = currentTime;
    }
  }, [currentTime, hasValidAudio]);

  return (
    <audio
      ref={audioRef}
      preload="metadata"
      className="hidden"
      aria-label={`Audio player for ${currentTrack?.title || 'current track'}`}
    />
  );
}