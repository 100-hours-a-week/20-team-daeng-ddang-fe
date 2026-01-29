import { ENV } from '@/shared/config/env';
import { dogRepositoryReal } from './dog.real';
import { dogRepositoryMock } from './dog.mock';
import { DogRepository } from './types';

export const dogApi: DogRepository = ENV.USE_MOCK ? dogRepositoryMock : dogRepositoryReal;
