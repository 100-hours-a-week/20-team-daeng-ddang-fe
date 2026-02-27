import { useQuery } from '@tanstack/react-query';
import { getBreeds } from '@/entities/dog/api/dog';
import { queryKeys } from '@/shared/lib/queryKeys';

export const useBreedsQuery = () => {
    return useQuery({
        queryKey: [queryKeys.breeds],
        queryFn: () => getBreeds(),
        staleTime: Infinity,
    });
};
