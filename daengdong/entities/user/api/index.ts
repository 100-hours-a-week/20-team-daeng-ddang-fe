import { ENV } from '@/shared/config/env';
import { userRepositoryReal } from './user.real';
import { userRepositoryMock } from './user.mock';
import { UserRepository } from './types';

export const userApi: UserRepository = ENV.USE_MOCK ? userRepositoryMock : userRepositoryReal;
