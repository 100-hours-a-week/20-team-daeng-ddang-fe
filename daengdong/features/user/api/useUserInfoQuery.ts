import { useQuery } from '@tanstack/react-query';
import { getUserInfo } from '@/shared/api/user';
import { UserInfo } from '@/shared/api/user';

export const useUserInfoQuery = () => {
    return useQuery({
        queryKey: ['userInfo'],
        queryFn: getUserInfo,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    });
};
