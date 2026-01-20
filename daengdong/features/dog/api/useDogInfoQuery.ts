// import { getDogInfo } from '@/entities/dog/api/dog';

import { useQuery } from "@tanstack/react-query";
import { DogInfo } from '@/entities/dog/model/types';

export const useDogInfoQuery = () => {
    return useQuery<DogInfo | null>({
        queryKey: ['dogInfo'],
        queryFn: async () => null, // getDogInfo temporarily disabled
        staleTime: 1000 * 60 * 5,
        retry: 1,
    });
};
