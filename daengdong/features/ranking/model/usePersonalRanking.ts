import { useState, useMemo, useEffect } from "react";
import { useUserInfoQuery } from "@/features/user/api/useUserInfoQuery";
import { useDogInfoQuery } from "@/features/dog/api/useDogInfoQuery";
import { useRankingListInfiniteQuery, useRankingSummaryQuery } from "../api/useRankingQuery";
import { PeriodType, ScopeType, RankingItem, RankingList as RankingListType } from "@/entities/ranking/model/types";
import { format } from "date-fns";
import { ApiResponse } from "@/shared/api/types";

export const usePersonalRanking = () => {
    const { data: userInfo, isLoading: isUserLoading } = useUserInfoQuery();
    const { data: dogInfo, isLoading: isDogLoading } = useDogInfoQuery();

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
        }
    }, [userInfo, isUserLoading, selectedRegion]);

    const { data: summaryData, isLoading: isSummaryLoading, isError: isSummaryError } = useRankingSummaryQuery({
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
    const topRanks = summaryData?.data?.topRanks || listData?.pages[0]?.data?.ranks.slice(0, 3) || [];

    const isDogRegistered = !!dogInfo;

    return {
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
        isSummaryError
    };
};
