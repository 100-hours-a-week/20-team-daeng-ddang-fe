import { useQuery } from '@tanstack/react-query';
import { getBreeds } from '@/shared/api/dogs';

export const useBreedsQuery = (keyword: string) => {
    return useQuery({
        queryKey: ['breeds', keyword],
        queryFn: () => getBreeds(keyword),
        enabled: true, // Always fetch, might want to throttle in UI
    });
};
