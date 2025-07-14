'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Keyboard, X } from 'lucide-react';

interface Shortcut {
  key: string;
  description: string;
  icon?: string;
}

const shortcuts: Shortcut[] = [
  { key: 'Space', description: 'Play/Pause current track', icon: '⏯️' },
  { key: '←', description: 'Previous track', icon: '⏮️' },
  { key: '→', description: 'Next track', icon: '⏭️' },
  { key: '↑', description: 'Volume up', icon: '🔊' },
  { key: '↓', description: 'Volume down', icon: '🔉' },
  { key: 'M', description: 'Mute/Unmute', icon: '🔇' },
];

export default function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="text-muted-foreground hover:text-foreground"
        title="Keyboard shortcuts"
      >
        <Keyboard className="w-4 h-4" />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-semibold">Keyboard Shortcuts</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {shortcuts.map((shortcut) => (
                <div key={shortcut.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {shortcut.icon && (
                      <span className="text-lg" role="img" aria-hidden="true">
                        {shortcut.icon}
                      </span>
                    )}
                    <span className="text-sm text-muted-foreground">
                      {shortcut.description}
                    </span>
                  </div>
                  <kbd className="px-2 py-1 text-xs bg-muted rounded border">
                    {shortcut.key}
                  </kbd>
                </div>
              ))}
              <div className="pt-2 mt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Shortcuts work when not typing in input fields
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}