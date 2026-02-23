import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styled from "@emotion/styled";
import { RankingFilters } from "./RankingFilters";
import { TopPodium } from "./TopPodium";
import { RankingList } from "./RankingList";
import { LoadingView } from "@/widgets/GlobalLoading";
import { RegionSelectionModal } from "./RegionSelectionModal";
import { usePersonalRanking } from "../model/usePersonalRanking";
import { colors, spacing } from "@/shared/styles/tokens";
import { formatDistance } from "@/shared/utils/formatDistance";
import { calculateAge } from "@/shared/utils/calculateAge";
import { useModalStore } from "@/shared/stores/useModalStore";
import { ScrollToTopButton } from "./ScrollToTopButton";
import { RankItem } from "./RankItem";

export const PersonalRankingView = () => {
    const router = useRouter();
    const { openModal } = useModalStore();
    const {
        period,
        scope,
        selectedRegion,
        isRegionModalOpen,
        isSummaryLoading,
        isUserLoading,
        isDogLoading,
        isDogRegistered,
        setPeriod,
        setScope,
        setIsRegionModalOpen,
        setSelectedRegion,
        fetchNextPage,
        hasNextPage,
        rankingList,
        myRankInfo,
        topRanks,
        summaryData,
    } = usePersonalRanking();

    const containerRef = useRef<HTMLDivElement>(null);
    const scrollContentRef = useRef<HTMLDivElement>(null);
    const [showScrollTop, setShowScrollTop] = useState(false);

    const handleScroll = () => {
        if (!scrollContentRef.current) return;
        const { scrollTop } = scrollContentRef.current;
        setShowScrollTop(scrollTop > 200);
    };

    const scrollToTop = () => {
        scrollContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    useEffect(() => {
        if (!isUserLoading && !isDogLoading && isDogRegistered === false) {
            openModal({
                title: "반려견 등록 필요",
                message: "내 순위를 보려면 반려견 등록이 필요합니다! \n등록하시겠어요?",
                type: "confirm",
                confirmText: "등록하기",
                cancelText: "나중에 하기",
                onConfirm: () => router.push('/mypage/dog'),
            });
        }
    }, [isUserLoading, isDogLoading, isDogRegistered, openModal, router]);

    if (isSummaryLoading && !summaryData && topRanks.length === 0) return <LoadingView message="랭킹 불러오는 중..." />;

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
                <UpdateNotice>랭킹은 매일 00시에 업데이트됩니다!</UpdateNotice>
            </FixedHeader>

            <ScrollContent ref={scrollContentRef} onScroll={handleScroll}>
                <TopPodium topRanks={topRanks} />
                <RankingList
                    ranks={rankingList}
                    myRankInfo={myRankInfo}
                    onLoadMore={fetchNextPage}
                    hasMore={!!hasNextPage}
                />
            </ScrollContent>

            <ScrollToTopButton
                isVisible={showScrollTop}
                onClick={scrollToTop}
            />

            {myRankInfo && (
                <FixedFooter>
                    <MyRankRow>
                        <RankItem isHighlighted>
                            <RankItem.Number isHighlighted>{myRankInfo.rank}</RankItem.Number>
                            <RankItem.Avatar
                                src={myRankInfo.profileImageUrl}
                                alt={myRankInfo.dogName}
                            />
                            <RankItem.Info>
                                <RankItem.Name>{myRankInfo.dogName}</RankItem.Name>
                                <RankItem.SubInfo>
                                    {[
                                        myRankInfo.breed,
                                        myRankInfo.birthDate ? `${calculateAge(myRankInfo.birthDate)}살` : myRankInfo.age ? `${myRankInfo.age}살` : null
                                    ].filter(Boolean).join(' • ')}
                                </RankItem.SubInfo>
                            </RankItem.Info>
                            <RankItem.Distance>
                                {formatDistance(myRankInfo.totalDistance)}<DistanceUnit>km</DistanceUnit>
                            </RankItem.Distance>
                        </RankItem>
                    </MyRankRow>
                </FixedFooter>
            )}

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
    
    /* Hide scrollbar */
    &::-webkit-scrollbar {
        display: none;
    }
    -ms-overflow-style: none;
    scrollbar-width: none;
`;

const FixedFooter = styled.div`
    position: sticky;
    bottom: 0;
    z-index: 10;
    background-color: white;
    border-top: 1px solid ${colors.gray[200]};
    padding-bottom: env(safe-area-inset-bottom);
`;

const MyRankRow = styled.div`
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

const UpdateNotice = styled.div`
    font-size: 11px;
    color: ${colors.gray[500]};
    text-align: center;
    padding-bottom: ${spacing[2]}px;
    margin-top: ${spacing[2]}px;
`;

const DistanceUnit = styled.span`
    font-size: 11px;
    font-weight: 500;
    color: ${colors.gray[500]};
    margin-left: 2px;
`;