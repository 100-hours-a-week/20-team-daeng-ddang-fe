import { http } from './http';

export interface LoginResponse {
    accessToken: string;
    isNewUser: boolean;
    user: {
        userId: number;
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
            withCredentials: true, // refreshToken을 HttpOnly 쿠키로 받기 위해 필요
        }
    );

    return response.data.data;
};