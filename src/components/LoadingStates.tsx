'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function TrackItemSkeleton() {
  return (
    <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg">
      {/* Cover */}
      <Skeleton className="w-10 h-10 md:w-12 md:h-12 rounded-lg" />
      
      {/* Track Info */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-32 md:w-40" />
          <Skeleton className="h-5 w-16 rounded-full hidden md:block" />
        </div>
        <Skeleton className="h-3 w-24 md:w-32" />
      </div>
      
      {/* Duration */}
      <Skeleton className="h-3 w-8 md:w-10" />
      
      {/* Actions */}
      <div className="flex items-center gap-1">
        <Skeleton className="w-6 h-6 md:w-8 md:h-8 rounded" />
        <Skeleton className="w-6 h-6 md:w-8 md:h-8 rounded hidden md:block" />
      </div>
    </div>
  );
}

export function TrackListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-1">
      {Array.from({ length: count }).map((_, index) => (
        <TrackItemSkeleton key={index} />
      ))}
    </div>
  );
}

export function PlayerSkeleton() {
  return (
    <div className="fixed bottom-0 left-0 md:left-64 right-0 h-16 bg-background border-t border-border px-2 md:px-4 flex items-center justify-between z-30">
      {/* Track Info */}
      <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
        <Skeleton className="w-10 h-10 md:w-12 md:h-12 rounded-lg" />
        <div className="min-w-0 flex-1 space-y-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-1 md:gap-2 flex-1 max-w-sm md:max-w-md">
        <div className="flex items-center gap-1 md:gap-2">
          <Skeleton className="w-7 h-7 md:w-8 md:h-8 rounded" />
          <Skeleton className="w-8 h-8 md:w-10 md:h-10 rounded" />
          <Skeleton className="w-7 h-7 md:w-8 md:h-8 rounded" />
        </div>
        <div className="flex items-center gap-1 md:gap-2 w-full">
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-2 flex-1 rounded-full" />
          <Skeleton className="h-3 w-8" />
        </div>
      </div>

      {/* Volume */}
      <div className="hidden md:flex items-center gap-2 flex-1 justify-end">
        <Skeleton className="w-8 h-8 rounded" />
        <Skeleton className="h-2 w-24 rounded-full" />
      </div>
    </div>
  );
}

export function NFTLoadingCard() {
  return (
    <div className="bg-card border rounded-lg p-6 text-center space-y-4">
      <div className="animate-spin mx-auto w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      <div className="space-y-2">
        <h3 className="font-medium">Loading your music NFTs...</h3>
        <p className="text-sm text-muted-foreground">This may take a moment</p>
      </div>
    </div>
  );
}