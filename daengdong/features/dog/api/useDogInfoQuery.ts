import { useQuery } from "@tanstack/react-query";
import { DogInfo } from '@/entities/dog/model/types';

export const useDogInfoQuery = () => {
    return useQuery<DogInfo | null>({
        queryKey: ['dogInfo'],
        queryFn: async () => null,
        staleTime: 1000 * 60 * 5,
        retry: 1,
    });
};
