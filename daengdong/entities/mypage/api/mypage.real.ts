import { http } from '@/shared/api/http';
import { MyPageSummary, MyPageSummaryResponse } from '../model/types';
import { ApiResponse } from '@/shared/api/types';
import { MyPageRepository } from './types';
import { resolveS3Url } from '@/shared/utils/resolveS3Url';

export const myPageRepositoryReal: MyPageRepository = {
    async getMyPageSummary(): Promise<MyPageSummary> {
        const response = await http.get<ApiResponse<MyPageSummaryResponse>>('/users');
        const data = response.data.data;

        return {
            dogId: data.dogId,
            dogName: data.name,
            point: data.point,
            totalWalkCount: data.totalWalkCount,
            totalWalkDistanceKm: data.totalWalkDistanceKm,
            profileImageUrl: resolveS3Url(data.profileImageUrl),
        };
    },
};
