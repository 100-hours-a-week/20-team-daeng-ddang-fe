"use client";

import { Suspense } from "react";
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
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 430px;
    height: 100svh;
    background-color: white;
    display: flex;
    flex-direction: column;
    z-index: 100;
`;
