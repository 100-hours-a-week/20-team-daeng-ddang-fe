import { MyPageSummary } from '@/entities/mypage/model/types';
import { myPageApi } from './index';

export const getMyPageSummary = async (): Promise<MyPageSummary> => {
    return myPageApi.getMyPageSummary();
};
