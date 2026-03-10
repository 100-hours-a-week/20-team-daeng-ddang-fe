import { http } from "@/shared/api/http";

export interface LoginResponse {
    accessToken: string;
    isNewUser: boolean;
    user: {
        userId: number;
        isAgreed: boolean;
        kakaoEmail?: string;
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
 * 로컬 및 feature 브랜치에서 Kakao OAuth 없이 로그인 테스트
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

const parseBooleanEnv = (value: string | undefined): boolean | null => {
    if (value == null) return null;
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
    return null;
};

export const devLogin = async (data: DevLoginRequest): Promise<DevLoginResponse> => {
    const useBffAuth = parseBooleanEnv(process.env.NEXT_PUBLIC_USE_BFF_AUTH);

    if (useBffAuth) {
        const res = await fetch("/api/auth/dev-login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
            credentials: "include",
        });

        if (!res.ok) {
            throw new Error("Dev login failed");
        }

        const body = (await res.json()) as ApiResponse<DevLoginResponse>;
        return body.data;
    }

    const response = await http.post<ApiResponse<DevLoginResponse>>(
        "/auth/dev/login",
        data,
        { withCredentials: true }
    );
    return response.data.data;
};
