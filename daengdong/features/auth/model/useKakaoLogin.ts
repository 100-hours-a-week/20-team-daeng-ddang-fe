import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { kakaoLogin } from '@/shared/api/auth';
import { useAuthStore } from '@/entities/session/model/store';
import { useToastStore } from '@/shared/stores/useToastStore';
import { useEffect, useCallback } from 'react';

export const useKakaoLogin = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const code = searchParams.get('code');
    const setLoggedIn = useAuthStore((state) => state.setLoggedIn);

    const loginMutation = useMutation({
        mutationFn: kakaoLogin,
        onSuccess: (data) => {
            localStorage.setItem('accessToken', data.accessToken);
            if (data.user.kakaoEmail) {
                localStorage.setItem('userEmail', data.user.kakaoEmail);
            }
            document.cookie = 'isLoggedIn=true; path=/; max-age=31536000';
            setLoggedIn(true);

            if (data.user.isAgreed === false) {
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

    return {
        isLoading: loginMutation.isPending,
        isSuccess: loginMutation.isSuccess,
        isError: loginMutation.isError,
    };
};
