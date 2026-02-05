import { Region, UserInfo, CreateUserParams, UpdateUserParams, UserResponse } from '@/entities/user/model/types';
import { userApi } from './index';
import { userRepository } from './userRepository';

export const getRegions = async (parentId?: number): Promise<Region[]> => {
    return userApi.getRegions(parentId);
};

export const registerUserInfo = async (params: CreateUserParams): Promise<UserResponse> => {
    return userApi.createUser(params);
};

export const getUserInfo = async (): Promise<UserInfo | null> => {
    return userApi.getUserInfo();
};

export const updateUserInfo = async (params: UpdateUserParams): Promise<UserResponse> => {
    return userApi.updateUser(params);
};

export const deleteUser = async (): Promise<void> => {
    return userRepository.deleteUser();
};

export const updateTermsAgreement = async (isAgreed: boolean): Promise<void> => {
    return userRepository.updateTermsAgreement(isAgreed);
};
