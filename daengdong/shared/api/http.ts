import axios, { AxiosError, AxiosResponse } from 'axios';
import { clearLegacyAccessToken, getLegacyAccessToken } from '@/shared/lib/auth/legacyToken';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const USE_BFF_AUTH = process.env.NEXT_PUBLIC_USE_BFF_AUTH === 'true';
const RESOLVED_BASE_URL = USE_BFF_AUTH ? '/bff/proxy' : API_BASE_URL;

if (!RESOLVED_BASE_URL) {
    throw new Error('API_BASE_URL is not defined');
}

// 일반 API 요청용 인스턴스
export const http = axios.create({
    baseURL: RESOLVED_BASE_URL,
    timeout: 30000, 
    withCredentials: true,
});

http.interceptors.request.use((config) => {
    if (!USE_BFF_AUTH) {
        const token = getLegacyAccessToken();
        if (token) {
            config.headers.set('Authorization', `Bearer ${token}`);
        } else {
            config.headers.delete('Authorization');
        }
    }
    return config;
});

http.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    async (error: AxiosError) => {
        // 403 Forbidden 에러 처리 (권한 없음)
        if (error.response && error.response.status === 403) {
            if (typeof window !== 'undefined') {
                window.location.href = '/403';
            }
            return Promise.reject(error);
        }

        // 404 Not Found 에러 처리 (페이지 없음)
        if (error.response && error.response.status === 404) {
            const originalRequest = error.config;

            const isAnalysisApi = originalRequest?.url?.includes('/missions/analysis') || originalRequest?.url?.includes('/expressions/analysis');

            if (typeof window !== 'undefined' && !isAnalysisApi) {
                window.location.href = '/404';
            }
            return Promise.reject(error);
        }

        // 401 Unauthorized 에러 처리 (토큰 만료)
        if (error.response && error.response.status === 401) {
            if (typeof window !== 'undefined') {
                if (!USE_BFF_AUTH) {
                    clearLegacyAccessToken();
                    window.location.href = '/login';
                } else {
                    try {
                        const sessionResponse = await fetch('/bff/auth/session', {
                            method: 'GET',
                            credentials: 'include',
                            cache: 'no-store',
                        });
                        const sessionBody = (await sessionResponse.json()) as { authenticated?: boolean };

                        if (!sessionBody.authenticated) {
                            window.location.href = '/login';
                        }
                    } catch {
                        window.location.href = '/login';
                    }
                }
            }
            return Promise.reject(error);
        }
        return Promise.reject(error);
    }
);
