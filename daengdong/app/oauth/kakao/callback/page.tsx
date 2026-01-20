"use client";

import { useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { kakaoLogin } from '@/shared/api/auth';
import { useAuthStore } from '@/shared/stores/authStore';
import { GlobalLoading } from '@/widgets/Loading/GlobalLoading';
import { useToastStore } from '@/shared/store/useToastStore';

function CallbackComponent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const code = searchParams.get('code');
    const setLoggedIn = useAuthStore((state) => state.setLoggedIn);

    const loginMutation = useMutation({
        mutationFn: kakaoLogin,
        onSuccess: (data) => {
            // Save Token to LocalStorage
            localStorage.setItem('accessToken', data.accessToken);
            setLoggedIn(true);
            router.replace('/walk');
        },
        onError: (error) => {
            console.error('Login failed:', error);
            const { showToast } = useToastStore.getState();
            showToast({
                message: '로그인에 실패했습니다. 다시 시도해주세요.',
                type: 'error',
                duration: 3000,
            });
            router.replace('/login');
        },
    });

    const processLogin = useCallback(() => {
        if (!code) {
            router.replace('/login');
            return;
        }

        if (!loginMutation.isPending && !loginMutation.isSuccess) {
            loginMutation.mutate(code);
        }
    }, [code, loginMutation, router]);

    // 🔥 이게 빠져 있었음
    useEffect(() => {
        processLogin();
    }, [processLogin]);

    return <GlobalLoading />;
}

export default function KakaoCallbackPage() {
    return (
        <Suspense fallback={<GlobalLoading />}>
            <CallbackComponent />
        </Suspense>
    );
}
