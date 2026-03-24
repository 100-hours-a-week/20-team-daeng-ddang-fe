import type { ReactNode } from "react";
import type { Viewport } from "next";

export const viewport: Viewport = {
    interactiveWidget: "overlays-content",
};

export default function ChatbotLayout({ children }: { children: ReactNode }) {
    return <>{children}</>;
}
