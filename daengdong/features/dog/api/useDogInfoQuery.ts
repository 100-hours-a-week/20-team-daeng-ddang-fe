import { useQuery } from "@tanstack/react-query";
import { DogInfo } from '@/entities/dog/model/types';
import { getDogInfo } from '@/entities/dog/api/dog';

import { queryKeys } from "@/shared/lib/queryKeys";

export const useDogInfoQuery = () => {
    return useQuery<DogInfo | null>({
        queryKey: [queryKeys.dogInfo],
        queryFn: getDogInfo,
        staleTime: 1000 * 60 * 5,
        retry: 1,
        refetchOnWindowFocus: false,
    });
};
