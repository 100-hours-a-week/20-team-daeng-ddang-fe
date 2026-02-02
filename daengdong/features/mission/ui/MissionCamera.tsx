import styled from "@emotion/styled";
import { useCallback, useEffect, useRef, useState } from "react";
import { colors, spacing } from "@/shared/styles/tokens";
import { useToastStore } from "@/shared/stores/useToastStore";
import { useMissionStore } from "@/entities/mission/model/missionStore";
import { useRouter } from "next/navigation";
import { useLoadingStore } from "@/shared/stores/useLoadingStore";
import { useVideoRecorder } from "@/shared/hooks/useVideoRecorder";
import {
    VideoWrapper,
    VideoElement,
    Overlay,
    CountdownText,
    SubText,
    RecordingBadge,
    RecordingDot,
    PrimaryButton,
    InfoBox,
    ErrorContainer,
    ErrorMessage,
    CTASection,
} from "@/shared/components/camera/CameraComponents";

interface MissionCameraProps {
    onComplete: (videoBlob: Blob) => Promise<void>;
    onIdleChange: (isIdle: boolean) => void;
}

export const MissionCamera = ({ onComplete, onIdleChange }: MissionCameraProps) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const flowTimerRef = useRef<number | null>(null);
    const [timeLeft, setTimeLeft] = useState(60);

    const { showToast } = useToastStore();
    const { clearCurrentMission } = useMissionStore();
    const router = useRouter();
    const { showLoading, hideLoading } = useLoadingStore();

    const handleCancelMission = useCallback(() => {
        clearCurrentMission();
        router.replace("/walk");
    }, [clearCurrentMission, router]);

    const handleFailTimeout = useCallback(() => {
        showToast({ message: "시간이 초과되어 미션이 종료되었습니다.", type: "info" });
        handleCancelMission();
    }, [showToast, handleCancelMission]);

    const handleUpload = useCallback(async (blob: Blob) => {
        showLoading("미션 영상을 업로드 중입니다...");
        try {
            await onComplete(blob);
            showToast({ message: "🎉 돌발미션에 참여했습니다!", type: "success" });
            router.replace("/walk");
        } catch (e) {
            console.error(e);
            showToast({ message: "❌ 돌발미션에 실패했습니다.", type: "error" });
            router.replace("/walk");
        } finally {
            hideLoading();
        }
    }, [onComplete, showToast, router, showLoading, hideLoading]);

    const {
        stream,
        state,
        countdown,
        recordingTimeLeft,
        error,
        previewURL,
        startCountdown,
    } = useVideoRecorder({
        recordingDuration: 5,
        countdownDuration: 3,
        onRecordingComplete: handleUpload,
        autoStart: true,
    });

    // 상태 변경 알림
    useEffect(() => {
        onIdleChange(state === 'IDLE');
    }, [state, onIdleChange]);

    // 60초 타이머
    useEffect(() => {
        const timer = window.setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    window.clearInterval(timer);
                    handleFailTimeout();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        flowTimerRef.current = timer;

        return () => {
            if (flowTimerRef.current) window.clearInterval(flowTimerRef.current);
        };
    }, [handleFailTimeout]);

    // 비디오 스트림 연결
    useEffect(() => {
        if (videoRef.current && stream && !previewURL) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => { });
        } else if (videoRef.current && previewURL) {
            videoRef.current.srcObject = null;
            videoRef.current.src = previewURL;
            videoRef.current.play().catch(() => { });
        }
    }, [stream, previewURL]);

    if (error) {
        return (
            <ErrorContainer>
                <ErrorMessage>{error}</ErrorMessage>
                <ErrorButton onClick={handleCancelMission}>돌아가기</ErrorButton>
            </ErrorContainer>
        );
    }

    return (
        <Container>
            <VideoWrapper>
                <VideoElement ref={videoRef} playsInline muted />

                {state === "IDLE" && (
                    <Overlay>
                        <TimerText>{timeLeft}</TimerText>
                        <SubText>초 안에 시작해주세요!</SubText>
                    </Overlay>
                )}

                {state === "COUNTDOWN" && (
                    <Overlay>
                        <CountdownText>{countdown}</CountdownText>
                        <SubText>잠시 후 촬영이 시작됩니다</SubText>
                    </Overlay>
                )}

                {state === "RECORDING" && (
                    <RecordingBadge>
                        <RecordingDot />
                        REC {recordingTimeLeft}s
                    </RecordingBadge>
                )}
            </VideoWrapper>

            <CTASection>
                {state === "IDLE" && (
                    <PrimaryButton onClick={startCountdown}>촬영하기</PrimaryButton>
                )}
                {state === "RECORDING" && <InfoBox>촬영 중입니다...</InfoBox>}
                {state === "PROCESSING" && <InfoBox>업로드 중...</InfoBox>}
            </CTASection>
        </Container>
    );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[4]}px;
  padding: ${spacing[4]}px;
`;

const TimerText = styled.span`
  font-size: 48px;
  font-weight: 800;
  color: ${colors.primary[500]};
`;

const ErrorButton = styled(PrimaryButton)`
  width: auto;
  padding: 12px 24px;
`;
