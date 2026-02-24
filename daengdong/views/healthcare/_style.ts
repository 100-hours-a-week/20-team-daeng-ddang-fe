import styled from "@emotion/styled";
import { spacing, colors, radius } from "@/shared/styles/tokens";

export const PageContainer = styled.div<{ isFullScreen?: boolean }>`
  min-height: 100svh;
  background: white;
  display: flex;
  flex-direction: column;
  ${props => props.isFullScreen && `
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 430px;
    height: 100svh;
    z-index: 3000;
  `}
`;

export const ContentWrapper = styled.div<{ isFullScreen?: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[4]}px;
  padding: ${props => props.isFullScreen
    ? `${spacing[4]}px`
    : `${spacing[4]}px ${spacing[4]}px 100px`
  };
`;

export const GuideBox = styled.div`
  padding: ${spacing[3]}px;
  background: ${colors.gray[50]};
  border-radius: ${radius.md};
  display: flex;
  flex-direction: column;
  gap: ${spacing[1]}px;
`;

export const GuideText = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${colors.gray[700]};
  line-height: 1.5;
`;

export const VideoPreviewCard = styled.div`
  width: 100%;
  max-width: 320px;
  aspect-ratio: 1 / 1;
  border-radius: ${radius.lg};
  overflow: hidden;
  background: ${colors.gray[100]};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

export const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const PreviewVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: black;
`;

export const RiskLevelBadge = styled.div<{ level: string }>`
  width: 100%;
  max-width: 320px;
  padding: ${spacing[3]}px ${spacing[4]}px;
  background: ${props => {
    const l = props.level?.toLowerCase();
    if (l === 'low') return '#E8F5E9';
    if (l === 'medium') return '#FFF9E6';
    return '#FFEBEE';
  }
  };
  border: 2px solid ${props => {
    const l = props.level?.toLowerCase();
    if (l === 'low') return colors.green[500];
    if (l === 'medium') return colors.semantic.warning;
    return colors.semantic.error;
  }
  };
  border-radius: ${radius.md};
  font-size: 15px;
  font-weight: 700;
  text-align: center;
  color: ${props => {
    const l = props.level?.toLowerCase();
    if (l === 'low') return colors.green[600];
    if (l === 'medium') return '#F57C00';
    return colors.semantic.error;
  }
  };
`;

export const ResultBubble = styled.div`
  width: 100%;
  max-width: 320px;
  background: white;
  border: 1px solid ${colors.gray[200]};
  border-radius: 20px;
  padding: ${spacing[4]}px;
`;

export const BubbleTitle = styled.p`
  margin: 0 0 ${spacing[2]}px;
  font-weight: 700;
  font-size: 16px;
  color: ${colors.gray[900]};
`;

export const BubbleText = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${colors.gray[700]};
  line-height: 1.5;
`;

export const DetailSection = styled.div`
  width: 100%;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  gap: ${spacing[3]}px;
`;

export const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: ${colors.gray[900]};
  margin: 0;
`;

export const DetailCard = styled.div`
  padding: ${spacing[4]}px;
  background: white;
  border: 1px solid ${colors.gray[200]};
  border-radius: ${radius.md};
`;

export const DetailCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${spacing[2]}px;
`;

export const DetailCategory = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: ${colors.gray[900]};
`;

export const RiskBadge = styled.span<{ level: string }>`
  padding: 4px 12px;
  border-radius: ${radius.full};
  font-size: 13px;
  font-weight: 600;
  background: ${props => {
    const l = props.level?.toLowerCase();
    if (l === 'safe' || l === 'low') return colors.green[500];
    if (l === 'warning' || l === 'medium') return colors.semantic.warning;
    return colors.semantic.error;
  }
  };
  color: white;
`;

export const DetailScore = styled.div<{ score: number; level?: string }>`
  font-size: 18px;
  font-weight: 700;
  color: ${props => {
    if (props.score >= 80) return colors.green[500];
    if (props.score >= 60) return colors.semantic.warning;
    return colors.semantic.error;
  }
  };
  margin-bottom: ${spacing[2]}px;
`;

export const DetailDescription = styled.p`
  margin: 0 0 ${spacing[2]}px 0;
  font-size: 13px;
  color: ${colors.gray[700]};
  line-height: 1.5;
`;

export const ProgressBarContainer = styled.div`
  width: 100%;
  height: 8px;
  background: ${colors.gray[100]};
  border-radius: 4px;
  overflow: hidden;
`;

export const ProgressBar = styled.div<{ width: number; level?: string }>`
  height: 100%;
  width: ${props => props.width}%;
  background: ${props => {
    if (props.width >= 80) return colors.green[500];
    if (props.width >= 60) return colors.semantic.warning;
    return colors.semantic.error;
  }
  };
  border-radius: 4px;
  transition: width 0.6s ease-out;
`;

export const GuideTooltip = styled.div`
  width: 100%;
  max-width: 320px;
  margin-top: ${spacing[3]}px;
  padding: ${spacing[3]}px;
  background: ${colors.gray[50]};
  border-radius: ${radius.md};
  font-size: 13px;
  color: ${colors.gray[700]};
  text-align: center;
  line-height: 1.5;
`;

export const RetryButton = styled.button`
  width: 100%;
  max-width: 320px;
  padding: 16px;
  background: ${colors.primary[500]};
  color: white;
  font-size: 16px;
  font-weight: 700;
  border: none;
  border-radius: ${radius.md};
  cursor: pointer;
  transition: all 0.2s;

  &:active {
    background: ${colors.primary[600]};
  }
`;

export default function Style() { return null; }
