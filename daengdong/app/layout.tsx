import "./globals.css";

import { ReactNode } from "react";
import localFont from "next/font/local";
import { EmotionProvider } from "@/shared/lib/emotion-provider";
import Providers from "./providers";
import { LayoutClient } from "./layout-client";

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
  return (
    <html lang="ko" className={cafe24.variable}>
      <body>
        <EmotionProvider>
          <Providers>
            <LayoutClient>{children}</LayoutClient>
          </Providers>
        </EmotionProvider>
      </body>
    </html>
  );
}
