import { useQuery } from '@tanstack/react-query';
import { MyPageSummary } from '@/entities/mypage/model/types';
import { getMyPageSummary } from '@/entities/mypage/api/mypage';

export const useMyPageSummaryQuery = () => {
    return useQuery<MyPageSummary>({
        queryKey: ['myPageSummary'],
        queryFn: getMyPageSummary,
        staleTime: 1000 * 60 * 5, // 5분 캐싱
    });
};
