import { useRef, useEffect } from "react";
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
import { DogProfileImage } from "@/shared/components/DogProfileImage";
import { useModalStore } from "@/shared/stores/useModalStore";

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

    useEffect(() => {
        if (!isUserLoading && isDogRegistered === false) {
            openModal({
                title: "반려견 등록 필요",
                message: "랭킹 서비스를 이용하려면 반려견 등록이 필요합니다.\n등록 페이지로 이동하시겠습니까?",
                type: "confirm",
                confirmText: "이동",
                cancelText: "나중에 하기",
                onConfirm: () => router.push('/register/dog'),
            });
        }
    }, [isUserLoading, isDogRegistered, openModal, router]);

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

            {myRankInfo && (
                <FixedFooter>
                    <MyRankRow>
                        <RankNum>{myRankInfo.rank}</RankNum>
                        <Avatar>
                            <DogProfileImage
                                src={myRankInfo.profileImageUrl}
                                alt={myRankInfo.dogName}
                                size={40}
                            />
                        </Avatar>
                        <Info>
                            <Name>{myRankInfo.dogName}</Name>
                            <SubInfo>
                                {[
                                    myRankInfo.breed,
                                    myRankInfo.birthDate ? `${calculateAge(myRankInfo.birthDate)}살` : myRankInfo.age ? `${myRankInfo.age}살` : null
                                ].filter(Boolean).join(' • ')}
                            </SubInfo>
                        </Info>
                        <DistanceContainer>
                            <DistanceValue>
                                {formatDistance(myRankInfo.totalDistance)}
                                <DistanceUnit>km</DistanceUnit>
                            </DistanceValue>
                        </DistanceContainer>
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
    display: flex;
    align-items: center;
    padding: ${spacing[3]}px ${spacing[4]}px;
    background-color: ${colors.primary[50]};
`;

const RankNum = styled.div`
    width: 30px;
    font-size: 16px;
    font-weight: 700;
    color: ${colors.primary[600]};
    text-align: center;
    margin-right: ${spacing[3]}px;
`;

const Avatar = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
    margin-right: ${spacing[3]}px;
    background-color: ${colors.gray[200]};
`;

const Info = styled.div`
    flex: 1;
`;

const Name = styled.div`
    font-size: 15px;
    font-weight: 600;
    color: ${colors.gray[900]};
`;

const SubInfo = styled.div`
    font-size: 12px;
    color: ${colors.gray[500]};
    margin-top: 2px;
`;

const DistanceContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: center;
    min-width: 60px;
`;

const DistanceValue = styled.div`
    font-size: 15px;
    font-weight: 700;
    color: ${colors.gray[600]};
    letter-spacing: -0.5px;
    font-variant-numeric: tabular-nums;
`;

const DistanceUnit = styled.span`
    font-size: 11px;
    font-weight: 500;
    color: ${colors.gray[500]};
    margin-left: 2px;
`;