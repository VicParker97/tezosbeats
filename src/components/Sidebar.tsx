'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Music, 
  Home, 
  Disc, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Sun, 
  Moon,
  Wallet,
  Loader2,
  AlertCircle,
  FlaskConical
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { WalletState } from '@/hooks/useWallet';
import KeyboardShortcutsHelp from './KeyboardShortcutsHelp';

interface SidebarProps {
  onThemeToggle: () => void;
  isDark: boolean;
}

export default function Sidebar({ onThemeToggle, isDark }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('home');
  const { wallet, demoMode, toggleDemoMode } = useApp();

  const navigationItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'nfts', label: 'Meine NFTs', icon: Disc },
    { id: 'search', label: 'Suchen', icon: Search },
  ];

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} h-full bg-background border-r border-border transition-all duration-300 flex flex-col`}>
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
          <Music className="w-6 h-6 text-primary" />
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-foreground">TezosBeats</h1>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-8 h-8"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeItem === item.id ? 'secondary' : 'ghost'}
              className={`w-full ${isCollapsed ? 'justify-center px-2' : 'justify-start'} h-10`}
              onClick={() => setActiveItem(item.id)}
            >
              <Icon className="w-4 h-4" />
              {!isCollapsed && <span className="ml-3">{item.label}</span>}
            </Button>
          );
        })}
      </nav>

      <Separator />

      {/* Bottom section */}
      <div className="p-4 space-y-2">
        {/* Demo Mode Toggle */}
        <Button
          variant={demoMode ? "secondary" : "ghost"}
          size={isCollapsed ? 'icon' : 'default'}
          onClick={toggleDemoMode}
          className={`w-full ${isCollapsed ? 'justify-center px-2' : 'justify-start'} h-10`}
        >
          <FlaskConical className="w-4 h-4" />
          {!isCollapsed && <span className="ml-3">{demoMode ? 'Exit Demo' : 'Demo Mode'}</span>}
        </Button>

        {/* Theme and Shortcuts */}
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size={isCollapsed ? 'icon' : 'default'}
            onClick={onThemeToggle}
            className={`${isCollapsed ? 'w-full justify-center px-2' : 'flex-1 justify-start'} h-10`}
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {!isCollapsed && <span className="ml-3">Theme</span>}
          </Button>
          {!isCollapsed && <KeyboardShortcutsHelp />}
        </div>

        {/* Wallet connection */}
        {wallet.state === WalletState.CONNECTED ? (
          <div className="space-y-2">
            {!isCollapsed && (
              <div className="px-3 py-2 bg-primary/10 rounded-lg">
                <div className="text-xs text-muted-foreground">Connected</div>
                <div className="text-sm font-medium text-primary truncate">
                  {wallet.formatAddress(wallet.walletInfo?.address || '')}
                </div>
                <div className="text-xs text-muted-foreground">
                  {wallet.walletInfo?.balance}
                </div>
              </div>
            )}
            <Button
              variant="outline"
              size={isCollapsed ? 'icon' : 'default'}
              className={`w-full ${isCollapsed ? 'justify-center px-2' : 'justify-start'} h-10`}
              onClick={wallet.disconnect}
            >
              <Wallet className="w-4 h-4" />
              {!isCollapsed && <span className="ml-3">Disconnect</span>}
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size={isCollapsed ? 'icon' : 'default'}
            className={`w-full ${isCollapsed ? 'justify-center px-2' : 'justify-start'} h-10`}
            onClick={wallet.connect}
            disabled={wallet.isConnecting}
          >
            {wallet.isConnecting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : wallet.state === WalletState.ERROR ? (
              <AlertCircle className="w-4 h-4" />
            ) : (
              <Wallet className="w-4 h-4" />
            )}
            {!isCollapsed && (
              <span className="ml-3">
                {wallet.isConnecting ? 'Connecting...' : 
                 wallet.state === WalletState.ERROR ? 'Retry' : 'Connect Wallet'}
              </span>
            )}
          </Button>
        )}
        
        {/* Error message */}
        {wallet.error && !isCollapsed && (
          <div className="px-3 py-2 bg-destructive/10 rounded-lg">
            <div className="text-xs text-destructive">
              {wallet.error.message}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}