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
    const setAuth = useAuthStore((state) => state.setAuth);

    // Tanstack Query Mutation
    const loginMutation = useMutation({
        mutationFn: kakaoLogin,
        onSuccess: (data) => {
            setAuth({
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
            });
            // Always redirect to /walk regardless of isNewUser
            router.replace('/walk');
        },
        onError: (error) => {
            console.error('Login failed:', error);
            const { showToast } = useToastStore.getState();
            showToast({
                message: '로그인에 실패했습니다. 다시 시도해주세요.',
                type: 'error',
                duration: 3000
            });
            router.replace('/login');
        },
    });

    const processLogin = useCallback(() => {
        if (code && !loginMutation.isPending && !loginMutation.isSuccess) {
            loginMutation.mutate(code);
        } else if (!code) {
            // If no code, redirect to login
            router.replace('/login');
        }
    }, [code, loginMutation, router]);

    useEffect(() => {
        // Prevent double invocation in strict mode effects
        const timeout = setTimeout(() => {
            processLogin();
        }, 100);

        return () => clearTimeout(timeout);
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
