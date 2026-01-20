// app/layout.tsx
"use client";

import "./globals.css";

import { ReactNode } from "react";
import localFont from "next/font/local";
import { Modal } from "@/widgets/Modal/Modal";
import { Toast } from "@/widgets/Toast/Toast";
import { BottomNav } from "@/widgets/BottomNav/BottomNav";
import { GlobalLoading } from "@/widgets/Loading/GlobalLoading";

import Providers from "./providers";
import { usePathname, useRouter } from "next/navigation";

const cafe24 = localFont({
  src: [
    {
      path: "../shared/assets/fonts/Cafe24Ssurround-v2.0.woff2",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "../shared/assets/fonts/Cafe24Ssurround-v2.0.woff",
      weight: "100 900",
      style: "normal",
    },
  ],
  variable: "--font-cafe24",
  display: "swap",
});

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <html lang="ko" className={cafe24.variable}>
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
