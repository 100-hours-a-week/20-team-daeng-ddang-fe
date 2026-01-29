'use client';

import { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Modal } from '@/widgets/Modal/Modal';
import { Toast } from '@/widgets/Toast/Toast';
import { BottomNav } from '@/widgets/BottomNav/BottomNav';
import { GlobalLoading } from '@/widgets/Loading/GlobalLoading';
import { WalkManager } from '@/features/walk/ui/WalkManager';

export function LayoutClient({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    return (
        <>
            <WalkManager />
            {children}

            <Modal />
            <Toast />
            <GlobalLoading />
            {pathname !== '/login' && pathname !== '/oauth/kakao/callback' && (
                <BottomNav
                    currentPath={pathname}
                    onNavigate={(path) => router.push(path)}
                />
            )}
        </>
    );
}
