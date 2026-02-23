import styled from "@emotion/styled";
import { colors, radius, spacing } from "@/shared/styles/tokens";
import { useVideoUpload } from "../model/useVideoUpload";

interface VideoUploadSectionProps {
  onComplete: (videoBlob: Blob, backVideoBlob?: Blob) => Promise<void>;
  onCancel: () => void;
}

import Image from "next/image";
import dogSideGuide from "@/shared/assets/images/dog-side-guide.png";

export const VideoUploadSection = ({ onComplete, onCancel }: VideoUploadSectionProps) => {
  const {
    fileInputRef,
    step,
    handleFileChange,
    handleSkip,
    handleUploadClick
  } = useVideoUpload({ onComplete });

  return (
    <Container>
      <Title>
        {step === 'SIDE' ? '측면 영상 업로드 (1/2)' : '후면 영상 업로드 (2/2)'}
      </Title>

      {step === 'SIDE' && (
        <ImageWrapper>
          <Image
            src={dogSideGuide}
            alt="측면에서 걷는 강아지 가이드"
            width={200}
            height={160}
            style={{ objectFit: "contain" }}
            priority
          />
        </ImageWrapper>
      )}

      <Description>
        {step === 'SIDE' ? (
          <>
            반려견이 걷는 <b>측면 모습</b>을 업로드해주세요.<br />
            다리와 관절의 움직임을 분석합니다.
          </>
        ) : (
          <>
            반려견이 걷는 <b>후면 모습</b>을 업로드해주세요.<br />
            슬개골 움직임을 더 자세히 분석할 수 있습니다.
          </>
        )}
      </Description>

      <StepIndicator>
        <StepDot active={step === 'SIDE'} completed={step === 'BACK'} />
        <Line />
        <StepDot active={step === 'BACK'} />
      </StepIndicator>

      <HiddenInput
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileChange}
      />

      <ButtonGroup>
        <UploadButton onClick={handleUploadClick}>
          영상 선택하기
        </UploadButton>

        {step === 'BACK' && (
          <SkipButton onClick={handleSkip}>
            건너뛰기 (측면 영상만 분석)
          </SkipButton>
        )}

        <CancelButton onClick={onCancel}>
          취소
        </CancelButton>
      </ButtonGroup>
    </Container>
  );
};


const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[4]}px;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: ${colors.gray[900]};
  margin: 0;
`;

const Description = styled.p`
  font-size: 14px;
  color: ${colors.gray[700]};
  text-align: center;
  margin: 0;
  line-height: 1.5;
`;

const HiddenInput = styled.input`
  display: none;
`;

const ButtonGroup = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${spacing[2]}px;
  margin-top: ${spacing[4]}px;
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

const UploadButton = styled(BaseButton)`
  background: ${colors.primary[500]};
  color: white;
  
  &:active {
    background: ${colors.primary[600]};
  }
`;

const CancelButton = styled(BaseButton)`
  background: ${colors.gray[200]};
  color: ${colors.gray[700]};
  
  &:active {
    background: ${colors.gray[300]};
  }
`;

const StepIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing[2]}px;
  margin: ${spacing[2]}px 0;
`;

const StepDot = styled.div<{ active?: boolean; completed?: boolean }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${({ active, completed }) =>
    active || completed ? colors.primary[500] : colors.gray[300]};
  transition: all 0.3s ease;
`;

const Line = styled.div`
  width: 40px;
  height: 2px;
  background-color: ${colors.gray[300]};
`;

const SkipButton = styled(BaseButton)`
  background: ${colors.gray[100]};
  color: ${colors.gray[600]};
  
  &:active {
    background: ${colors.gray[200]};
  }
`;

const ImageWrapper = styled.div`
  width: 100%;
  padding: ${spacing[2]}px 0;
  background-color: ${colors.gray[50]};
  border-radius: ${radius.md};
  display: flex;
  justify-content: center;
  margin-bottom: ${spacing[2]}px;
`;

