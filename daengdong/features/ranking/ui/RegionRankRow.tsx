import styled from "@emotion/styled";
import { RegionRankingItem, PeriodType } from "@/entities/ranking/model/types";
import { colors, spacing } from "@/shared/styles/tokens";
import { ContributionRankingView } from "./ContributionRankingView";
import { m, AnimatePresence } from "framer-motion";
import { formatDistance } from "@/shared/utils/formatDistance";

interface RegionRankRowProps {
    item: RegionRankingItem;
    isExpanded: boolean;
    onToggle: () => void;
    periodType: PeriodType;
    periodValue: string;
    isMyRegion?: boolean;
}

export const RegionRankRow = ({ item, isExpanded, onToggle, periodType, periodValue, isMyRegion }: RegionRankRowProps) => {
    const handleToggle = () => {
        onToggle();
        if (isExpanded) {
            // 닫힐 때 너무 위에 있으면 딱 맞게 화면에 띄우도록 보정
            setTimeout(() => {
                const element = document.getElementById(`region-rank-item-${item.regionId}`);
                // RegionalRankingView의 scroll container refs를 직접 찾음
                const scrollContainer = element?.closest('[id="regional-scroll-content"]');

                if (element && scrollContainer) {
                    const elementRect = element.getBoundingClientRect();
                    const containerRect = scrollContainer.getBoundingClientRect();

                    // 스크롤 상단에서 얼마나 벗어났는지 계산
                    const offset = elementRect.top - containerRect.top;

                    // 화면 위로 밀려 올라간 경우에만 스크롤 조정
                    if (offset < 0 || offset > containerRect.height) {
                        scrollContainer.scrollBy({ top: offset, behavior: 'smooth' });
                    }
                }
            }, 50);
        }
    };

    return (
        <Container id={`region-rank-item-${item.regionId}`}>
            <RowHeader onClick={handleToggle} isExpanded={isExpanded} isMyRegion={isMyRegion}>
                <RankNum isTop={item.rank <= 3}>{item.rank}</RankNum>
                <Info>
                    <RegionName isMyRegion={isMyRegion}>{item.regionName} {isMyRegion && <MyRegionBadge>🏠 우리 동네</MyRegionBadge>}</RegionName>
                    <RegionDistance>{formatDistance(item.totalDistance)}km</RegionDistance>
                </Info>
                <ArrowIcon isExpanded={isExpanded}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 4L6 8L10 4" />
                    </svg>
                </ArrowIcon>
            </RowHeader>

            <AnimatePresence>
                {isExpanded && (
                    <m.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: "hidden" }}
                    >
                        <DropdownContent>
                            <ContributionRankingView
                                regionId={item.regionId}
                                periodType={periodType}
                                periodValue={periodValue}
                                onClose={handleToggle}
                            />
                        </DropdownContent>
                    </m.div>
                )}
            </AnimatePresence>
        </Container>
    );
};

const Container = styled.div`
    border-bottom: 1px solid ${colors.gray[100]};
`;

const RowHeader = styled.div<{ isExpanded: boolean, isMyRegion?: boolean }>`
    display: flex;
    align-items: center;
    padding: ${spacing[4]}px 0;
    cursor: pointer;
    background-color: ${({ isExpanded, isMyRegion }) =>
        isExpanded ? colors.gray[50] :
            isMyRegion ? colors.primary[50] : 'transparent'};
    margin: 0 -${spacing[4]}px;
    padding-left: ${spacing[4]}px;
    padding-right: ${spacing[4]}px;
    border-left: ${({ isMyRegion }) => isMyRegion ? `4px solid ${colors.primary[500]}` : '4px solid transparent'};
`;

const RankNum = styled.div<{ isTop: boolean }>`
    width: 30px;
    font-size: 16px;
    font-weight: 800;
    color: ${({ isTop }) => isTop ? colors.primary[600] : colors.gray[500]};
    margin-right: ${spacing[3]}px;
`;

const Info = styled.div`
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-right: ${spacing[2]}px;
`;

const RegionName = styled.div<{ isMyRegion?: boolean }>`
    font-size: 15px;
    font-weight: 600;
    color: ${({ isMyRegion }) => isMyRegion ? colors.primary[700] : colors.gray[900]};
    display: flex;
    align-items: center;
    gap: 6px;
`;

const MyRegionBadge = styled.span`
    font-size: 10px;
    background-color: white;
    color: ${colors.primary[600]};
    border: 1px solid ${colors.primary[200]};
    padding: 2px 6px;
    border-radius: 10px;
    font-weight: 700;
`;

const RegionDistance = styled.div`
    font-size: 14px;
    font-weight: 500;
    color: ${colors.gray[600]};
`;

const ArrowIcon = styled.div<{ isExpanded: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    color: ${colors.gray[400]};
    transform: ${({ isExpanded }) => isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'};
    transition: transform 0.2s;
`;

const DropdownContent = styled.div`
    background-color: ${colors.gray[50]};
    padding: ${spacing[3]}px;
    padding-top: 0;
`;
