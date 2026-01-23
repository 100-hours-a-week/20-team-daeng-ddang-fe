"use client";

import { useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { kakaoLogin } from '@/shared/api/auth';
import { useAuthStore } from '@/entities/session/model/store';
import { GlobalLoading } from '@/widgets/Loading/GlobalLoading';
import { KakaoCallbackHandler } from '@/features/auth/ui/KakaoCallbackHandler';

export default function KakaoCallbackPage() {
    return (
        <Suspense fallback={<GlobalLoading />}>
            <KakaoCallbackHandler />
        </Suspense>
    );
}
