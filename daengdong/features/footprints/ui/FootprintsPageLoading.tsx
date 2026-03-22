"use client";

import styled from "@emotion/styled";
import { colors, radius, spacing } from "@/shared/styles/tokens";
import { DeferredRender } from "@/shared/components/DeferredRender";
import { Header } from "@/widgets/Header";

export const FootprintsPageLoading = () => {
    return (
        <DeferredRender delayMs={150}>
            <ScreenContainer>
                <Content>
                    <Header title="발자국" showBackButton={false} isSticky={false} />

                    <CalendarSectionSkeleton>
                        <CalendarHeader>
                            <MonthNav />
                            <CalendarTitleSkeleton />
                            <MonthNav />
                        </CalendarHeader>
                        <WeekDaysRow>
                            {Array.from({ length: 7 }).map((_, idx) => (
                                <WeekDay key={idx} />
                            ))}
                        </WeekDaysRow>
                        <CalendarGrid>
                            {Array.from({ length: 5 }).map((_, rowIdx) => (
                                <CalendarRow key={rowIdx}>
                                    {Array.from({ length: 7 }).map((_, colIdx) => (
                                        <DayDot key={`${rowIdx}-${colIdx}`} />
                                    ))}
                                </CalendarRow>
                            ))}
                        </CalendarGrid>
                    </CalendarSectionSkeleton>

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
    height: 100dvh;
    background-color: ${colors.gray[50]};
    overflow: hidden;
    padding-bottom: 70px;
    width: 100%;
    max-width: 430px;
    margin: 0 auto;
`;

const Content = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    padding-bottom: 90px;

    &::-webkit-scrollbar {
        display: none;
    }
    -ms-overflow-style: none;
    scrollbar-width: none;
`;

const CalendarSectionSkeleton = styled.div`
    padding: ${spacing[4]}px;
    background: white;
    border-bottom-left-radius: ${radius.lg};
    border-bottom-right-radius: ${radius.lg};
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
`;

const CalendarHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${spacing[4]}px;
    padding: 0 ${spacing[4]}px;
`;

const MonthNav = styled.div`
    width: 22px;
    height: 22px;
    border-radius: ${radius.sm};
    ${shimmer}
`;

const CalendarTitleSkeleton = styled.div`
    width: 120px;
    height: 18px;
    border-radius: ${radius.md};
    ${shimmer}
`;

const WeekDaysRow = styled.div`
    display: flex;
    margin-bottom: ${spacing[1]}px;
`;

const WeekDay = styled.div`
    flex: 1;
    height: 12px;
    margin: 0 12px;
    border-radius: ${radius.sm};
    ${shimmer}
`;

const CalendarGrid = styled.div`
    display: flex;
    flex-direction: column;
`;

const CalendarRow = styled.div`
    display: flex;
    height: 64px;
`;

const DayDot = styled.div`
    width: 32px;
    height: 32px;
    border-radius: ${radius.full};
    margin: auto;
    ${shimmer}
`;

const ListSection = styled.div`
    padding: ${spacing[4]}px;
    background-color: ${colors.gray[50]};
`;

const ListTitleSkeleton = styled.div`
    width: 120px;
    height: 20px;
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
