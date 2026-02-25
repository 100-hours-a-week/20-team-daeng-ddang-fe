import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import styled from "@emotion/styled";
import { RankingFilters } from "./RankingFilters";
import { RegionRankingList } from "./RegionRankingList";
import { RegionRankRow } from "./RegionRankRow";
import { LoadingView } from "@/widgets/GlobalLoading";
import { useRegionalRanking } from "../model/useRegionalRanking";
import { useModalStore } from "@/shared/stores/useModalStore";
import { ScrollToTopButton } from "./ScrollToTopButton";
import { colors, spacing } from "@/shared/styles/tokens";
import { useAuthStore } from "@/entities/session/model/store";

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
        isRegionRegistered,
        isUserLoading,
        userRankInfo
    } = useRegionalRanking();

    const router = useRouter();
    const { openModal } = useModalStore();
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

    const containerRef = useRef<HTMLDivElement>(null);
    const scrollContentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const hasCookie = document.cookie.includes('isLoggedIn=true');
        if (hasCookie && !isUserLoading && isRegionRegistered === false) {
            openModal({
                title: "지역 설정 필요!",
                message: "지역 랭킹을 보려면 지역 정보가 필요합니다! \n등록하시겠어요?",
                type: "confirm",
                confirmText: "등록하기",
                cancelText: "나중에 하기",
                onConfirm: () => router.push('/mypage/user'),
            });
        }
    }, [isUserLoading, isRegionRegistered, openModal, router, isLoggedIn]);

    if (isRegionListLoading && regionRanks.length === 0) return <LoadingView message="지역 랭킹 불러오는 중..." />;

    return (
        <Container ref={containerRef}>
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

            <ScrollContent ref={scrollContentRef} id="regional-scroll-content">
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

            <ScrollToTopButton scrollContainerRef={scrollContentRef} />

            {userRankInfo && (
                <FixedFooter>
                    <MyRankContainer>
                        <RegionRankRow
                            item={userRankInfo}
                            isExpanded={expandedRegionId === userRankInfo.regionId}
                            onToggle={() => toggleRegion(userRankInfo.regionId)}
                            periodType={period}
                            periodValue={periodValue}
                            isMyRegion={true}
                        />
                    </MyRankContainer>
                </FixedFooter>
            )}
        </Container>
    );
};

const Container = styled.div`
    background-color: white;
    height: 100svh;
    display: flex;
    flex-direction: column;
    position: relative;
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

const FixedFooter = styled.div`
    position: sticky;
    bottom: 0;
    z-index: 10;
    background-color: white;
    border-top: 1px solid ${colors.gray[200]};
    padding-bottom: env(safe-area-inset-bottom);
`;

const MyRankContainer = styled.div`
    padding: 0px ${spacing[4]}px;
    background-color: ${colors.primary[50]};
   
    & > div {
        border-bottom: none;
        margin: 0;
        padding-left: 0;
        padding-right: 0;
    }
    border: 2px solid ${colors.primary[300]};
    border-radius: 5px;
`;
