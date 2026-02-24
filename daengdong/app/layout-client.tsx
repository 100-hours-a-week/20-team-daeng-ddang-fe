'use client';

import { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import styled from "@emotion/styled";
import { Modal } from '@/widgets/Modal';
import { Toast } from '@/widgets/Toast';
import { BottomNav } from '@/widgets/BottomNav';
import { GlobalLoading } from '@/widgets/GlobalLoading';
import { WalkManager } from '@/features/walk/ui/WalkManager';
import MotionProvider from '@/shared/components/MotionProvider';

export function LayoutClient({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    // BottomNav를 숨길 페이지 목록
    const hideBottomNavPaths = ['/login', '/oauth/kakao/callback', '/terms', '/walk/mission', '/walk/expression'];
    const shouldHideBottomNav = pathname ? hideBottomNavPaths.some(path => pathname.startsWith(path)) : false;

    return (
        <MobileRoot>
            <MobileContainer>
                <Content>
                    <MotionProvider>
                        <WalkManager />
                        {children}

                        <Modal />
                        <Toast />
                        <GlobalLoading />
                        {!shouldHideBottomNav && (
                            <BottomNav
                                currentPath={pathname || ''}
                                onNavigate={(path) => router.push(path)}
                            />
                        )}
                    </MotionProvider>
                </Content>
            </MobileContainer>
        </MobileRoot>
    );
}

const MobileRoot = styled.div`
    display: flex;
    justify-content: center;
    min-height: 100svh;
    background-color: #f5f5f5;
    width: 100%;
`;

const MobileContainer = styled.div`
    width: 100%;
    max-width: 430px;
    min-width: 360px;
    min-height: 100svh;
    background-color: #ffffff;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
    position: relative;
    display: flex;
    flex-direction: column;
`;

const Content = styled.div`
    flex: 1;
    position: relative;
    display: flex;
    flex-direction: column;
`;
