import { useQuery } from "@tanstack/react-query";
import { DogInfo } from '@/entities/dog/model/types';
import { getDogInfo } from '@/entities/dog/api/dog';

import { queryKeys } from "@/shared/lib/queryKeys";
import { useAuthStore } from '@/entities/session/model/store';

export const useDogInfoQuery = () => {
    // 로그인 상태일 때만 프로필 조회
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

    return useQuery<DogInfo | null>({
        queryKey: [queryKeys.dogInfo],
        queryFn: getDogInfo,
        staleTime: 1000 * 60 * 5,
        retry: 1,
        refetchOnWindowFocus: false,
        enabled: isLoggedIn,
    });
};
