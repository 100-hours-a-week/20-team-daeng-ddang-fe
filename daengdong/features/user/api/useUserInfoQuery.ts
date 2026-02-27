import { useQuery } from '@tanstack/react-query';
import { UserInfo } from '@/entities/user/model/types';
import { getUserInfo } from '@/entities/user/api/user';

import { queryKeys } from '@/shared/lib/queryKeys';
import { useAuthStore } from '@/entities/session/model/store';

export const useUserInfoQuery = () => {
    // 로그인 상태일 때만 프로필 조회 (비로그인 접근 시 강제 401 리다이렉트 방지)
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

    return useQuery<UserInfo | null>({
        queryKey: [queryKeys.userInfo],
        queryFn: getUserInfo,
        staleTime: 1000 * 60 * 5, // 5분 캐싱
        retry: 1,
        enabled: isLoggedIn,
    });
};
