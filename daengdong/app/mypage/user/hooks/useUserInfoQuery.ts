import { useQuery } from '@tanstack/react-query';

export interface UserInfoResponse {
    email: string;
    province: string;
    city: string;
}

// Mock API 요청
const fetchUserInfo = async (): Promise<UserInfoResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
        email: 'mock_user@example.com',
        province: '서울',
        city: '강남구',
    };
};

export const useUserInfoQuery = () => {
    return useQuery({
        queryKey: ['userInfo'],
        queryFn: fetchUserInfo,
        staleTime: 1000 * 60 * 5, // 5m
        retry: 1,
    });
};
