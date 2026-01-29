import styled from "@emotion/styled";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { colors, radius, spacing } from "@/shared/styles/tokens";
import { useToastStore } from "@/shared/stores/useToastStore";

interface ExpressionCameraProps {
  onAnalyze: (videoBlob: Blob) => Promise<void>;
  onIdleChange: (isIdle: boolean) => void;
  onAnalyzingChange?: (isAnalyzing: boolean) => void;
  guideContent?: ReactNode;
}

type ExpressionFlowState = "IDLE" | "COUNTDOWN" | "RECORDING" | "ANALYZING";

export const ExpressionCamera = ({
  onAnalyze,
  onIdleChange,
  onAnalyzingChange,
  guideContent,
}: ExpressionCameraProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const countdownTimerRef = useRef<number | null>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [flowState, setFlowState] = useState<ExpressionFlowState>("IDLE");
  const [countdown, setCountdown] = useState(3);
  const [error, setError] = useState<string | null>(null);

  const { showToast } = useToastStore();

  useEffect(() => {
    onIdleChange(flowState === "IDLE");
  }, [flowState, onIdleChange]);

  useEffect(() => {
    onAnalyzingChange?.(flowState === "ANALYZING");
  }, [flowState, onAnalyzingChange]);

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
      const mimeType = MediaRecorder.isTypeSupported("video/mp4")
        ? "video/mp4"
        : "video/webm";
      const recorder = new MediaRecorder(stream, { mimeType });
      recorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setPreviewURL(url);
        setFlowState("ANALYZING");
        onAnalyze(blob).catch((e) => {
          console.error(e);
          showToast({ message: "분석에 실패했습니다. 잠시 후 다시 시도해주세요.", type: "error" });
          setFlowState("IDLE");
        });
      };

      recorder.start();
      recordingTimerRef.current = setTimeout(() => {
        stopRecording();
      }, 5000);
    } catch (e) {
      console.error(e);
      showToast({ message: "녹화를 시작할 수 없습니다.", type: "error" });
      setFlowState("IDLE");
    }
  }, [stream, showToast, stopRecording, onAnalyze]);

  const handleStartClick = useCallback(() => {
    if (!stream) return;
    if (countdownTimerRef.current) window.clearInterval(countdownTimerRef.current);
    setCountdown(3);
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
    countdownTimerRef.current = countdownInterval;
  }, [stream, startRecording]);


  useEffect(() => {
    setTimeout(() => {
      initializeCamera().catch(console.error);
    }, 0);

    return () => {
      if (countdownTimerRef.current) window.clearInterval(countdownTimerRef.current);
      if (recordingTimerRef.current) clearTimeout(recordingTimerRef.current);
    };
  }, [initializeCamera]);

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
        <ErrorHint>카메라 접근 권한을 확인해주세요.</ErrorHint>
      </ErrorContainer>
    );
  }

  return (
    <Container>
      <VideoWrapper>
        <VideoElement ref={videoRef} playsInline muted />

        {flowState === "COUNTDOWN" && (
          <Overlay>
            <CountdownText>{countdown}</CountdownText>
            <SubText>잠시 후 촬영이 시작됩니다</SubText>
          </Overlay>
        )}

        {flowState === "RECORDING" && (
          <RecordingBadge>
            <RecordingDot />
            REC (5s)
          </RecordingBadge>
        )}
      </VideoWrapper>

      {guideContent}

      <CTASection>
        {flowState === "IDLE" && (
          <PrimaryButton onClick={handleStartClick}>촬영하기</PrimaryButton>
        )}
        {flowState === "RECORDING" && <InfoBox>촬영 중입니다...</InfoBox>}
        {flowState === "ANALYZING" && <InfoBox>분석 중...</InfoBox>}
      </CTASection>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[4]}px;
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
    50% {
      opacity: 0.5;
    }
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
  &:active {
    background: ${colors.primary[600]};
  }
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
  padding: 32px 12px;
  text-align: center;
`;

const ErrorMessage = styled.p`
  color: ${colors.gray[900]};
  margin-bottom: 8px;
  font-weight: 600;
`;

const ErrorHint = styled.p`
  color: ${colors.gray[500]};
  font-size: 14px;
`;
