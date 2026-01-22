export interface UserFormValues {
    province: string;
    city: string;
}

export interface CreateUserParams {
    regionId: number;
}

export interface UpdateUserParams {
    regionId: number;
}

export interface Region {
    regionId: number;
    name: string;
    level: 'CITY' | 'DISTRICT';
    parentRegionId?: number;
}

export interface UserResponse {
    userId: number;
    regionId: number;
    parentRegionId?: number;
    region: string; // "경기도 성남시"
    kakaoEmail: string;
}

export interface UserInfo {
    userId: number;
    regionId: number;
    parentRegionId?: number;
    region: string; // "경기도 성남시"
    kakaoEmail: string;
}