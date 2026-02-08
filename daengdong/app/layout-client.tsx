'use client';

import { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import styled from "@emotion/styled";
import { Modal } from '@/widgets/Modal';
import { Toast } from '@/widgets/Toast';
import { BottomNav } from '@/widgets/BottomNav';
import { GlobalLoading } from '@/widgets/GlobalLoading';
import { WalkManager } from '@/features/walk/ui/WalkManager';

export function LayoutClient({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    // BottomNav를 숨길 페이지 목록
    const hideBottomNavPaths = ['/login', '/oauth/kakao/callback', '/terms', '/walk/mission', '/walk/expression'];
    const shouldHideBottomNav = hideBottomNavPaths.some(path => pathname.startsWith(path));

    return (
        <MobileRoot>
            <MobileContainer>
                <Content>
                    <WalkManager />
                    {children}

                    <Modal />
                    <Toast />
                    <GlobalLoading />
                    {!shouldHideBottomNav && (
                        <BottomNav
                            currentPath={pathname}
                            onNavigate={(path) => router.push(path)}
                        />
                    )}
                </Content>
            </MobileContainer>
        </MobileRoot>
    );
}

const MobileRoot = styled.div`
    display: flex;
    justify-content: center;
    min-height: 100vh;
    background-color: #f5f5f5;
    width: 100%;
`;

const MobileContainer = styled.div`
    width: 100%;
    max-width: 430px;
    min-width: 360px;
    min-height: 100vh;
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
