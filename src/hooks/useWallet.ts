'use client';

import { useState, useEffect, useCallback } from 'react';
import { walletService } from '@/lib/walletService';

export enum WalletState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error'
}

export interface WalletError {
  message: string;
  code?: string;
  type: 'connection' | 'network' | 'permission' | 'unknown';
}

export interface WalletInfo {
  address: string;
  balance: string;
  network: string;
}

export interface UseWalletReturn {
  // State
  state: WalletState;
  walletInfo: WalletInfo | null;
  error: WalletError | null;
  
  // Actions
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  
  // Utils
  formatAddress: (address: string) => string;
  isConnected: boolean;
  isConnecting: boolean;
  
  // Tezos toolkit for advanced operations
  tezos: unknown;
}

export const useWallet = (): UseWalletReturn => {
  const [state, setState] = useState<WalletState>(WalletState.DISCONNECTED);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [error, setError] = useState<WalletError | null>(null);

  // Check for existing connection on mount and restore session
  useEffect(() => {
    const restoreWalletSession = async () => {
      if (!walletService.isAvailable()) return;
      
      try {
        setState(WalletState.CONNECTING);
        const restored = await walletService.restoreSession();
        
        if (restored) {
          console.log('Session restored:', restored);
          setWalletInfo({
            address: restored.address,
            balance: restored.balance,
            network: 'Mainnet'
          });
          setState(WalletState.CONNECTED);
        } else {
          setState(WalletState.DISCONNECTED);
        }
      } catch (err) {
        console.error('Error restoring session:', err);
        setState(WalletState.DISCONNECTED);
      }
    };

    // Add a small delay to ensure the component is fully mounted
    const timer = setTimeout(() => {
      restoreWalletSession();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const connect = useCallback(async () => {
    if (!walletService.isAvailable()) {
      setError({
        message: 'Wallet service not available',
        type: 'unknown'
      });
      return;
    }

    try {
      setState(WalletState.CONNECTING);
      setError(null);

      const result = await walletService.connect();
      
      setWalletInfo({
        address: result.address,
        balance: result.balance,
        network: 'Mainnet'
      });
      
      setState(WalletState.CONNECTED);
      
      // Store connection in localStorage
      localStorage.setItem('tezosbeats_wallet_connected', 'true');
      
    } catch (err: unknown) {
      console.error('Wallet connection failed:', err);
      
      let errorMessage = 'Failed to connect wallet';
      let errorType: WalletError['type'] = 'connection';

      const errorMsg = err instanceof Error ? err.message : String(err);
      
      if (errorMsg.includes('not installed')) {
        errorMessage = 'Wallet not installed. Please install Temple or Kukai wallet extension.';
        errorType = 'connection';
      } else if (errorMsg.includes('rejected')) {
        errorMessage = 'Connection rejected by user';
        errorType = 'permission';
      } else if (errorMsg.includes('network')) {
        errorMessage = 'Network connection failed';
        errorType = 'network';
      } else if (errorMsg) {
        errorMessage = errorMsg;
      }

      setError({
        message: errorMessage,
        type: errorType
      });
      
      setState(WalletState.ERROR);
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      setState(WalletState.CONNECTING);
      
      await walletService.disconnect();
      
      setWalletInfo(null);
      setError(null);
      setState(WalletState.DISCONNECTED);
      
      // Remove from localStorage
      localStorage.removeItem('tezosbeats_wallet_connected');
      
    } catch (err) {
      console.error('Failed to disconnect wallet:', err);
      setError({
        message: 'Failed to disconnect wallet',
        type: 'unknown'
      });
      setState(WalletState.ERROR);
    }
  }, []);

  const formatAddress = useCallback((address: string): string => {
    if (!address) return '';
    return `${address.slice(0, 7)}...${address.slice(-4)}`;
  }, []);

  return {
    state,
    walletInfo,
    error,
    connect,
    disconnect,
    formatAddress,
    isConnected: state === WalletState.CONNECTED,
    isConnecting: state === WalletState.CONNECTING,
    tezos: null
  };
};