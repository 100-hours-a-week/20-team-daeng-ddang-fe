import { http } from './http';

export interface Region {
    regionId: number;
    name: string;
    level: 'CITY' | 'DISTRICT';
    parentRegionId?: number;
}

interface RegionsResponse {
    regions: Region[];
}

interface ApiResponse<T> {
    message: string;
    data: T;
    errorCode: string | null;
}

export const getRegions = async (parentId?: number): Promise<Region[]> => {
    const params = parentId ? { parentId } : {};

    // According to API docs: 
    // - parentId not provided -> Top level (City/Do)
    // - parentId provided -> Sub level (District/Gu)

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

export interface UserInfo {
    userId: number;
    region?: string; // "경기도 성남시"
}

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
