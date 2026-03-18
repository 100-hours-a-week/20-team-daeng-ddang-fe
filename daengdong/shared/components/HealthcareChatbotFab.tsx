"use client";

import Image from "next/image";
import styled from "@emotion/styled";
import chatbotImage from "@/shared/assets/images/chatbot.png";
import { colors } from "@/shared/styles/tokens";
import { keyframes } from "@emotion/react";

interface HealthcareChatbotFabProps {
    onClick: () => void;
    tooltipText?: string;
}

export const HealthcareChatbotFab = ({
    onClick,
    tooltipText = "궁금한 점이 있나요? 🐾",
}: HealthcareChatbotFabProps) => {
    return (
        <FabWrapper>
            <TooltipBubble>{tooltipText}</TooltipBubble>
            <ChatFab type="button" onClick={onClick} aria-label="AI 챗봇 열기">
                <Image src={chatbotImage} alt="AI 챗봇" width={40} height={40} style={{ objectFit: "contain" }} />
            </ChatFab>
        </FabWrapper>
    );
};

const FabWrapper = styled.div`
    position: fixed;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 430px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 12px;
    padding-right: 20px;
    z-index: 1100;
    pointer-events: none;
`;

const float = keyframes`
    0% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
    100% { transform: translateY(0); }
`;

const TooltipBubble = styled.div`
    position: relative;
    padding: 8px 12px;
    background-color: ${colors.primary[500]};
    color: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
    animation: ${float} 2s ease-in-out infinite;
    pointer-events: auto;

    &::after {
        content: "";
        position: absolute;
        bottom: -6px;
        right: 24px;
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 6px solid ${colors.primary[500]};
    }
`;

const ChatFab = styled.button`
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background-color: white;
    border: none;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: transform 0.2s;
    pointer-events: auto;

    &:hover {
        img {
            transform: scale(1.1) rotate(-10deg);
        }
    }

    &:active {
        transform: scale(0.95);
    }

    img {
        transition: transform 0.3s;
    }
`;
