import { useQuery } from '@tanstack/react-query';
import { getBreeds } from '@/entities/dog/api/dog';

import { queryKeys } from '@/shared/api/queryKeys';

export const useBreedsQuery = (keyword: string) => {
    return useQuery({
        queryKey: [queryKeys.breeds, keyword],
        queryFn: () => getBreeds(keyword),
        enabled: true,
    });
};
