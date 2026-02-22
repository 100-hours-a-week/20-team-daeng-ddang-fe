"use client";

import { useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";
import { colors, spacing } from "@/shared/styles/tokens";
import { useToastStore } from "@/shared/stores/useToastStore";
import { pollAnalysisTask } from "@/shared/utils/expressionJobPolling";

interface ExpressionJobOverlayProps {
    walkId: number;
    taskId: string;
    onDone: () => void;
    label?: string;
    successMessage?: string;
}

export const ExpressionJobOverlay = ({ walkId, taskId, onDone, label = "표정 분석", successMessage }: ExpressionJobOverlayProps) => {
    const { showToast } = useToastStore();
    const [status, setStatus] = useState<string>("PENDING");
    const abortRef = useRef<AbortController | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        abortRef.current = controller;

        pollAnalysisTask(walkId, taskId, {
            onProgress: setStatus,
            signal: controller.signal,
        })
            .then(() => {
                showToast({
                    message: successMessage ?? `🐶 ${label} 완료! 결과는 산책일지에서 확인해주세요.`,
                    type: "success",
                });
                onDone();
            })
            .catch((err: Error) => {
                if (err.name === "AbortError") return;
                showToast({
                    message: err.message || `${label}에 실패했습니다.`,
                    type: "error",
                });
                onDone();
            });

        return () => {
            controller.abort();
        };
    }, [walkId, taskId, showToast, onDone, label, successMessage]);

    const statusLabel = status === "PENDING" ? "대기 중" : "분석 중";

    return (
        <Banner>
            <Left>
                <Spinner />
                <Text>🐶 {label} {statusLabel}</Text>
            </Left>
            <HintText>완료 시 알림</HintText>
        </Banner>
    );
};

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const Banner = styled.div`
    position: fixed;
    top: 16px;
    left: 50%;
    transform: translateX(-50%);
    width: min(360px, calc(100vw - 32px));
    background: white;
    border: 1.5px solid ${colors.primary[200]};
    border-radius: 99px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    padding: 10px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${spacing[3]}px;
    z-index: 100;
`;

const Left = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const Spinner = styled.div`
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    border: 2px solid ${colors.gray[200]};
    border-top-color: ${colors.primary[500]};
    border-radius: 50%;
    animation: ${spin} 0.9s linear infinite;
`;

const Text = styled.span`
    font-size: 13px;
    font-weight: 600;
    color: ${colors.gray[800]};
    white-space: nowrap;
`;

const HintText = styled.span`
    font-size: 12px;
    color: ${colors.gray[400]};
    white-space: nowrap;
    flex-shrink: 0;
`;
