export interface UserInfo {
    email: string | null;
    province: string | null;
    city: string | null;
}

export interface UserFormValues {
    email: string;
    province: string;
    city: string;
}

export interface SaveUserParams {
    province: string;
    city: string;
}
