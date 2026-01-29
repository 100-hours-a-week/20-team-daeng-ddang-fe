import { ENV } from '@/shared/config/env';
import { myPageRepositoryReal } from './mypage.real';
import { myPageRepositoryMock } from './mypage.mock';
import { MyPageRepository } from './types';

export const myPageApi: MyPageRepository = ENV.USE_MOCK ? myPageRepositoryMock : myPageRepositoryReal;
