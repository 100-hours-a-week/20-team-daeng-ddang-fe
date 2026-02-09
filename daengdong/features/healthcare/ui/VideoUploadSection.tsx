import styled from "@emotion/styled";
import { useRef } from "react";
import { colors, radius, spacing } from "@/shared/styles/tokens";
import { useToastStore } from "@/shared/stores/useToastStore";

interface VideoUploadSectionProps {
  onComplete: (videoBlob: Blob) => Promise<void>;
  onCancel: () => void;
}

export const VideoUploadSection = ({ onComplete, onCancel }: VideoUploadSectionProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToastStore();

  const validateVideoDuration = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        const duration = video.duration;

        if (duration > 10) {
          showToast({
            message: "10초 이내의 영상만 업로드 가능합니다.",
            type: "error"
          });
          resolve(false);
        } else {
          resolve(true);
        }
      };

      video.onerror = () => {
        showToast({
          message: "영상 파일을 읽을 수 없습니다.",
          type: "error"
        });
        resolve(false);
      };

      video.src = URL.createObjectURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 타입 검증
    if (!file.type.startsWith('video/')) {
      showToast({
        message: "영상 파일만 업로드 가능합니다.",
        type: "error"
      });
      return;
    }

    // 영상 길이 검증
    const isValid = await validateVideoDuration(file);
    if (!isValid) return;

    // Blob으로 변환하여 전달
    onComplete(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Container>
      <Title>영상 업로드</Title>
      <Description>
        10초 이내의 반려견이 걷는 측면 모습을 업로드해주세요
      </Description>

      <HiddenInput
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileChange}
      />

      <ButtonGroup>
        <UploadButton onClick={handleUploadClick}>
          파일 선택
        </UploadButton>
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
