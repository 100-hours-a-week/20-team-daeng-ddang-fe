import { useQuery } from '@tanstack/react-query';
import { getRegions, Region } from '@/shared/api/user';

export const useRegionsQuery = (parentId?: number) => {
    return useQuery({
        queryKey: ['regions', parentId],
        queryFn: () => getRegions(parentId),
        // Cache regions effectively as they rarely change
        staleTime: 1000 * 60 * 60, // 1 hour
    });
};
