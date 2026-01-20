// shared/api/auth.ts
import axios from 'axios';

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const kakaoLogin = async (code: string): Promise<LoginResponse> => {
    if (!API_BASE_URL) {
        throw new Error('API_BASE_URL is not defined');
    }

    const response = await axios.post<ApiResponse<LoginResponse>>(
        `${API_BASE_URL}/auth/login`,
        { code }
    );

    return response.data.data;
};