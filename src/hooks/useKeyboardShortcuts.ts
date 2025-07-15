'use client';

import { useEffect } from 'react';

interface KeyboardShortcuts {
  onPlayPause?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onVolumeUp?: () => void;
  onVolumeDown?: () => void;
  onMute?: () => void;
  onToggleShuffle?: () => void;
  onToggleRepeat?: () => void;
}

export function useKeyboardShortcuts({
  onPlayPause,
  onNext,
  onPrevious,
  onVolumeUp,
  onVolumeDown,
  onMute,
  onToggleShuffle,
  onToggleRepeat,
}: KeyboardShortcuts) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Prevent default behavior for handled keys
      const preventKeys = [' ', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'm', 'M', 's', 'S', 'r', 'R'];
      if (preventKeys.includes(event.key)) {
        event.preventDefault();
      }

      switch (event.key) {
        case ' ': // Spacebar for play/pause
          onPlayPause?.();
          break;
        case 'ArrowLeft': // Left arrow for previous
          onPrevious?.();
          break;
        case 'ArrowRight': // Right arrow for next
          onNext?.();
          break;
        case 'ArrowUp': // Up arrow for volume up
          onVolumeUp?.();
          break;
        case 'ArrowDown': // Down arrow for volume down
          onVolumeDown?.();
          break;
        case 'm':
        case 'M': // M for mute/unmute
          onMute?.();
          break;
        case 's':
        case 'S': // S for shuffle toggle
          onToggleShuffle?.();
          break;
        case 'r':
        case 'R': // R for repeat toggle
          onToggleRepeat?.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onPlayPause, onNext, onPrevious, onVolumeUp, onVolumeDown, onMute, onToggleShuffle, onToggleRepeat]);
}