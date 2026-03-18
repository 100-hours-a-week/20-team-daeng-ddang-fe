import { useQuery } from '@tanstack/react-query';
import { footprintsApi } from '../../../entities/footprints/api/footprints';
import { useAuthStore } from '@/entities/session/model/store';

export const useFootprintsCalendarQuery = (year: number, month: number) => {
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
    return useQuery({
        queryKey: ['footprints', 'calendar', year, month],
        queryFn: () => footprintsApi.getFootprints(year, month),
        staleTime: 5 * 60 * 1000, // 5분
        enabled: isLoggedIn,
    });
};

export const useDailyRecordsQuery = (date: string | null) => {
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
    return useQuery({
        queryKey: ['footprints', 'daily', date],
        queryFn: () => date ? footprintsApi.getDailyRecords(date) : Promise.resolve([]),
        enabled: !!date && isLoggedIn,
    });
};

export const useWalkDetailQuery = (walkId: number | null) => {
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
    return useQuery({
        queryKey: ['footprints', 'walk', walkId],
        queryFn: () => walkId ? footprintsApi.getWalkDetail(walkId) : Promise.reject('No ID'),
        enabled: !!walkId && isLoggedIn,
    });
};

export const useWalkExpressionQuery = (walkId: number | null) => {
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
    return useQuery({
        queryKey: ['footprints', 'walk-expression', walkId],
        queryFn: () => walkId ? footprintsApi.getWalkExpression(walkId) : Promise.resolve(null),
        enabled: !!walkId && isLoggedIn,
    });
};

export const useHealthcareDetailQuery = (healthcareId: number | null) => {
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
    return useQuery({
        queryKey: ['footprints', 'healthcare', healthcareId],
        queryFn: () => healthcareId ? footprintsApi.getHealthcareDetail(healthcareId) : Promise.reject('No ID'),
        enabled: !!healthcareId && isLoggedIn,
    });
};
