import axios from 'axios';

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getRegions = async (parentId?: number): Promise<Region[]> => {
    if (!API_BASE_URL) {
        throw new Error('API_BASE_URL is not defined');
    }

    const params = parentId ? { parentId } : {};

    // According to API docs: 
    // - parentId not provided -> Top level (City/Do)
    // - parentId provided -> Sub level (District/Gu)

    const response = await axios.get<ApiResponse<RegionsResponse>>(
        `${API_BASE_URL}/users/regions`,
        { params }
    );

    return response.data.data.regions;
};

export const registerUserInfo = async (regionId: number): Promise<void> => {
    if (!API_BASE_URL) {
        throw new Error('API_BASE_URL is not defined');
    }

    await axios.post<ApiResponse<any>>(
        `${API_BASE_URL}/users`,
        { regionId }
    );
};

export interface UserInfo {
    userId: number;
    region?: string; // "경기도 성남시"
}

export const getUserInfo = async (): Promise<UserInfo> => {
    if (!API_BASE_URL) {
        throw new Error('API_BASE_URL is not defined');
    }

    const response = await axios.get<ApiResponse<UserInfo>>(
        `${API_BASE_URL}/users`
    );

    return response.data.data;
};

export const updateUserInfo = async (regionId: number): Promise<void> => {
    if (!API_BASE_URL) {
        throw new Error('API_BASE_URL is not defined');
    }

    await axios.patch<ApiResponse<any>>(
        `${API_BASE_URL}/users`,
        { regionId }
    );
};
