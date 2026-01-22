import { MyPageSummary } from '../model/types';

export interface MyPageRepository {
    getMyPageSummary(): Promise<MyPageSummary>;
}
