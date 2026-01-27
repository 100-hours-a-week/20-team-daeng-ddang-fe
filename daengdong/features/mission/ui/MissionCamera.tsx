import styled from "@emotion/styled";
import { useEffect, useRef, useState } from "react";
import { colors, radius, spacing } from "@/shared/styles/tokens";
import { useToastStore } from "@/shared/stores/useToastStore";
import { useMissionStore } from "@/entities/mission/model/missionStore";
import { useRouter } from "next/navigation";

interface MissionCameraProps {
    missionId: number;
    onComplete: (videoBlob: Blob) => void;
}

export const MissionCamera = ({ missionId, onComplete }: MissionCameraProps) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const recorderRef = useRef<MediaRecorder | null>(null);
    const countdownTimerRef = useRef<number | null>(null);

    const [stream, setStream] = useState<MediaStream | null>(null);
    const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
    const [previewURL, setPreviewURL] = useState<string | null>(null);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { showToast } = useToastStore();
    const { clearCurrentMission } = useMissionStore();
    const router = useRouter();

    const initializeCamera = async () => {
        if (!navigator.mediaDevices?.getUserMedia) {
            const message = "이 브라우저에서는 카메라를 사용할 수 없습니다.";
            setError(message);
            showToast({ message, type: "error" });
            return;
        }

        if (!window.isSecureContext) {
            const message = "보안 연결(HTTPS)에서만 카메라를 사용할 수 있습니다.";
            setError(message);
            showToast({ message, type: "error" });
            return;
        }

        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user" },
                audio: true,
            });
            setStream(mediaStream);
            setError(null);
        } catch (err) {
            console.error("카메라 접근 실패:", err);
            const message = "카메라 권한이 필요합니다. 권한을 허용해주세요.";
            setError(message);
            showToast({ message, type: "error" });
        }
    };

    const startCountdown = () => {
        if (!stream) {
            initializeCamera();
            return;
        }
        if (countdownTimerRef.current) {
            window.clearInterval(countdownTimerRef.current);
        }
        setCountdown(3);
        countdownTimerRef.current = window.setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    window.clearInterval(countdownTimerRef.current!);
                    countdownTimerRef.current = null;
                    startRecording();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const startRecording = () => {
        if (!stream) return;
        if (!("MediaRecorder" in window)) {
            const message = "이 브라우저에서는 녹화를 지원하지 않습니다.";
            setError(message);
            showToast({ message, type: "error" });
            return;
        }

        chunksRef.current = [];
        const newRecorder = new MediaRecorder(stream);
        recorderRef.current = newRecorder;
        setRecorder(newRecorder);

        newRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                chunksRef.current.push(event.data);
            }
        };

        newRecorder.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: newRecorder.mimeType });
            const url = URL.createObjectURL(blob);
            setRecordedBlob(blob);
            setPreviewURL(url);
            setIsRecording(false);
        };

        newRecorder.start();
        setIsRecording(true);
    };

    const stopRecording = () => {
        if (recorderRef.current && recorderRef.current.state !== "inactive") {
            recorderRef.current.stop();
        }
    };

    const resetRecording = () => {
        if (previewURL) {
            URL.revokeObjectURL(previewURL);
        }
        setPreviewURL(null);
        setRecordedBlob(null);
        setIsRecording(false);
        setCountdown(0);
    };

    const handleSubmit = async () => {
        if (!recordedBlob) return;
        setIsSubmitting(true);
        try {
            await Promise.resolve(onComplete(recordedBlob));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelMission = () => {
        clearCurrentMission();
        router.replace("/walk");
    };

    useEffect(() => {
        initializeCamera();
        return () => {
            if (countdownTimerRef.current) {
                window.clearInterval(countdownTimerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!videoRef.current) return;

        if (previewURL) {
            videoRef.current.srcObject = null;
            videoRef.current.src = previewURL;
            videoRef.current.controls = true;
            videoRef.current.play().catch(() => undefined);
            return;
        }

        if (stream) {
            videoRef.current.srcObject = stream;
            videoRef.current.controls = false;
            videoRef.current.muted = true;
            videoRef.current.play().catch(() => undefined);
        }
    }, [stream, previewURL]);

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
                <ErrorButton onClick={initializeCamera}>권한 다시 요청</ErrorButton>
                <ErrorOutlineButton onClick={handleCancelMission}>미션 취소</ErrorOutlineButton>
            </ErrorContainer>
        );
    }

    return (
        <Container>
            <VideoWrapper>
                <VideoElement ref={videoRef} playsInline />
                <GuideBox />
                {countdown > 0 && <CountdownOverlay>{countdown}</CountdownOverlay>}
                {isRecording && (
                    <RecordingBadge>
                        <RecordingDot />
                        REC
                    </RecordingBadge>
                )}
            </VideoWrapper>

            <CTASection>
                {!previewURL && !isRecording && (
                    <PrimaryButton onClick={startCountdown}>촬영 시작</PrimaryButton>
                )}
                {isRecording && (
                    <DangerButton onClick={stopRecording}>정지(완료)</DangerButton>
                )}
                {previewURL && !isRecording && (
                    <ButtonRow>
                        <SecondaryButton onClick={resetRecording}>다시 촬영</SecondaryButton>
                        <PrimaryButton onClick={handleSubmit} disabled={isSubmitting}>
                            제출하기
                        </PrimaryButton>
                    </ButtonRow>
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
    height: 420px;
    border-radius: ${radius.lg};
    overflow: hidden;
    background-color: ${colors.gray[900]};
`;

const VideoElement = styled.video`
    width: 100%;
    height: 100%;
    object-fit: cover;
`;

const GuideBox = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    width: 70%;
    height: 55%;
    border: 2px solid rgba(255, 255, 255, 0.8);
    border-radius: ${radius.lg};
    transform: translate(-50%, -50%);
    pointer-events: none;
`;

const CountdownOverlay = styled.div`
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 64px;
    font-weight: 800;
    color: white;
    background: rgba(0, 0, 0, 0.4);
`;

const RecordingBadge = styled.div`
    position: absolute;
    top: 16px;
    left: 16px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    font-size: 12px;
    font-weight: 600;
    border-radius: 999px;
`;

const RecordingDot = styled.span`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${colors.semantic.error};
`;

const CTASection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${spacing[2]}px;
`;

const ButtonRow = styled.div`
    display: flex;
    gap: ${spacing[2]}px;
`;

const BaseButton = styled.button`
    flex: 1;
    padding: 14px 16px;
    border-radius: ${radius.md};
    border: none;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const PrimaryButton = styled(BaseButton)`
    background: ${colors.primary[500]};
    color: white;

    &:active {
        background: ${colors.primary[600]};
    }
`;

const SecondaryButton = styled(BaseButton)`
    background: ${colors.gray[100]};
    color: ${colors.gray[900]};
`;

const DangerButton = styled(BaseButton)`
    background: ${colors.semantic.error};
    color: white;
`;

const ErrorContainer = styled.div`
    padding: ${spacing[6]}px ${spacing[4]}px;
    display: flex;
    flex-direction: column;
    gap: ${spacing[3]}px;
    align-items: center;
    text-align: center;
`;

const ErrorMessage = styled.p`
    margin: 0;
    color: ${colors.gray[800]};
    font-size: 15px;
`;

const ErrorButton = styled.button`
    padding: 12px 16px;
    border-radius: ${radius.md};
    border: none;
    background: ${colors.primary[500]};
    color: white;
    font-weight: 600;
    cursor: pointer;
`;

const ErrorOutlineButton = styled.button`
    padding: 12px 16px;
    border-radius: ${radius.md};
    border: 1px solid ${colors.gray[300]};
    background: transparent;
    color: ${colors.gray[700]};
    font-weight: 600;
    cursor: pointer;
`;
