import { useState, useMemo, useEffect } from "react";
import { useUserInfoQuery } from "@/features/user/api/useUserInfoQuery";
import { useRankingListInfiniteQuery, useRankingSummaryQuery } from "../api/useRankingQuery";
import { PeriodType, ScopeType, RankingItem, RankingList as RankingListType } from "@/entities/ranking/model/types";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { ApiResponse } from "@/shared/api/types";

export const usePersonalRanking = () => {
    const router = useRouter();
    const { data: userInfo, isLoading: isUserLoading } = useUserInfoQuery();

    const [period, setPeriod] = useState<PeriodType>('WEEK');
    const [scope, setScope] = useState<ScopeType>('NATIONWIDE');

    const periodValue = useMemo(() => {
        const now = new Date();
        switch (period) {
            case 'WEEK':
                return format(now, "yyyy-'W'II");
            case 'MONTH':
                return format(now, "yyyy-MM");
            case 'YEAR':
                return format(now, "yyyy");
            default:
                return format(now, "yyyy-MM-dd");
        }
    }, [period]);

    const [selectedRegion, setSelectedRegion] = useState<{ id: number; name: string } | null>(null);
    const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);

    useEffect(() => {
        if (isUserLoading) return;

        if (userInfo?.regionId) {
            if (!selectedRegion) {
                const regionName = userInfo.region.split(" ").pop() || userInfo.region;
                setTimeout(() => {
                    setSelectedRegion({ id: userInfo.regionId, name: regionName });
                }, 0);
            }
        } else if (!isUserLoading && !userInfo?.regionId) {
            if (scope === 'REGIONAL') {
                setTimeout(() => {
                    if (confirm("지역 설정이 필요합니다. 설정 페이지로 이동하시겠습니까?")) {
                        router.push('/mypage/user');
                    } else {
                        setScope('NATIONWIDE');
                    }
                }, 100);
            }
        }
    }, [userInfo, isUserLoading, scope, router, selectedRegion]);

    const { data: summaryData, isLoading: isSummaryLoading } = useRankingSummaryQuery({
        periodType: period,
        periodValue,
        regionId: scope === 'REGIONAL' ? selectedRegion?.id : undefined,
    });

    const {
        data: listData,
        fetchNextPage,
        hasNextPage
    } = useRankingListInfiniteQuery({
        periodType: period,
        periodValue,
        regionId: scope === 'REGIONAL' ? selectedRegion?.id : undefined,
    });

    const rankingList = useMemo(() =>
        listData?.pages.flatMap((page: ApiResponse<RankingListType>) => page.data.ranks)
            .filter((item: RankingItem) => item.rank > 3) || []
        , [listData]);

    const myRankInfo = summaryData?.data?.myRank;
    const topRanks = summaryData?.data?.topRanks || [];

    const [hasScrolledToMyRank, setHasScrolledToMyRank] = useState(false);

    useEffect(() => {
        if (!hasScrolledToMyRank && myRankInfo?.dogId && rankingList.length > 0) {
            const isMyRankLoaded = rankingList.some((item: RankingItem) => item.dogId === myRankInfo.dogId);

            if (isMyRankLoaded) {
                setTimeout(() => {
                    const element = document.getElementById(`rank-item-${myRankInfo.dogId}`);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        setHasScrolledToMyRank(true);
                    }
                }, 300);
            }
        }
    }, [myRankInfo, rankingList, hasScrolledToMyRank]);

    const handleJumpToMyRank = () => {
        if (!myRankInfo?.dogId) return;
        const element = document.getElementById(`rank-item-${myRankInfo.dogId}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            alert("순위가 너무 멀리 있습니다! 스크롤을 더 내려주세요.");
        }
    };

    return {
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
    };
};
