import { useRef } from "react";
import styled from "@emotion/styled";
import { RankingFilters } from "./RankingFilters";
import { TopPodium } from "./TopPodium";
import { RankingList } from "./RankingList";
import { MyRankFloatingButton } from "./MyRankFloatingButton";
import { LoadingView } from "@/widgets/GlobalLoading";
import { RegionSelectionModal } from "./RegionSelectionModal";
import { usePersonalRanking } from "../model/usePersonalRanking";

export const PersonalRankingView = () => {
    const {
        period,
        scope,
        selectedRegion,
        isRegionModalOpen,
        isSummaryLoading,
        setPeriod,
        setScope,
        setIsRegionModalOpen,
        setSelectedRegion,
        handleJumpToMyRank,
        fetchNextPage,
        hasNextPage,
        rankingList,
        myRankInfo,
        topRanks,
        summaryData
    } = usePersonalRanking();

    const containerRef = useRef<HTMLDivElement>(null);

    if (isSummaryLoading && !summaryData) return <LoadingView message="랭킹 불러오는 중..." />;
    if (!summaryData && !isSummaryLoading) return <LoadingView message="데이터가 없습니다." />;

    return (
        <Container ref={containerRef}>
            <FixedHeader>
                <RankingFilters
                    period={period}
                    scope={scope}
                    regionName={selectedRegion?.name}
                    onPeriodChange={setPeriod}
                    onScopeChange={setScope}
                    onRegionClick={() => setIsRegionModalOpen(true)}
                />
                <TopPodium topRanks={topRanks} />
            </FixedHeader>

            <ScrollContent>
                <RankingList
                    ranks={rankingList}
                    myRankInfo={myRankInfo}
                    onLoadMore={fetchNextPage}
                    hasMore={!!hasNextPage}
                />
            </ScrollContent>

            <MyRankFloatingButton
                isVisible={true}
                onClick={handleJumpToMyRank}
            />

            <RegionSelectionModal
                isOpen={isRegionModalOpen}
                onClose={() => setIsRegionModalOpen(false)}
                onSelect={(region) => setSelectedRegion({ id: region.regionId, name: region.name })}
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
    padding-bottom: 80px; /* For Bottom Nav */
    
    /* Hide scrollbar */
    &::-webkit-scrollbar {
        display: none;
    }
    -ms-overflow-style: none;
    scrollbar-width: none;
`;