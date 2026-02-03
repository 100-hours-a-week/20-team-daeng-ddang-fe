import { http } from './http';

export interface LoginResponse {
    accessToken: string;
    isNewUser: boolean;
    user: {
        userId: number;
        isAgreed: boolean;
    };
}

interface ApiResponse<T> {
    message: string;
    data: T;
    errorCode: string | null;
}

export const kakaoLogin = async (code: string): Promise<LoginResponse> => {
    const response = await http.post<ApiResponse<LoginResponse>>(
        `/auth/login`,
        { code },
        {
            withCredentials: true,
        }
    );

    return response.data.data;
};

/**
 * Dev Login 
 * 로컬 및 피처 브랜치에서 Kakao OAuth 없이 로그인 테스트
 */
export interface DevLoginRequest {
    kakaoUserId: number;
    nickname: string;
    prefix: string;
}

export interface DevLoginResponse {
    accessToken: string;
    isNewUser: boolean;
    user: {
        userId: number;
    };
}

export const devLogin = async (data: DevLoginRequest): Promise<DevLoginResponse> => {
    const response = await http.post<ApiResponse<DevLoginResponse>>(
        '/auth/dev/login',
        data,
        {
            withCredentials: true,
        }
    );

    return response.data.data;
};