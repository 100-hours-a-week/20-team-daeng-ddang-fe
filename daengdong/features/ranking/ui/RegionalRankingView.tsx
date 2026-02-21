import { useEffect } from "react";
import { useRouter } from "next/navigation";
import styled from "@emotion/styled";
import { RankingFilters } from "./RankingFilters";
import { RegionRankingList } from "./RegionRankingList";
import { LoadingView } from "@/widgets/GlobalLoading";
import { useRegionalRanking } from "../model/useRegionalRanking";
import { MyRankFloatingButton } from "./MyRankFloatingButton";
import { useModalStore } from "@/shared/stores/useModalStore";
import { colors, spacing } from "@/shared/styles/tokens";

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
        handleJumpToMyRegion,
        isRegionRegistered,
        isUserLoading
    } = useRegionalRanking();

    const router = useRouter();
    const { openModal } = useModalStore();

    useEffect(() => {
        if (!isUserLoading && isRegionRegistered === false) {
            openModal({
                title: "지역 설정 필요!",
                message: "지역 랭킹을 보려면 지역 정보가 필요합니다! \n등록하시겠어요?",
                type: "confirm",
                confirmText: "등록하기",
                cancelText: "나중에 하기",
                onConfirm: () => router.push('/mypage/user'),
            });
        }
    }, [isUserLoading, isRegionRegistered, openModal, router]);

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
                <UpdateNotice>랭킹은 매일 00시에 업데이트됩니다!</UpdateNotice>
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
    height: 100svh;
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

const UpdateNotice = styled.div`
    font-size: 11px;
    color: ${colors.gray[500]};
    text-align: center;
    padding-bottom: ${spacing[3]}px;
    margin-top: -${spacing[2]}px;
`;
