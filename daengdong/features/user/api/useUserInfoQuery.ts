import { useQuery } from '@tanstack/react-query';
import { getUserInfo, UserInfo } from '@/entities/user/api/user';

export const useUserInfoQuery = () => {
    return useQuery({
        queryKey: ['userInfo'],
        queryFn: getUserInfo,
        staleTime: 1000 * 60 * 5, // 5m
        retry: 1,
    });
};
