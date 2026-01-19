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

    // Tanstack Query Mutation (For Real API)
    const loginMutation = useMutation({
        mutationFn: kakaoLogin,
        onSuccess: (data) => {
            // Set Cookie for Middleware
            document.cookie = `accessToken=${data.accessToken}; path=/; max-age=3600`;

            // Update Store
            setLoggedIn(true);

            // Always redirect to /walk
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
        if (!code) {
            router.replace('/login');
            return;
        }

        // MOCK LOGIN FLOW
        if (code.startsWith('mock_auth_code')) {
            // Simulate network delay
            setTimeout(() => {
                document.cookie = "accessToken=mock-token; path=/; max-age=3600";
                setLoggedIn(true);

                const { showToast } = useToastStore.getState();
                showToast({
                    message: '성공적으로 로그인되었습니다 (Mock)',
                    type: 'success',
                    duration: 3000
                });

                router.replace('/walk');
            }, 500);
            return;
        }

        // REAL LOGIN FLOW
        if (!loginMutation.isPending && !loginMutation.isSuccess) {
            loginMutation.mutate(code);
        }
    }, [code, loginMutation, router, setLoggedIn]);

    useEffect(() => {
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
