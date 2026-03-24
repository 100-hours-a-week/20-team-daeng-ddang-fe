"use client";

import { Suspense, useEffect } from "react";
import styled from "@emotion/styled";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/widgets/Header";
import { ChatbotSection } from "@/features/chatbot/ui/ChatbotSection";

export default function ChatbotPage() {
    return (
        <Suspense fallback={null}>
            <ChatbotPageContent />
        </Suspense>
    );
}

function ChatbotPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnTo = searchParams.get("returnTo") || "/healthcare";

    useEffect(() => {
        const html = document.documentElement;
        const body = document.body;
        const prevHtml = html.style.overflow;
        const prevBody = body.style.overflow;
        html.style.overflow = "hidden";
        body.style.overflow = "hidden";
        return () => {
            html.style.overflow = prevHtml;
            body.style.overflow = prevBody;
        };
    }, []);

    return (
        <PageContainer>
            <Header
                title="AI 챗봇 상담"
                showBackButton={true}
                onBack={() => router.push(returnTo)}
            />
            <ChatbotSection />
        </PageContainer>
    );
}

const PageContainer = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    margin: 0 auto;
    width: 100%;
    max-width: 430px;
    height: 100svh;
    height: 100lvh;
    background-color: white;
    display: flex;
    flex-direction: column;
    z-index: 100;
`;
