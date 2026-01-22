import { MyPageSummary } from '../model/types';
import { MyPageRepository } from './types';

const mockMyPageData: MyPageSummary = {
    dogId: 1,
    dogName: "초코",
    point: 53,
    totalWalkCount: 24,
    totalWalkDistanceKm: 12.3,
};

export const myPageRepositoryMock: MyPageRepository = {
    async getMyPageSummary(): Promise<MyPageSummary> {
        await new Promise(resolve => setTimeout(resolve, 500));
        return { ...mockMyPageData };
    },
};
