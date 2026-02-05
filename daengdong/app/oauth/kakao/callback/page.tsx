"use client";

import { Suspense } from 'react';
import { GlobalLoading } from '@/widgets/GlobalLoading';
import { KakaoCallbackHandler } from '@/features/auth/ui/KakaoCallbackHandler';

export default function KakaoCallbackPage() {
    return (
        <Suspense fallback={<GlobalLoading />}>
            <KakaoCallbackHandler />
        </Suspense>
    );
}
