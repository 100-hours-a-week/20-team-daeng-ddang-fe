"use client";

import { useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { kakaoLogin } from '@/shared/api/auth';
import { useAuthStore } from '@/entities/session/model/store';
import { GlobalLoading } from '@/widgets/Loading/GlobalLoading';
import { useToastStore } from '@/shared/stores/useToastStore';

export const KakaoCallbackHandler = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const code = searchParams.get('code');
    const setLoggedIn = useAuthStore((state) => state.setLoggedIn);

    const loginMutation = useMutation({
        mutationFn: kakaoLogin,
        onSuccess: (data) => {
            localStorage.setItem('accessToken', data.accessToken);
            document.cookie = 'isLoggedIn=true; path=/; max-age=31536000'; // Middleware check
            setLoggedIn(true);

            // isNewUser 기반 라우팅
            // 신규 사용자는 약관 동의 페이지로, 기존 사용자는 산책 페이지로 이동
            if (data.isNewUser) {
                router.replace('/terms');
            } else {
                router.replace('/walk');
            }
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

    useEffect(() => {
        processLogin();
    }, [processLogin]);

    return <GlobalLoading />;
};
