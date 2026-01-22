import { useQuery } from "@tanstack/react-query";
import { DogInfo } from '@/entities/dog/model/types';
import { getDogInfo } from '@/entities/dog/api/dog';

export const useDogInfoQuery = () => {
    return useQuery<DogInfo | null>({
        queryKey: ['dogInfo'],
        queryFn: getDogInfo,
        staleTime: 1000 * 60 * 5,
        retry: 1,
    });
};
