import styled from "@emotion/styled";
import { ReactNode, useEffect, useRef } from "react";
import { spacing } from "@/shared/styles/tokens";
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
  ErrorHint,
  CTASection,
} from "@/shared/components/camera/CameraComponents";

interface ExpressionCameraProps {
  onAnalyze: (videoBlob: Blob) => Promise<void>;
  onIdleChange: (isIdle: boolean) => void;
  onAnalyzingChange?: (isAnalyzing: boolean) => void;
  guideContent?: ReactNode;
}

export const ExpressionCamera = ({
  onAnalyze,
  onIdleChange,
  onAnalyzingChange,
  guideContent,
}: ExpressionCameraProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

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
    onRecordingComplete: onAnalyze,
    autoStart: true,
  });

  // 상태 변경 알림
  useEffect(() => {
    onIdleChange(state === 'IDLE');
  }, [state, onIdleChange]);

  useEffect(() => {
    onAnalyzingChange?.(state === 'PROCESSING');
  }, [state, onAnalyzingChange]);

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
        <ErrorHint>카메라 접근 권한을 확인해주세요.</ErrorHint>
      </ErrorContainer>
    );
  }

  return (
    <Container>
      <VideoWrapper>
        <VideoElement ref={videoRef} playsInline muted />

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

      {guideContent}

      <CTASection>
        {state === "IDLE" && (
          <PrimaryButton onClick={startCountdown}>촬영하기</PrimaryButton>
        )}
        {state === "RECORDING" && <InfoBox>촬영 중입니다...</InfoBox>}
        {state === "PROCESSING" && <InfoBox>분석 중...</InfoBox>}
      </CTASection>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[4]}px;
`;
