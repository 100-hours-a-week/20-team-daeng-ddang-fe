// app/layout.tsx
'use client';

import { ReactNode } from 'react';
import { Modal } from '@/widgets/Modal/Modal';
import { Toast } from '@/widgets/Toast/Toast';
import { BottomNav } from '@/widgets/BottomNav/BottomNav';
import { Header } from '@/widgets/Header/Header';
import { GlobalLoading } from '@/widgets/Loading/GlobalLoading';

import { usePathname, useRouter } from 'next/navigation';

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <html lang="ko">
      <body>
        <Header title="댕동여지도" showBackButton={false} />
        {children}

        <Modal />
        <Toast />
        <GlobalLoading />
        <BottomNav
          currentPath={pathname}
          onNavigate={(path) => router.push(path)}
        />
      </body>
    </html>
  );
}
