import { UserInfo, CreateUserParams, UpdateUserParams, UserResponse, Region } from '../model/types';

export interface UserRepository {
    getUserInfo(): Promise<UserInfo | null>;
    createUser(params: CreateUserParams): Promise<UserResponse>;
    updateUser(params: UpdateUserParams): Promise<UserResponse>;
    deleteUser(): Promise<void>;
    getRegions(parentId?: number): Promise<Region[]>;
    updateTermsAgreement(isAgreed: boolean): Promise<void>;
}
