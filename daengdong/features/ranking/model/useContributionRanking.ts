import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { rankingApi } from "@/entities/ranking/api/rankingApi";
import { ContributionRankingList, PeriodType } from "@/entities/ranking/model/types";
import { ApiResponse } from "@/shared/api/types";

interface UseContributionRankingParams {
    regionId: number;
    periodType: PeriodType;
    periodValue: string;
}

export const useContributionRanking = ({ regionId, periodType, periodValue }: UseContributionRankingParams) => {

    const { data: summaryData, isLoading: isSummaryLoading } = useQuery({
        queryKey: ['ranking', 'contribution-summary', regionId, periodType, periodValue],
        queryFn: () => rankingApi.getRegionContributionSummary({
            periodType,
            periodValue,
            regionId
        }),
        staleTime: 5 * 60 * 1000,
    });

    const {
        data: listData,
        fetchNextPage,
        hasNextPage,
        isLoading: isListLoading
    } = useInfiniteQuery({
        queryKey: ['ranking', 'contribution-list', 'v2', regionId, periodType, periodValue],
        queryFn: async ({ pageParam }) => {
            // === 성능 테스트용 MOCK DATA ===
            const isMockMode = process.env.NEXT_PUBLIC_MOCK === 'true';
            if (isMockMode) {
                const page = parseInt(pageParam as string || '0', 10);
                if (page < 100) { // 100페이지 (총 1000개)
                    const ranks = Array.from({ length: 10 }).map((_, i) => {
                        const rank = page * 10 + i + 1;
                        return {
                            rank,
                            dogId: rank,
                            dogName: `테스트 이웃 강아지 ${rank}`,
                            dogDistance: Math.floor(50000 / rank),
                            contributionRate: Number((Math.max(0.1, 50 / rank)).toFixed(2)),
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
                    } as ApiResponse<ContributionRankingList>;
                }
            }
            // ===================================

            return rankingApi.getRegionContributionList({
                periodType,
                periodValue,
                regionId,
                cursor: pageParam as string | undefined,
                limit: 10
            });
        },
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage.data.hasNext ? lastPage.data.nextCursor : undefined,
        staleTime: 5 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
    });

    const contributionRanks = listData?.pages.flatMap((page: ApiResponse<ContributionRankingList>) => page.data.ranks) || [];

    return {
        summaryData: summaryData?.data,
        isSummaryLoading,
        contributionRanks,
        fetchNextPage,
        hasNextPage,
        isListLoading
    };
};
