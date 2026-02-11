import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
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
        queryFn: ({ pageParam }) => rankingApi.getRegionContributionList({
            periodType,
            periodValue,
            regionId,
            cursor: pageParam as string | undefined,
            limit: 10
        }),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage.data.hasNext ? lastPage.data.nextCursor : undefined,
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
