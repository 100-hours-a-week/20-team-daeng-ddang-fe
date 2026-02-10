import { useQuery } from '@tanstack/react-query';
import { footprintsApi } from '../../../entities/footprints/api/footprints';

export const useFootprintsCalendarQuery = (year: number, month: number) => {
    return useQuery({
        queryKey: ['footprints', 'calendar', year, month],
        queryFn: () => footprintsApi.getFootprints(year, month),
        staleTime: 5 * 60 * 1000, // 5분
    });
};

export const useDailyRecordsQuery = (date: string | null) => {
    return useQuery({
        queryKey: ['footprints', 'daily', date],
        queryFn: () => date ? footprintsApi.getDailyRecords(date) : Promise.resolve([]),
        enabled: !!date,
    });
};

export const useWalkDetailQuery = (walkId: number | null) => {
    return useQuery({
        queryKey: ['footprints', 'walk', walkId],
        queryFn: () => walkId ? footprintsApi.getWalkDetail(walkId) : Promise.reject('No ID'),
        enabled: !!walkId,
    });
};

export const useWalkExpressionQuery = (walkId: number | null) => {
    return useQuery({
        queryKey: ['footprints', 'walk-expression', walkId],
        queryFn: () => walkId ? footprintsApi.getWalkExpression(walkId) : Promise.resolve(null),
        enabled: !!walkId,
    });
};

export const useHealthcareDetailQuery = (healthcareId: number | null) => {
    return useQuery({
        queryKey: ['footprints', 'healthcare', healthcareId],
        queryFn: () => healthcareId ? footprintsApi.getHealthcareDetail(healthcareId) : Promise.reject('No ID'),
        enabled: !!healthcareId,
    });
};
