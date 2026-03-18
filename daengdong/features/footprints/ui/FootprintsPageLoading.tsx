"use client";

import styled from "@emotion/styled";
import { colors, radius, spacing } from "@/shared/styles/tokens";

export const FootprintsPageLoading = () => {
    return (
        <ScreenContainer>
            <HeaderSkeleton />

            <CalendarCard>
                <CalendarTitleSkeleton />
                <CalendarDays>
                    {Array.from({ length: 7 }).map((_, idx) => (
                        <CalendarDaySkeleton key={idx} />
                    ))}
                </CalendarDays>
            </CalendarCard>

            <ListSection>
                <ListTitleSkeleton />
                <SkeletonList>
                    {Array.from({ length: 5 }).map((_, idx) => (
                        <SkeletonItem key={idx}>
                            <SkeletonIcon />
                            <SkeletonInfo>
                                <SkeletonLine $width="45%" />
                                <SkeletonLine $width="70%" />
                            </SkeletonInfo>
                            <SkeletonThumb />
                        </SkeletonItem>
                    ))}
                </SkeletonList>
            </ListSection>
        </ScreenContainer>
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
    min-height: 100dvh;
    background: ${colors.gray[50]};
    padding-bottom: 70px;
`;

const HeaderSkeleton = styled.div`
    height: 56px;
    background: white;
    border-bottom: 1px solid ${colors.gray[100]};
`;

const CalendarCard = styled.div`
    padding: ${spacing[4]}px;
    background: white;
    margin: 8px ${spacing[4]}px 0;
    border-radius: ${radius.md};
`;

const CalendarTitleSkeleton = styled.div`
    width: 120px;
    height: 18px;
    border-radius: ${radius.sm};
    margin-bottom: ${spacing[3]}px;
    ${shimmer}
`;

const CalendarDays = styled.div`
    display: flex;
    gap: 8px;
`;

const CalendarDaySkeleton = styled.div`
    width: 36px;
    height: 36px;
    border-radius: ${radius.full};
    ${shimmer}
`;

const ListSection = styled.div`
    padding: ${spacing[4]}px;
`;

const ListTitleSkeleton = styled.div`
    width: 110px;
    height: 18px;
    border-radius: ${radius.sm};
    margin-bottom: ${spacing[3]}px;
    ${shimmer}
`;

const SkeletonList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${spacing[3]}px;
`;

const SkeletonItem = styled.div`
    display: flex;
    align-items: center;
    background-color: white;
    padding: ${spacing[3]}px;
    border-radius: ${radius.md};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
`;

const SkeletonIcon = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin-right: ${spacing[3]}px;
    ${shimmer}
`;

const SkeletonInfo = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const SkeletonLine = styled.div<{ $width: string }>`
    height: 12px;
    width: ${({ $width }) => $width};
    border-radius: ${radius.full};
    ${shimmer}
`;

const SkeletonThumb = styled.div`
    width: 48px;
    height: 48px;
    border-radius: ${radius.sm};
    margin-left: ${spacing[3]}px;
    ${shimmer}
`;
