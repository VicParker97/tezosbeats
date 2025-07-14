'use client';

import { Button } from '@/components/ui/button';
import { Music, Wallet, AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-4">
      {icon && (
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
          {icon}
        </div>
      )}
      <div className="space-y-2 max-w-md">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {action && (
        <Button onClick={action.onClick} variant="outline">
          {action.label}
        </Button>
      )}
    </div>
  );
}

export function NoMusicNFTsState({ onRefresh }: { 
  onRefresh: () => void;
}) {
  return (
    <EmptyState
      title="No music NFTs found"
      description="We couldn't find any music NFTs in your wallet. Try refreshing or explore our demo mode to see how TezosBeats works."
      icon={<Music className="w-8 h-8" />}
      action={{
        label: "Refresh",
        onClick: onRefresh
      }}
    />
  );
}

export function WalletNotConnectedState({ onConnect }: { onConnect: () => void }) {
  return (
    <EmptyState
      title="Connect your wallet"
      description="Connect your Tezos wallet to discover and play your music NFTs. Your audio collection awaits!"
      icon={<Wallet className="w-8 h-8" />}
      action={{
        label: "Connect Wallet",
        onClick: onConnect
      }}
    />
  );
}

export function ErrorState({ 
  title = "Something went wrong",
  description = "We encountered an error loading your data. Please try again.",
  onRetry 
}: { 
  title?: string;
  description?: string;
  onRetry: () => void;
}) {
  return (
    <EmptyState
      title={title}
      description={description}
      icon={<AlertCircle className="w-8 h-8" />}
      action={{
        label: "Try again",
        onClick: onRetry
      }}
    />
  );
}

export function LoadingProgressState({ 
  processed, 
  total, 
  found 
}: { 
  processed: number; 
  total: number; 
  found: number; 
}) {
  const percentage = total > 0 ? Math.round((processed / total) * 100) : 0;
  
  return (
    <div className="bg-card border rounded-lg p-6 text-center space-y-4">
      <div className="w-12 h-12 mx-auto relative">
        <div className="absolute inset-0 border-4 border-muted rounded-full" />
        <div 
          className="absolute inset-0 border-4 border-primary rounded-full transition-all duration-300"
          style={{
            background: `conic-gradient(from 0deg, hsl(var(--primary)) ${percentage * 3.6}deg, transparent ${percentage * 3.6}deg)`
          }}
        />
        <div className="absolute inset-2 bg-background rounded-full flex items-center justify-center">
          <span className="text-xs font-medium">{percentage}%</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="font-medium">Scanning your NFTs...</h3>
        <p className="text-sm text-muted-foreground">
          Found {found} music NFTs from {processed} of {total} tokens
        </p>
      </div>
    </div>
  );
}