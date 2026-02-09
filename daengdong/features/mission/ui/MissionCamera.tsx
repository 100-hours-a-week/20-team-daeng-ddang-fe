import styled from "@emotion/styled";
import { useCallback, useEffect, useRef, useState } from "react";
import { colors, radius, spacing } from "@/shared/styles/tokens";
import { useToastStore } from "@/shared/stores/useToastStore";
import { useMissionStore } from "@/entities/mission/model/missionStore";
import { useRouter } from "next/navigation";
import { useLoadingStore } from "@/shared/stores/useLoadingStore";

interface MissionCameraProps {
    onComplete: (videoBlob: Blob) => Promise<void>;
    onIdleChange: (isIdle: boolean) => void;
}

type MissionFlowState = "IDLE" | "COUNTDOWN" | "RECORDING" | "PREVIEW" | "UPLOADING";

export const MissionCamera = ({ onComplete, onIdleChange }: MissionCameraProps) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const recorderRef = useRef<MediaRecorder | null>(null);
    const flowTimerRef = useRef<number | null>(null);
    const recordingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [stream, setStream] = useState<MediaStream | null>(null);
    const [previewURL, setPreviewURL] = useState<string | null>(null);
    const [flowState, setFlowState] = useState<MissionFlowState>("IDLE");
    const [timeLeft, setTimeLeft] = useState(60);
    const [countdown, setCountdown] = useState(3);
    const [recordingTimeLeft, setRecordingTimeLeft] = useState(5);
    const [error, setError] = useState<string | null>(null);

    const { showToast } = useToastStore();
    const { clearCurrentMission } = useMissionStore();
    const router = useRouter();
    const { showLoading, hideLoading } = useLoadingStore();

    // 상태 변경 감지
    useEffect(() => {
        onIdleChange(flowState === "IDLE");
    }, [flowState, onIdleChange]);

    // -- Handlers --

    const handleCancelMission = useCallback(() => {
        clearCurrentMission();
        router.replace("/walk");
    }, [clearCurrentMission, router]);

    const handleFailTimeout = useCallback(() => {
        showToast({ message: "시간이 초과되어 미션이 종료되었습니다.", type: "info" });
        handleCancelMission();
    }, [showToast, handleCancelMission]);

    const initializeCamera = useCallback(async () => {
        if (!navigator.mediaDevices?.getUserMedia) {
            setError("이 브라우저에서는 카메라를 사용할 수 없습니다.");
            return;
        }
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" },
                audio: true,
            });
            setStream(mediaStream);
        } catch (err) {
            console.error(err);
            setError("카메라 권한이 필요합니다.");
        }
    }, []);

    const handleUpload = useCallback(async (blob: Blob) => {
        setFlowState("UPLOADING");
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

    const stopRecording = useCallback(() => {
        if (recorderRef.current && recorderRef.current.state !== "inactive") {
            recorderRef.current.stop();
        }
    }, []);

    const startRecording = useCallback(() => {
        if (!stream) return;
        setFlowState("RECORDING");
        chunksRef.current = [];

        try {
            // Prefer MP4 if supported (Safari/Mobile), else WebM (Chrome)
            const mimeType = MediaRecorder.isTypeSupported("video/mp4")
                ? "video/mp4"
                : "video/webm";

            const recorder = new MediaRecorder(stream, { mimeType });
            recorderRef.current = recorder;

            recorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: mimeType });

                // iOS에서 blob이 비어있는 경우 에러 처리
                if (blob.size === 0) {
                    console.error('[돌발미션] 녹화된 영상이 비어있습니다.');
                    showToast({ message: "녹화된 영상이 비어있습니다. 다시 시도해주세요.", type: "error" });
                    setFlowState("IDLE");
                    return;
                }

                const url = URL.createObjectURL(blob);
                setPreviewURL(url);
                handleUpload(blob);
            };

            // iOS Safari: 작은 timeslice로 자주 데이터 수집 (100ms)
            recorder.start(100);
            setRecordingTimeLeft(5);

            // 1초마다 카운트다운 - 각 초를 확실히 표시
            let currentTime = 5;
            const countdownInterval = setInterval(() => {
                currentTime -= 1;
                setRecordingTimeLeft(currentTime);
                if (currentTime <= 0) {
                    clearInterval(countdownInterval);
                }
            }, 1000);

            // iOS Safari: 주기적으로 데이터 요청 (백업)
            const requestDataInterval = setInterval(() => {
                if (recorderRef.current?.state === 'recording') {
                    recorderRef.current.requestData();
                }
            }, 1000);

            // 5초 후 자동 종료
            recordingTimerRef.current = setTimeout(() => {
                clearInterval(countdownInterval);
                clearInterval(requestDataInterval);
                // 최종 데이터 요청
                if (recorderRef.current && recorderRef.current.state === 'recording') {
                    recorderRef.current.requestData();
                }
                // 약간의 딜레이 후 stop (데이터 수집 완료 대기)
                setTimeout(() => {
                    stopRecording();
                }, 100);
            }, 5000);
        } catch (e) {
            console.error(e);
            showToast({ message: "녹화를 시작할 수 없습니다.", type: "error" });
        }
    }, [stream, handleUpload, showToast, stopRecording]);

    const handleStartClick = useCallback(() => {
        if (!stream) return;
        if (flowTimerRef.current) window.clearInterval(flowTimerRef.current);
        setFlowState("COUNTDOWN");

        const countdownInterval = window.setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    window.clearInterval(countdownInterval);
                    startRecording();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [stream, startRecording]);

    // -- Effects --

    // 초기화 및 60초 타이머
    useEffect(() => {
        setTimeout(() => { initializeCamera().catch(console.error); }, 0);
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
            if (recordingTimerRef.current) clearTimeout(recordingTimerRef.current);
        };
    }, [initializeCamera, handleFailTimeout]);

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

    // 클린업
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach((track) => track.stop());
            }
            if (previewURL) {
                URL.revokeObjectURL(previewURL);
            }
        };
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

                {flowState === "IDLE" && (
                    <Overlay>
                        <TimerText>{timeLeft}</TimerText>
                        <SubText>초 안에 시작해주세요!</SubText>
                    </Overlay>
                )}

                {flowState === "COUNTDOWN" && (
                    <Overlay>
                        <CountdownText>{countdown}</CountdownText>
                        <SubText>잠시 후 촬영이 시작됩니다</SubText>
                    </Overlay>
                )}

                {flowState === "RECORDING" && (
                    <RecordingBadge>
                        <RecordingDot />
                        REC {recordingTimeLeft}s
                    </RecordingBadge>
                )}
            </VideoWrapper>

            <CTASection>
                {flowState === "IDLE" && (
                    <PrimaryButton onClick={handleStartClick}>촬영하기</PrimaryButton>
                )}
                {flowState === "RECORDING" && (
                    <InfoBox>촬영 중입니다...</InfoBox>
                )}
                {flowState === "UPLOADING" && (
                    <InfoBox>업로드 중...</InfoBox>
                )}
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

const VideoWrapper = styled.div`
    position: relative;
    width: 100%;
    height: 360px;
    border-radius: ${radius.lg};
    overflow: hidden;
    background-color: ${colors.gray[900]};
`;

const VideoElement = styled.video`
    width: 100%;
    height: 100%;
    object-fit: cover;
`;

const Overlay = styled.div`
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.4);
    gap: 8px;
`;

const TimerText = styled.span`
    font-size: 48px;
    font-weight: 800;
    color: ${colors.primary[500]};
`;

const CountdownText = styled.span`
    font-size: 80px;
    font-weight: 800;
    color: #fff;
`;

const SubText = styled.span`
    font-size: 16px;
    color: #fff;
    font-weight: 500;
`;

const RecordingBadge = styled.div`
    position: absolute;
    top: 16px;
    left: 16px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    background: rgba(229, 115, 115, 0.9);
    color: white;
    font-size: 14px;
    font-weight: 700;
    border-radius: 999px;
`;

const RecordingDot = styled.span`
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: white;
    animation: blink 1s infinite;
    
    @keyframes blink {
        50% { opacity: 0.5; }
    }
`;

const CTASection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${spacing[2]}px;
`;

const BaseButton = styled.button`
    width: 100%;
    padding: 16px;
    border-radius: ${radius.md};
    border: none;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
`;

const PrimaryButton = styled(BaseButton)`
    background: ${colors.primary[500]};
    color: white;
    &:active { background: ${colors.primary[600]}; }
`;

const InfoBox = styled.div`
    width: 100%;
    padding: 16px;
    text-align: center;
    background: ${colors.gray[100]};
    color: ${colors.gray[700]};
    border-radius: ${radius.md};
    font-weight: 600;
`;

const ErrorContainer = styled.div`
    padding: 40px 20px;
    text-align: center;
`;

const ErrorMessage = styled.p`
    color: ${colors.gray[800]};
    margin-bottom: 20px;
`;

const ErrorButton = styled(PrimaryButton)`
    width: auto;
    padding: 12px 24px;
`;
