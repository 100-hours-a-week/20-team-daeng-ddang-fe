// app/layout.tsx
'use client';

import './globals.css';

import { ReactNode } from 'react';
import { Modal } from '@/widgets/Modal/Modal';
import { Toast } from '@/widgets/Toast/Toast';
import { BottomNav } from '@/widgets/BottomNav/BottomNav';
import { GlobalLoading } from '@/widgets/Loading/GlobalLoading';

import Providers from './providers';
import { usePathname, useRouter } from 'next/navigation';

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <html lang="ko">
      <body>
        <Providers>
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
        </Providers>
      </body>
    </html>
  );
}
