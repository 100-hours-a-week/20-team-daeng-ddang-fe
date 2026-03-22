import { http } from "@/shared/api/http";
import { clearLegacyAccessToken, setLegacyAccessToken } from "@/shared/lib/auth/legacyToken";

export interface LoginResponse {
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

interface LegacyTokenPayload {
    accessToken?: string;
}

export const kakaoLogin = async (code: string): Promise<LoginResponse> => {
    const useBffAuth = process.env.NEXT_PUBLIC_USE_BFF_AUTH === 'true';

    if (useBffAuth) {
        const res = await fetch("/bff/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
            credentials: "include",
        });

        if (!res.ok) {
            throw new Error("Login failed");
        }

        const body = (await res.json()) as ApiResponse<LoginResponse>;
        return body.data;
    }

    const response = await http.post<ApiResponse<LoginResponse & LegacyTokenPayload>>(
        `/auth/login`,
        { code },
        {
            withCredentials: true,
        }
    );

    const accessToken = response.data.data.accessToken;
    if (accessToken) {
        setLegacyAccessToken(accessToken);
    } else {
        clearLegacyAccessToken();
    }

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
    isNewUser: boolean;
    user: {
        userId: number;
    };
}

export const devLogin = async (data: DevLoginRequest): Promise<DevLoginResponse> => {
    const useBffAuth = process.env.NEXT_PUBLIC_USE_BFF_AUTH === 'true';

    if (useBffAuth) {
        const res = await fetch("/bff/auth/dev-login", {
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

    const response = await http.post<ApiResponse<DevLoginResponse & LegacyTokenPayload>>(
        "/auth/dev/login",
        data,
        { withCredentials: true }
    );

    const accessToken = response.data.data.accessToken;
    if (accessToken) {
        setLegacyAccessToken(accessToken);
    } else {
        clearLegacyAccessToken();
    }

    return response.data.data;
};
