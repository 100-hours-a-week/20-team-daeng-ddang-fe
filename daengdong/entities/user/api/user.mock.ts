import { UserInfo, UserResponse, CreateUserParams, UpdateUserParams, Region } from '../model/types';
import { UserRepository } from './types';

const mockUserData: UserInfo = {
    userId: 1,
    regionId: 101,
    parentRegionId: 1,
    region: "경기도 성남시",
    kakaoEmail: "user@kakao.com",
    dogId: 1,
    profileImageUrl: "https://daeng-dong-map.s3.ap-northeast-2.amazonaws.com/profile/mock-user.png",
};

const mockRegions: Region[] = [
    // 시/도 (parentId 없음)
    { regionId: 1, name: "경기도", level: "CITY" },
    { regionId: 2, name: "서울특별시", level: "CITY" },
    { regionId: 3, name: "부산광역시", level: "CITY" },

    // 경기도 하위 시/군/구
    { regionId: 101, name: "성남시", level: "DISTRICT", parentRegionId: 1 },
    { regionId: 102, name: "수원시", level: "DISTRICT", parentRegionId: 1 },
    { regionId: 103, name: "용인시", level: "DISTRICT", parentRegionId: 1 },

    // 서울 하위 구
    { regionId: 201, name: "강남구", level: "DISTRICT", parentRegionId: 2 },
    { regionId: 202, name: "서초구", level: "DISTRICT", parentRegionId: 2 },
    { regionId: 203, name: "송파구", level: "DISTRICT", parentRegionId: 2 },

    // 부산 하위 구
    { regionId: 301, name: "해운대구", level: "DISTRICT", parentRegionId: 3 },
    { regionId: 302, name: "부산진구", level: "DISTRICT", parentRegionId: 3 },
];

let hasUserData = true; // Mock 상태: true면 데이터 있음, false면 없음

export const userRepositoryMock: UserRepository = {
    async getUserInfo(): Promise<UserInfo | null> {
        await new Promise(resolve => setTimeout(resolve, 500));

        if (!hasUserData) {
            return null;
        }

        return { ...mockUserData };
    },

    async createUser(params: CreateUserParams): Promise<UserResponse> {
        await new Promise(resolve => setTimeout(resolve, 800));

        const region = mockRegions.find(r => r.regionId === params.regionId);
        const parentRegion = region?.parentRegionId
            ? mockRegions.find(r => r.regionId === region.parentRegionId)
            : undefined;

        const newUser: UserResponse = {
            userId: 1,
            regionId: params.regionId,
            parentRegionId: region?.parentRegionId,
            region: parentRegion ? `${parentRegion.name} ${region?.name}` : region?.name || "",
            kakaoEmail: mockUserData.kakaoEmail,
        };

        // Mock 상태 업데이트
        hasUserData = true;
        Object.assign(mockUserData, newUser);

        return newUser;
    },

    async updateUser(params: UpdateUserParams): Promise<UserResponse> {
        await new Promise(resolve => setTimeout(resolve, 800));

        const region = mockRegions.find(r => r.regionId === params.regionId);
        const parentRegion = region?.parentRegionId
            ? mockRegions.find(r => r.regionId === region.parentRegionId)
            : undefined;

        const updatedUser: UserResponse = {
            userId: mockUserData.userId,
            regionId: params.regionId,
            parentRegionId: region?.parentRegionId,
            region: parentRegion ? `${parentRegion.name} ${region?.name}` : region?.name || "",
            kakaoEmail: mockUserData.kakaoEmail,
        };

        // Mock 상태 업데이트
        Object.assign(mockUserData, updatedUser);

        return updatedUser;
    },

    async deleteUser(): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 800));
        hasUserData = false;
    },

    async getRegions(parentId?: number): Promise<Region[]> {
        await new Promise(resolve => setTimeout(resolve, 300));

        if (parentId) {
            // 하위 지역 조회
            return mockRegions.filter(r => r.parentRegionId === parentId);
        } else {
            // 최상위 지역 조회 (시/도)
            return mockRegions.filter(r => !r.parentRegionId);
        }
    },
};
