import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { rankingApi } from '../../../entities/ranking/api/rankingApi';
import { RankingQueryParams } from '../../../entities/ranking/model/types';
import { AxiosError } from 'axios';

export const useRankingSummaryQuery = (params: Omit<RankingQueryParams, 'cursor' | 'limit'>) => {
    return useQuery({
        queryKey: ['ranking', 'summary', params.periodType, params.periodValue, params.regionId],
        queryFn: () => rankingApi.getRankingSummary(params),
        staleTime: 5 * 60 * 1000,
        retry: (failureCount, error) => {
            if ((error as AxiosError).response?.status === 404) return false;
            return failureCount < 3;
        },
    });
};

export const useRankingListInfiniteQuery = (params: Omit<RankingQueryParams, 'cursor'>) => {
    return useInfiniteQuery({
        queryKey: ['ranking', 'list', params.periodType, params.periodValue, params.regionId],
        queryFn: ({ pageParam }) => rankingApi.getRankingList({
            ...params,
            cursor: pageParam as string | undefined
        }),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage.data.hasNext ? lastPage.data.nextCursor : undefined,
        retry: (failureCount, error) => {
            if ((error as AxiosError).response?.status === 404) return false;
            return failureCount < 3;
        },
    });
};
