'use client';

import { CacheProvider } from '@emotion/react';
import { ReactNode, useState } from 'react';
import { createEmotionCache } from './emotion-cache';

interface EmotionProviderProps {
    children: ReactNode;
}

export function EmotionProvider({ children }: EmotionProviderProps) {
    const [cache] = useState(() => createEmotionCache());

    return <CacheProvider value={cache}>{children}</CacheProvider>;
}
