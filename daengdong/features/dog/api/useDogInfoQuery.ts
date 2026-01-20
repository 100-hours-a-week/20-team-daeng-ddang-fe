import { useQuery } from '@tanstack/react-query';
import { getDogInfo } from '@/shared/api/dogs';

export const useDogInfoQuery = () => {
    return useQuery({
        queryKey: ['dogInfo'],
        queryFn: getDogInfo,
        staleTime: 1000 * 60 * 5,
        retry: 1, // Don't retry indefinitely if 404
    });
};
