import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '댕동여지도 - 배포 확인',
  description: '배포 확인용 웰컴 페이지입니다.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <main
          style={{
            display: 'flex',
            minHeight: '100vh',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#fff',
            color: '#000',
          }}
        >
          {children}
        </main>
      </body>
    </html>
  );
}
