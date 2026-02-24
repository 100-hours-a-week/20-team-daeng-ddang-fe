import { useQuery } from '@tanstack/react-query';
import { getRegions } from '@/entities/user/api/user';
export const useRegionsQuery = (parentId?: number) => {

    return useQuery({
        queryKey: ['regions', parentId],
        queryFn: () => getRegions(parentId),
        staleTime: 1000 * 60 * 60, // 1h
    });
};
