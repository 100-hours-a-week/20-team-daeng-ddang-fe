import { http } from '@/shared/api/http';
import { UserInfo, UserResponse, CreateUserParams, UpdateUserParams, Region } from '../model/types';
import { ApiResponse } from '@/shared/api/types';
import { UserRepository } from './types';

interface RegionsResponse {
    regions: Region[];
}

export const userRepositoryReal: UserRepository = {
    async getUserInfo(): Promise<UserInfo | null> {
        try {
            const response = await http.get<ApiResponse<UserResponse>>('/users/me');
            const data = response.data.data;

            return {
                userId: data.userId,
                regionId: data.regionId,
                parentRegionId: data.parentRegionId,
                region: data.region,
                kakaoEmail: data.kakaoEmail,
            };
        } catch (error: any) {
            if (error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    },

    async createUser(params: CreateUserParams): Promise<UserResponse> {
        const response = await http.post<ApiResponse<UserResponse>>('/users', params);
        return response.data.data;
    },

    async updateUser(params: UpdateUserParams): Promise<UserResponse> {
        const response = await http.patch<ApiResponse<UserResponse>>('/users', params);
        return response.data.data;
    },

    async getRegions(parentId?: number): Promise<Region[]> {
        const params = parentId ? { parentId } : {};
        const response = await http.get<ApiResponse<RegionsResponse>>('/users/regions', { params });
        return response.data.data.regions;
    },
};
