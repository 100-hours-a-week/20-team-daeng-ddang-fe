'use client';

import { CacheProvider } from '@emotion/react';
import { useServerInsertedHTML } from 'next/navigation';
import { useState } from 'react';
import { createEmotionCache } from './emotion-cache';

export function EmotionProvider({ children }: { children: React.ReactNode }) {
    const [cache] = useState(() => {
        const cache = createEmotionCache();
        cache.compat = true;
        return cache;
    });

    useServerInsertedHTML(() => {
        return (
            <style
                data-emotion={`${cache.key} ${Object.keys(cache.inserted).join(' ')}`}
                dangerouslySetInnerHTML={{
                    __html: Object.values(cache.inserted).join(' '),
                }}
            />
        );
    });

    return <CacheProvider value={cache}>{children}</CacheProvider>;
}
