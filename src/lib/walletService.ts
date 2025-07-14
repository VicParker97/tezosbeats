'use client';

import { MavrykToolkit } from '@mavrykdynamics/taquito';

export interface WalletService {
  connect: () => Promise<{ address: string; balance: string }>;
  disconnect: () => Promise<void>;
  getActiveAccount: () => Promise<string | null>;
  restoreSession: () => Promise<{ address: string; balance: string } | null>;
  isAvailable: () => boolean;
}

class BeaconWalletService implements WalletService {
  private dAppClient: unknown = null;
  private tezos: MavrykToolkit | null = null;
  private initialized = false;

  isAvailable(): boolean {
    return typeof window !== 'undefined';
  }

  private async initializeWallet() {
    if (this.initialized) return;
    
    try {
      // Dynamic import to avoid SSR issues
      const { DAppClient, BeaconEvent } = await import('@airgap/beacon-sdk');
      
      // Initialize DApp client with just the name as per GitHub example
      this.dAppClient = new DAppClient({ 
        name: 'TezosBeats' 
      });

      // Subscribe to account changes
      this.dAppClient.subscribeToEvent(BeaconEvent.ACTIVE_ACCOUNT_SET, async (account: unknown) => {
        console.log('Active account set:', account);
      });

      this.tezos = new MavrykToolkit('https://mainnet.api.tez.ie');
      this.tezos.setWalletProvider(this.dAppClient);
      
      console.log('Tezos toolkit initialized:', this.tezos);
      console.log('Tezos.tz available:', !!this.tezos.tz);
      
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize beacon wallet:', error);
      throw new Error('Failed to initialize wallet');
    }
  }

  async connect(): Promise<{ address: string; balance: string }> {
    if (!this.isAvailable()) {
      throw new Error('Wallet service not available');
    }

    await this.initializeWallet();
    
    if (!this.dAppClient || !this.tezos) {
      throw new Error('Wallet not initialized');
    }

    try {
      console.log('Requesting wallet permissions...');
      
      // Request permissions using beacon SDK (no network parameter needed)
      const permissions = await this.dAppClient.requestPermissions();
      
      console.log('Permissions received:', permissions);
      
      const userAddress = permissions.address;
      
      if (!userAddress) {
        console.error('No address in permissions:', permissions);
        throw new Error('Failed to get user address');
      }
      
      console.log('User address:', userAddress);

      // Try to get balance
      let balanceInTez = '0.00';
      try {
        console.log('Attempting to fetch balance for:', userAddress);
        console.log('Tezos instance:', this.tezos);
        console.log('Tezos.tz:', this.tezos?.tz);
        
        if (!this.tezos || !this.tezos.tz) {
          throw new Error('Tezos toolkit not properly initialized');
        }
        
        const balance = await this.tezos.tz.getBalance(userAddress);
        // Tezos balance is in mutez (1 Tez = 1,000,000 mutez)
        balanceInTez = balance.dividedBy(1000000).toFixed(6);
        console.log('Raw balance (mutez):', balance.toString());
        console.log('Converted balance (Tez):', balanceInTez);
      } catch (balanceError) {
        console.warn('Failed to fetch balance:', balanceError);
        
        // Fallback: try to fetch balance with a new Tezos instance
        try {
          console.log('Trying fallback balance fetch...');
          const fallbackTezos = new MavrykToolkit('https://mainnet.api.tez.ie');
          const balance = await fallbackTezos.tz.getBalance(userAddress);
          balanceInTez = balance.dividedBy(1000000).toFixed(6);
          console.log('Fallback balance successful:', balanceInTez);
        } catch (fallbackError) {
          console.warn('Fallback balance fetch also failed:', fallbackError);
        }
      }

      return {
        address: userAddress,
        balance: `${balanceInTez} ꜩ`
      };
    } catch (error) {
      console.error('Connection failed:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('rejected') || error.message.includes('denied')) {
          throw new Error('Connection rejected by user');
        } else if (error.message.includes('not found') || error.message.includes('no wallet')) {
          throw new Error('No supported wallet found. Please install Temple or Kukai.');
        }
      }
      
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.dAppClient) {
      try {
        await this.dAppClient.clearActiveAccount();
      } catch (error) {
        console.warn('Error during disconnect:', error);
      }
    }
  }

  async getActiveAccount(): Promise<string | null> {
    try {
      // Initialize if not already done
      if (!this.initialized) {
        await this.initializeWallet();
      }
      
      if (!this.dAppClient) return null;
      
      const activeAccount = await this.dAppClient.getActiveAccount();
      console.log('Active account check:', activeAccount);
      return activeAccount?.address || null;
    } catch (error) {
      console.warn('Failed to get active account:', error);
      return null;
    }
  }

  // New method to restore session
  async restoreSession(): Promise<{ address: string; balance: string } | null> {
    try {
      const activeAccount = await this.getActiveAccount();
      if (!activeAccount) return null;

      console.log('Restoring session for:', activeAccount);

      // Get balance for the restored account
      let balanceInTez = '0.00';
      try {
        if (this.tezos && this.tezos.tz) {
          const balance = await this.tezos.tz.getBalance(activeAccount);
          balanceInTez = balance.dividedBy(1000000).toFixed(6);
        } else {
          // Use fallback if main tezos instance isn't ready
          const fallbackTezos = new MavrykToolkit('https://mainnet.api.tez.ie');
          const balance = await fallbackTezos.tz.getBalance(activeAccount);
          balanceInTez = balance.dividedBy(1000000).toFixed(6);
        }
      } catch (balanceError) {
        console.warn('Failed to fetch balance during restore:', balanceError);
      }

      return {
        address: activeAccount,
        balance: `${balanceInTez} ꜩ`
      };
    } catch (error) {
      console.warn('Failed to restore session:', error);
      return null;
    }
  }
}

// Use real beacon wallet with GitHub implementation
export const walletService = new BeaconWalletService();