"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import styled from '@emotion/styled';
import { devLogin } from '@/shared/api/auth';
import { useAuthStore } from '@/entities/session/model/store';
import { useToastStore } from '@/shared/stores/useToastStore';

export const DevLoginButton = () => {
    const [mounted, setMounted] = useState(false);
    const router = useRouter();
    const setLoggedIn = useAuthStore((state) => state.setLoggedIn);

    // Ensure component only renders on client-side to prevent hydration mismatch
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    const loginMutation = useMutation({
        mutationFn: devLogin,
        onSuccess: (data) => {
            localStorage.setItem('accessToken', data.accessToken);
            document.cookie = 'isLoggedIn=true; path=/; max-age=31536000';
            setLoggedIn(true);

            // isNewUser 기반 라우팅
            if (data.isNewUser) {
                router.replace('/terms');
            } else {
                router.replace('/walk');
            }
        },
        onError: (error) => {
            console.error('Dev login failed:', error);
            const { showToast } = useToastStore.getState();
            showToast({
                message: 'Dev 로그인에 실패했습니다.',
                type: 'error',
                duration: 3000,
            });
        },
    });

    // Return null during SSR and before mounting
    if (!mounted) {
        return null;
    }

    // localhost에서만 Dev Login 버튼 표시 
    const isLocalhost = window.location.hostname === 'localhost';

    if (!isLocalhost) {
        return null;
    }

    const handleNewUserLogin = () => {
        loginMutation.mutate({
            kakaoUserId: 999999,
            nickname: 'dev-new-user',
            prefix: 'new',
        });
    };

    const handleExistingUserLogin = () => {
        loginMutation.mutate({
            kakaoUserId: 888888,
            nickname: 'dev-existing-user',
            prefix: 'existing',
        });
    };

    return (
        <DevContainer>
            <DevBadge>DEV MODE</DevBadge>
            <Divider />
            <ButtonGroup>
                <DevButton
                    onClick={handleNewUserLogin}
                    disabled={loginMutation.isPending}
                    variant="new"
                >
                    {loginMutation.isPending ? '로그인 중...' : '🆕 신규 유저로 로그인'}
                </DevButton>
                <DevButton
                    onClick={handleExistingUserLogin}
                    disabled={loginMutation.isPending}
                    variant="existing"
                >
                    {loginMutation.isPending ? '로그인 중...' : '👤 기존 유저로 로그인'}
                </DevButton>
            </ButtonGroup>
        </DevContainer>
    );
};

const DevContainer = styled.div`
    width: 100%;
    padding: 16px;
    background-color: #fff3cd;
    border: 2px dashed #ffc107;
    border-radius: 12px;
    margin-bottom: 16px;
`;

const DevBadge = styled.div`
    display: inline-block;
    padding: 4px 12px;
    background-color: #ff9800;
    color: white;
    font-size: 12px;
    font-weight: 700;
    border-radius: 4px;
    margin-bottom: 12px;
`;

const Divider = styled.div`
    height: 1px;
    background-color: #ffc107;
    margin: 12px 0;
`;

const ButtonGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const DevButton = styled.button<{ disabled: boolean; variant: 'new' | 'existing' }>`
    width: 100%;
    padding: 12px;
    font-size: 14px;
    font-weight: 600;
    color: white;
    background-color: ${props => {
        if (props.disabled) return '#d1d5db';
        return props.variant === 'new' ? '#10b981' : '#3b82f6';
    }};
    border: none;
    border-radius: 8px;
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
    transition: all 0.2s;

    &:hover {
        background-color: ${props => {
        if (props.disabled) return '#d1d5db';
        return props.variant === 'new' ? '#059669' : '#2563eb';
    }};
        transform: ${props => props.disabled ? 'none' : 'translateY(-1px)'};
    }

    &:active {
        transform: ${props => props.disabled ? 'none' : 'translateY(0)'};
    }
`;
