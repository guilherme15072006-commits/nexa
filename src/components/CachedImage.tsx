/**
 * NEXA — Cached Image Component
 *
 * Wraps @d11/react-native-fast-image for disk caching.
 * Falls back to RN Image if FastImage unavailable.
 * Provides preload utility for critical assets.
 */

import React from 'react';
import { Image, type ImageProps, type ImageStyle } from 'react-native';

// Lazy load — graceful fallback if not linked
let FastImageModule: any = null;
try {
  FastImageModule = require('@d11/react-native-fast-image').default;
} catch {
  // Not available — use RN Image
}

interface CachedImageProps {
  uri: string;
  style?: ImageStyle;
  resizeMode?: 'contain' | 'cover' | 'stretch' | 'center';
  priority?: 'low' | 'normal' | 'high';
}

export function CachedImage({ uri, style, resizeMode = 'cover', priority = 'normal' }: CachedImageProps) {
  if (FastImageModule) {
    const priorityMap = { low: 0, normal: 1, high: 2 };
    return (
      <FastImageModule
        source={{ uri, priority: priorityMap[priority], cache: 'immutable' }}
        style={style}
        resizeMode={resizeMode}
      />
    );
  }

  return (
    <Image
      source={{ uri }}
      style={style}
      resizeMode={resizeMode}
    />
  );
}

/** Preload images for faster display */
export function preloadImages(uris: string[]): void {
  if (FastImageModule?.preload) {
    FastImageModule.preload(uris.map(uri => ({ uri })));
  } else {
    uris.forEach(uri => Image.prefetch(uri));
  }
}

/** Clear disk cache */
export async function clearImageCache(): Promise<void> {
  if (FastImageModule?.clearDiskCache) {
    await FastImageModule.clearDiskCache();
    await FastImageModule.clearMemoryCache();
  }
}
