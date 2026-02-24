import { useState, useMemo } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { rankingApi } from "@/entities/ranking/api/rankingApi";
import { PeriodType, RegionRankingList } from "@/entities/ranking/model/types";
import { ApiResponse } from "@/shared/api/types";
import { format } from "date-fns";
import { useUserInfoQuery } from "@/features/user/api/useUserInfoQuery";

export const useRegionalRanking = () => {
    const { data: userInfo, isLoading: isUserLoading } = useUserInfoQuery();
    const [period, setPeriod] = useState<PeriodType>('WEEK');
    const isRegionRegistered = userInfo === undefined ? undefined : !!userInfo?.regionId;

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

    const {
        data: regionListData,
        fetchNextPage: fetchNextRegionPage,
        hasNextPage: hasNextRegionPage,
        isLoading: isRegionListLoading
    } = useInfiniteQuery({
        queryKey: ['ranking', 'region-list', period, periodValue],
        queryFn: async ({ pageParam }) => {
            // === 성능 테스트용 MOCK DATA ===
            const isMockMode = process.env.NEXT_PUBLIC_MOCK === 'true';
            if (isMockMode) {
                const page = parseInt(pageParam as string || '0', 10);
                if (page < 100) { // 100페이지 (총 2000개)
                    const ranks = Array.from({ length: 20 }).map((_, i) => {
                        const rank = page * 20 + i + 1;
                        return {
                            rank,
                            regionId: rank,
                            regionName: `테스트 지역구 ${rank}`,
                            totalDistance: Math.floor(100000 / rank),
                        };
                    });

                    await new Promise(r => setTimeout(r, 300)); // 네트워크 지연

                    return {
                        message: "ok",
                        errorCode: null,
                        data: {
                            ranks,
                            hasNext: page < 99,
                            nextCursor: String(page + 1)
                        }
                    } as ApiResponse<RegionRankingList>;
                }
            }
            // ===================================

            return rankingApi.getRegionRankingList({
                periodType: period,
                periodValue,
                cursor: pageParam as string | undefined,
                limit: 20
            });
        },
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage.data.hasNext ? lastPage.data.nextCursor : undefined,
    });

    const regionRanks = useMemo(() =>
        regionListData?.pages.flatMap((page: ApiResponse<RegionRankingList>) => page.data.ranks) || []
        , [regionListData]);


    const [expandedRegionId, setExpandedRegionId] = useState<number | null>(null);

    const toggleRegion = (regionId: number) => {
        setExpandedRegionId(prev => prev === regionId ? null : regionId);
    };

    const { data: summaryData } = useQuery({
        queryKey: ['ranking', 'region-summary', period, periodValue, userInfo?.regionId],
        queryFn: () => rankingApi.getRegionRankingSummary({
            periodType: period,
            periodValue,
            regionId: userInfo?.regionId
        }),
        enabled: !!userInfo?.regionId
    });

    const userRankInfo = summaryData?.data.myRank;
    const userRegionId = userRankInfo?.regionId;

    const handleJumpToMyRegion = () => {
        if (!userRegionId) return;

        const targetId = userRegionId;

        const element = document.getElementById(`region-rank-item-${targetId}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            alert("순위권 밖에 있거나 로딩되지 않았습니다. 리스트를 더 내려주세요!");
        }
    };

    return {
        period,
        expandedRegionId,
        isRegionListLoading,
        userRegionId,
        isRegionRegistered,
        isUserLoading,

        setPeriod,
        toggleRegion,
        fetchNextRegionPage,
        handleJumpToMyRegion,

        hasNextRegionPage,
        regionRanks,
        periodValue,
        userRankInfo
    };
};
