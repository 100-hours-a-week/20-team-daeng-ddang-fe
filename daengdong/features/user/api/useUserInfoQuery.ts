import { useQuery } from '@tanstack/react-query';
import { UserInfo } from '@/entities/user/model/types';

// Mock API Call
const fetchUserInfo = async (): Promise<UserInfo> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // MOCK: Toggle comment to test different states

    // Case A: No saved location
    return {
        email: 'example@test.com',
        province: null,
        city: null,
    };

    // Case B: Saved location (Uncomment to test)
    /*
    return {
      email: 'example@test.com',
      province: '서울',
      city: '강남구',
    };
    */
};

export const useUserInfoQuery = () => {
    return useQuery({
        queryKey: ['userInfo'],
        queryFn: fetchUserInfo,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    });
};
