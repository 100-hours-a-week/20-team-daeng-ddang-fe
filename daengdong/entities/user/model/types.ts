export interface UserFormValues {
    province: string;
    city: string;
}

export interface SaveUserParams {
    province: string;
    city: string;
}

export interface Region {
    regionId: number;
    name: string;
    level: 'CITY' | 'DISTRICT';
    parentRegionId?: number;
}

export interface UserInfo {
    userId: number;
    regionId: number;
    parentRegionId: number;
    region?: string; // "경기도 성남시"
}