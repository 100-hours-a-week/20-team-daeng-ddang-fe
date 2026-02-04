import "./globals.css";

import { ReactNode } from "react";
import localFont from "next/font/local";
import { EmotionProvider } from "@/shared/lib/emotion-provider";
import Providers from "./providers";
import { LayoutClient } from "./layout-client";
import { AuthInitializer } from "@/widgets/Init/AuthInitializer";

const nanum = localFont({
  src: "../shared/assets/fonts/NanumSquareNeo-Variable.woff2",
  variable: "--font-nanum",
  weight: "45 950",
  display: "swap",
});

export const metadata = {
  title: "댕동여지도",
  description: "우리 강아지 산책 지도 서비스",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" className={nanum.variable}>
      <body>
        <EmotionProvider>
          <Providers>
            <AuthInitializer />
            <LayoutClient>{children}</LayoutClient>
          </Providers>
        </EmotionProvider>
      </body>
    </html>
  );
}
