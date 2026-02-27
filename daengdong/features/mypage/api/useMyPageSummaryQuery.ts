import { useQuery } from '@tanstack/react-query';
import { MyPageSummary } from '@/entities/mypage/model/types';
import { getMyPageSummary } from '@/entities/mypage/api/mypage';
import { useAuthStore } from '@/entities/session/model/store';

export const useMyPageSummaryQuery = () => {
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

    return useQuery<MyPageSummary>({
        queryKey: ['myPageSummary'],
        queryFn: getMyPageSummary,
        staleTime: 1000 * 60 * 5, // 5분 캐싱
        enabled: isLoggedIn,
    });
};
