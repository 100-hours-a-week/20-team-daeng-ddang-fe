import styled from "@emotion/styled";
import { ReactNode, useState } from "react";
import { colors, radius, spacing } from "@/shared/styles/tokens";
import { useHealthcareCamera } from "../model/useHealthcareCamera";

interface HealthcareCameraProps {
  onComplete: (videoBlob: Blob, backVideoBlob?: Blob) => Promise<void>;
  onIdleChange: (isIdle: boolean) => void;
  guideContent?: ReactNode;
  requireBackVideo?: boolean;
}
export const HealthcareCamera = ({
  onComplete,
  onIdleChange,
  requireBackVideo = false,
}: HealthcareCameraProps) => {
  const [step, setStep] = useState<'SIDE' | 'BACK'>('SIDE');
  const [sideBlob, setSideBlob] = useState<Blob | null>(null);

  const handleStepComplete = async (blob: Blob) => {
    if (step === 'SIDE') {
      if (requireBackVideo) {
        setSideBlob(blob);
        setStep('BACK');
        reset();
      } else {
        await onComplete(blob);
      }
    } else {
      if (sideBlob) {
        await onComplete(sideBlob, blob);
      }
    }
  };

  const {
    videoRef,
    flowState,
    recordingTimeLeft,
    error,
    startRecording,
    reset
  } = useHealthcareCamera({
    onComplete: handleStepComplete,
    onIdleChange
  });

  const handleSkip = async () => {
    if (sideBlob) {
      await onComplete(sideBlob);
    }
  };

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
      <Title>
        {requireBackVideo
          ? (step === 'SIDE' ? '측면 촬영 (1/2)' : '후면 촬영 (2/2)')
          : '측면 촬영'}
      </Title>

      <VideoWrapper>
        <VideoElement ref={videoRef} playsInline muted />

        {flowState === "RECORDING" && (
          <RecordingBadge>
            <RecordingDot />
            REC {recordingTimeLeft}s
          </RecordingBadge>
        )}
      </VideoWrapper>

      <GuideBox>
        {step === 'SIDE' ? (
          <>
            <GuideText>• 반려견이 걷는 <b>측면 모습</b>을 촬영해주세요. 🐕</GuideText>
            <GuideText>• 다리와 관절의 움직임을 분석합니다.</GuideText>
          </>
        ) : (
          <>
            <GuideText>• 반려견이 걷는 <b>후면 모습</b>을 촬영해주세요.</GuideText>
            <GuideText>• 슬개골 탈구 위험을 더 정확하게 분석할 수 있습니다.</GuideText>
          </>
        )}
        {flowState === "IDLE" && <GuideText>• 버튼을 누르면 촬영이 시작됩니다. (10초)</GuideText>}
      </GuideBox>

      <CTASection>
        {flowState === "IDLE" && (
          <>
            <PrimaryButton onClick={startRecording}>
              {requireBackVideo
                ? (step === 'SIDE' ? '측면 촬영 시작' : '후면 촬영 시작')
                : '촬영 시작'}
            </PrimaryButton>

            {requireBackVideo && step === 'BACK' && (
              <SecondaryButton onClick={handleSkip}>
                건너뛰기 (측면 영상만 분석)
              </SecondaryButton>
            )}
          </>
        )}
        {flowState === "RECORDING" && <InfoBox>촬영 중입니다...</InfoBox>}
        {flowState === "UPLOADING" && <InfoBox>영상 처리 중...</InfoBox>}
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
  max-width: 400px;
  aspect-ratio: 1 / 1;
  min-height: 300px;
  border-radius: ${radius.lg};
  overflow: hidden;
  background-color: ${colors.gray[900]};
`;

const VideoElement = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
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

const SecondaryButton = styled(BaseButton)`
  background: ${colors.gray[100]};
  color: ${colors.gray[700]};
  &:active {
    background: ${colors.gray[200]};
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

const Title = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: ${colors.gray[900]};
  text-align: center;
  margin: 0;
`;

const GuideBox = styled.div`
  padding: ${spacing[3]}px;
  background: ${colors.gray[50]};
  border-radius: ${radius.md};
  display: flex;
  flex-direction: column;
  gap: ${spacing[1]}px;
`;

const GuideText = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${colors.gray[700]};
  line-height: 1.5;
`;

