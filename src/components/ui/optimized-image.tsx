'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Music } from 'lucide-react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  fallback?: string;
}

export default function OptimizedImage({ 
  src, 
  alt, 
  width, 
  height, 
  className,
  fallback 
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false);
  const [imgSrc, setImgSrc] = useState(src);

  // Handle data URLs and external images
  const isDataUrl = src.startsWith('data:');
  const isExternalUrl = src.startsWith('http');

  if (hasError || (!isDataUrl && !isExternalUrl)) {
    // Show fallback UI
    return (
      <div 
        className={`${className} flex items-center justify-center bg-muted`}
        style={{ width, height }}
      >
        <Music className="w-1/2 h-1/2 text-muted-foreground opacity-50" />
      </div>
    );
  }

  if (isDataUrl) {
    // Handle data URLs with regular img tag
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        onError={() => setHasError(true)}
      />
    );
  }

  // Handle external URLs with Next.js Image
  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => {
        if (fallback && imgSrc !== fallback) {
          setImgSrc(fallback);
        } else {
          setHasError(true);
        }
      }}
      unoptimized={isDataUrl}
    />
  );
}