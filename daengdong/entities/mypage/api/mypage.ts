import { http } from '@/shared/api/http';
import { ApiResponse } from '@/shared/api/types';
import { resolveS3Url } from '@/shared/utils/resolveS3Url';
import { MyPageSummary, MyPageSummaryResponse } from '../model/types';

export const getMyPageSummary = async (): Promise<MyPageSummary> => {
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
};
