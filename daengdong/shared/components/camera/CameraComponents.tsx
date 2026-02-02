import styled from '@emotion/styled';
import { colors, radius, spacing } from '@/shared/styles/tokens';

// 비디오 컨테이너
export const VideoWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 360px;
  border-radius: ${radius.lg};
  overflow: hidden;
  background-color: ${colors.gray[900]};
`;

export const VideoElement = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

// 오버레이
export const Overlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  gap: 8px;
`;

export const CountdownText = styled.span`
  font-size: 80px;
  font-weight: 800;
  color: #fff;
`;

export const SubText = styled.span`
  font-size: 16px;
  color: #fff;
  font-weight: 500;
`;

// 녹화 배지
export const RecordingBadge = styled.div`
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

export const RecordingDot = styled.span`
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

// 버튼
export const BaseButton = styled.button`
  width: 100%;
  padding: 16px;
  border-radius: ${radius.md};
  border: none;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
`;

export const PrimaryButton = styled(BaseButton)`
  background: ${colors.primary[500]};
  color: white;
  &:active {
    background: ${colors.primary[600]};
  }
`;

// 정보 박스
export const InfoBox = styled.div`
  width: 100%;
  padding: 16px;
  text-align: center;
  background: ${colors.gray[100]};
  color: ${colors.gray[700]};
  border-radius: ${radius.md};
  font-weight: 600;
`;

// 에러 컨테이너
export const ErrorContainer = styled.div`
  padding: 32px 12px;
  text-align: center;
`;

export const ErrorMessage = styled.p`
  color: ${colors.gray[900]};
  margin-bottom: 8px;
  font-weight: 600;
`;

export const ErrorHint = styled.p`
  color: ${colors.gray[500]};
  font-size: 14px;
`;

// CTA 섹션
export const CTASection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[2]}px;
`;
