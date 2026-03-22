"use client";

import styled from "@emotion/styled";
import { colors, radius, spacing } from "@/shared/styles/tokens";
import { DeferredRender } from "@/shared/components/DeferredRender";

type DetailType = "walk" | "healthcare";

interface FootprintDetailPageLoadingProps {
    type: DetailType;
}

export const FootprintDetailPageLoading = ({ type }: FootprintDetailPageLoadingProps) => {
    const metricCount = type === "healthcare" ? 5 : 3;

    return (
        <DeferredRender delayMs={120}>
            <ScreenContainer>
                <HeaderSkeleton>
                    <HeaderButton />
                    <HeaderTitle $width={type === "walk" ? 96 : 120} />
                    <HeaderButton />
                </HeaderSkeleton>

                <Content>
                    <DateLine />
                    <MediaBlock />

                    <InfoGrid>
                        {Array.from({ length: 4 }).map((_, idx) => (
                            <InfoCell key={idx}>
                                <InfoLabel />
                                <InfoValue />
                            </InfoCell>
                        ))}
                    </InfoGrid>

                    <SectionCard>
                        <SectionTitle />
                        <BodyLine $width="100%" />
                        <BodyLine $width="78%" />
                    </SectionCard>

                    <SectionCard>
                        <SectionTitle />
                        {Array.from({ length: metricCount }).map((_, idx) => (
                            <MetricRow key={idx}>
                                <MetricHeader>
                                    <MetricName />
                                    <MetricBadge />
                                </MetricHeader>
                                <MetricScore />
                                <MetricBar />
                            </MetricRow>
                        ))}
                    </SectionCard>
                </Content>
            </ScreenContainer>
        </DeferredRender>
    );
};

const shimmer = `
  background: linear-gradient(
    90deg,
    ${colors.gray[200]} 25%,
    ${colors.gray[100]} 37%,
    ${colors.gray[200]} 63%
  );
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;

  @keyframes shimmer {
    0% {
      background-position: 100% 0;
    }
    100% {
      background-position: 0 0;
    }
  }
`;

const ScreenContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100svh;
    background-color: white;
    width: 100%;
    max-width: 430px;
    margin: 0 auto;
`;

const HeaderSkeleton = styled.div`
    height: 56px;
    padding: 0 ${spacing[4]}px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid ${colors.gray[100]};
`;

const HeaderButton = styled.div`
    width: 28px;
    height: 28px;
    border-radius: ${radius.sm};
    ${shimmer}
`;

const HeaderTitle = styled.div<{ $width: number }>`
    width: ${({ $width }) => `${$width}px`};
    height: 20px;
    border-radius: ${radius.sm};
    ${shimmer}
`;

const Content = styled.div`
    flex: 1;
    padding: ${spacing[4]}px;
    display: flex;
    flex-direction: column;
    gap: ${spacing[4]}px;
    overflow: hidden;
`;

const DateLine = styled.div`
    width: 110px;
    height: 18px;
    border-radius: ${radius.sm};
    ${shimmer}
`;

const MediaBlock = styled.div`
    width: 100%;
    aspect-ratio: 1 / 1;
    border-radius: ${radius.md};
    ${shimmer}
`;

const InfoGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${spacing[3]}px;
    padding: ${spacing[3]}px;
    border-radius: ${radius.md};
    background-color: ${colors.gray[50]};
`;

const InfoCell = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const InfoLabel = styled.div`
    width: 64px;
    height: 12px;
    border-radius: ${radius.sm};
    ${shimmer}
`;

const InfoValue = styled.div`
    width: 96px;
    height: 16px;
    border-radius: ${radius.sm};
    ${shimmer}
`;

const SectionCard = styled.div`
    border: 1px solid ${colors.gray[200]};
    border-radius: ${radius.md};
    padding: ${spacing[4]}px;
    display: flex;
    flex-direction: column;
    gap: ${spacing[2]}px;
`;

const SectionTitle = styled.div`
    width: 120px;
    height: 18px;
    border-radius: ${radius.sm};
    margin-bottom: 4px;
    ${shimmer}
`;

const BodyLine = styled.div<{ $width: string }>`
    width: ${({ $width }) => $width};
    height: 14px;
    border-radius: ${radius.full};
    ${shimmer}
`;

const MetricRow = styled.div`
    padding-top: ${spacing[2]}px;
`;

const MetricHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
`;

const MetricName = styled.div`
    width: 110px;
    height: 16px;
    border-radius: ${radius.sm};
    ${shimmer}
`;

const MetricBadge = styled.div`
    width: 54px;
    height: 24px;
    border-radius: ${radius.full};
    ${shimmer}
`;

const MetricScore = styled.div`
    width: 56px;
    height: 20px;
    border-radius: ${radius.sm};
    margin-bottom: 10px;
    ${shimmer}
`;

const MetricBar = styled.div`
    width: 100%;
    height: 8px;
    border-radius: ${radius.full};
    ${shimmer}
`;
