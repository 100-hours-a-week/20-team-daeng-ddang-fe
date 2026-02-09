import styled from "@emotion/styled";
import { ReactNode } from "react";
import { colors, radius, spacing } from "@/shared/styles/tokens";
import { useHealthcareCamera } from "../model/useHealthcareCamera";

interface HealthcareCameraProps {
    onComplete: (videoBlob: Blob) => Promise<void>;
    onIdleChange: (isIdle: boolean) => void;
    guideContent?: ReactNode;
}

export const HealthcareCamera = ({
    onComplete,
    onIdleChange,
    guideContent,
}: HealthcareCameraProps) => {
    const {
        videoRef,
        flowState,
        recordingTimeLeft,
        error,
        startRecording
    } = useHealthcareCamera({ onComplete, onIdleChange });

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

                {flowState === "RECORDING" && (
                    <RecordingBadge>
                        <RecordingDot />
                        REC {recordingTimeLeft}s
                    </RecordingBadge>
                )}
            </VideoWrapper>

            {guideContent}

            <CTASection>
                {flowState === "IDLE" && (
                    <PrimaryButton onClick={startRecording}>촬영하기</PrimaryButton>
                )}
                {flowState === "RECORDING" && <InfoBox>촬영 중입니다...</InfoBox>}
                {flowState === "UPLOADING" && <InfoBox>업로드 중...</InfoBox>}
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
