import { useQuery } from '@tanstack/react-query';
import { UserInfo } from '@/entities/user/model/types';
import { getUserInfo } from '@/entities/user/api/user';

import { queryKeys } from '@/shared/lib/queryKeys';

export const useUserInfoQuery = () => {
    return useQuery<UserInfo | null>({
        queryKey: [queryKeys.userInfo],
        queryFn: getUserInfo,
        staleTime: 1000 * 60 * 5, // 5분 캐싱
        retry: 1,
    });
};
