import styled from "@emotion/styled";
import { RankingFilters } from "./RankingFilters";
import { RegionRankingList } from "./RegionRankingList";
import { LoadingView } from "@/widgets/GlobalLoading";
import { useRegionalRanking } from "../model/useRegionalRanking";
import { MyRankFloatingButton } from "./MyRankFloatingButton";

export const RegionalRankingView = () => {
    const {
        period,
        setPeriod,
        regionRanks,
        fetchNextRegionPage,
        hasNextRegionPage,
        isRegionListLoading,
        expandedRegionId,
        toggleRegion,
        periodValue,
        userRegionId,
        handleJumpToMyRegion
    } = useRegionalRanking();

    if (isRegionListLoading && regionRanks.length === 0) return <LoadingView message="지역 랭킹 불러오는 중..." />;

    return (
        <Container>
            <FixedHeader>
                <RankingFilters
                    period={period}
                    scope={'NATIONWIDE'}
                    onPeriodChange={setPeriod}
                    onScopeChange={() => { }}
                    onRegionClick={() => { }}
                    showScopeSelector={false}
                    className="regional-ranking"
                />
            </FixedHeader>

            <ScrollContent>
                <RegionRankingList
                    ranks={regionRanks}
                    expandedRegionId={expandedRegionId}
                    onToggleRegion={toggleRegion}
                    onLoadMore={fetchNextRegionPage}
                    hasMore={!!hasNextRegionPage}
                    periodType={period}
                    periodValue={periodValue}
                    userRegionId={userRegionId}
                />
            </ScrollContent>

            <MyRankFloatingButton
                isVisible={!!userRegionId}
                onClick={handleJumpToMyRegion}
            />
        </Container>
    );
};

const Container = styled.div`
    background-color: white;
    height: 100vh;
    display: flex;
    flex-direction: column;
`;

const FixedHeader = styled.div`
    position: sticky;
    top: 0;
    z-index: 10;
    background-color: white;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
`;

const ScrollContent = styled.div`
    flex: 1;
    overflow-y: auto;
    padding-bottom: 80px;
    
    &::-webkit-scrollbar {
        display: none;
    }
    -ms-overflow-style: none;
    scrollbar-width: none;
`;
