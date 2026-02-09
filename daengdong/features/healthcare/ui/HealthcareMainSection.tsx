import styled from "@emotion/styled";
import { colors, radius, spacing } from "@/shared/styles/tokens";
import Image from "next/image";
import HelpIcon from "@/shared/assets/icons/help.svg";

interface HealthcareMainSectionProps {
  onUpload: () => void;
  onRecord: () => void;
  onHelp?: () => void;
}

export const HealthcareMainSection = ({ onUpload, onRecord, onHelp }: HealthcareMainSectionProps) => {
  return (
    <Container>
      <TitleSection>
        <Title>AI 보행 분석</Title>
        {onHelp && (
          <HelpButton onClick={onHelp}>
            <Image src={HelpIcon} alt="도움말" width={20} height={20} />
          </HelpButton>
        )}
      </TitleSection>

      <DescriptionBox>
        <DescriptionText>
          반려견의 측면 걷기 영상을 AI로 분석하여 슬개골 상태, 좌우 보행 균형, 무릎 관절 가동성, 보행 안정성, 보행 리듬 등을 확인할 수 있어요.
        </DescriptionText>
      </DescriptionBox>

      <ButtonGroup>
        <UploadButton onClick={onUpload}>
          <ButtonIcon>📁</ButtonIcon>
          <ButtonContent>
            <ButtonText>앨범에서 업로드하기</ButtonText>
            <ButtonHint>10초 이내의 반려견이 걷는 모습</ButtonHint>
          </ButtonContent>
        </UploadButton>

        <RecordButton onClick={onRecord}>
          <ButtonIcon>📹</ButtonIcon>
          <ButtonContent>
            <ButtonText variant="outline">직접 촬영하기</ButtonText>
            <ButtonHint variant="outline">10초 자동 녹화</ButtonHint>
          </ButtonContent>
        </RecordButton>
      </ButtonGroup>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[5]}px;
  width: 100%;
  max-width: 400px;
`;

const TitleSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: ${colors.gray[900]};
  margin: 0;
`;

const HelpButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${colors.gray[100]};
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:active {
    background: ${colors.gray[200]};
  }
`;

const DescriptionBox = styled.div`
  padding: ${spacing[4]}px;
  background: ${colors.gray[50]};
  border-radius: ${radius.md};
  border-left: 4px solid ${colors.primary[500]};
`;

const DescriptionText = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${colors.gray[700]};
  line-height: 1.6;
  word-break: keep-all;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[3]}px;
`;

const UploadButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${spacing[3]}px;
  padding: ${spacing[4]}px;
  background: linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[600]} 100%);
  border: none;
  border-radius: ${radius.md};
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(255, 183, 77, 0.3);

  &:active {
    transform: translateY(1px);
    box-shadow: 0 1px 4px rgba(255, 183, 77, 0.3);
  }
`;

const RecordButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${spacing[3]}px;
  padding: ${spacing[4]}px;
  background: white;
  border: 2px solid ${colors.primary[500]};
  border-radius: ${radius.md};
  cursor: pointer;
  transition: all 0.2s;

  &:active {
    background: ${colors.gray[50]};
  }
`;

const ButtonIcon = styled.div`
  font-size: 32px;
  flex-shrink: 0;
`;

const ButtonContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  flex: 1;
`;

const ButtonText = styled.div<{ variant?: 'primary' | 'outline' }>`
  font-size: 16px;
  font-weight: 700;
  color: ${props => props.variant === 'outline' ? colors.primary[500] : 'white'};
`;

const ButtonHint = styled.div<{ variant?: 'primary' | 'outline' }>`
  font-size: 12px;
  color: ${props => props.variant === 'outline' ? colors.gray[700] : 'rgba(255, 255, 255, 0.9)'};
`;
