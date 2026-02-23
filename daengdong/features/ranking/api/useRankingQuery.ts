import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { rankingApi } from '../../../entities/ranking/api/rankingApi';
import { RankingQueryParams } from '../../../entities/ranking/model/types';
import { AxiosError } from 'axios';

import { getRankingStaleTime } from '../lib/rankingTimeUtils';

export const useRankingSummaryQuery = (params: Omit<RankingQueryParams, 'cursor' | 'limit'>) => {
    return useQuery({
        queryKey: ['ranking', 'summary', params.periodType, params.periodValue, params.regionId],
        queryFn: () => rankingApi.getRankingSummary(params),
        staleTime: getRankingStaleTime(),
        gcTime: getRankingStaleTime(),
        retry: (failureCount, error) => {
            if ((error as AxiosError).response?.status === 404) return false;
            return failureCount < 3;
        },
    });
};

export const useRankingListInfiniteQuery = (params: Omit<RankingQueryParams, 'cursor'>) => {
    return useInfiniteQuery({
        queryKey: ['ranking', 'list', params.periodType, params.periodValue, params.regionId],
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
                            dogId: rank,
                            dogName: `테스트 멈무 ${rank}`,
                            breed: "말티푸",
                            age: Math.floor(Math.random() * 10) + 1,
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
                    };
                }
            }
            // ===================================

            return rankingApi.getRankingList({
                ...params,
                cursor: pageParam as string | undefined
            });
        },
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage.data.hasNext ? lastPage.data.nextCursor : undefined,
        staleTime: getRankingStaleTime(),
        gcTime: getRankingStaleTime(),
        retry: (failureCount, error) => {
            if ((error as AxiosError).response?.status === 404) return false;
            return failureCount < 3;
        },
    });
};
