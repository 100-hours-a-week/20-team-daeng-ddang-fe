import { http } from '@/shared/api/http';
import { ApiResponse } from '@/shared/api/types';
import { Region, UserInfo } from '@/entities/user/model/types';

interface RegionsResponse {
    regions: Region[];
}

export const getRegions = async (parentId?: number): Promise<Region[]> => {
    const params = parentId ? { parentId } : {};

    const response = await http.get<ApiResponse<RegionsResponse>>(
        `/users/regions`,
        { params }
    );

    return response.data.data.regions;
};

export const registerUserInfo = async (regionId: number): Promise<void> => {
    await http.post<ApiResponse<any>>(
        `/users`,
        { regionId }
    );
};

export const getUserInfo = async (): Promise<UserInfo> => {
    const response = await http.get<ApiResponse<UserInfo>>(
        `/users/me`
    );

    return response.data.data;
};

export const updateUserInfo = async (regionId: number): Promise<void> => {
    await http.patch<ApiResponse<any>>(
        `/users`,
        { regionId }
    );
};
