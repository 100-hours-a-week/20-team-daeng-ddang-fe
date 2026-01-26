import axios, { InternalAxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';
import { ApiResponse } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
    throw new Error('API_BASE_URL is not defined');
}

// 1. 일반 API 요청용 인스턴스
export const http = axios.create({
    baseURL: API_BASE_URL,
});

// 2. 토큰 갱신 전용 인스턴스 (인터셉터 무한 루프 방지용)
const tokenHttp = axios.create({
    baseURL: API_BASE_URL,
});

// Axios Request Config 확장 타입 정의
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

http.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // 요청 데이터 로깅 (CORS로 인해 Network 탭에서 안 보일 때 유용)
        console.log('🚀 API Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            baseURL: config.baseURL,
            fullURL: `${config.baseURL}${config.url}`,
            headers: config.headers,
            data: config.data,
            params: config.params,
        });

        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('accessToken');

            // 토큰 갱신 요청에는 만료된 액세스 토큰을 보내지 않음 (401 유발 방지)
            if (token && config.url !== '/auth/token') {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error: AxiosError) => {
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
);

interface FailedRequest {
    resolve: (value: string | PromiseLike<string>) => void;
    reject: (reason?: unknown) => void;
}

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            if (token) prom.resolve(token);
        }
    });

    failedQueue = [];
};

http.interceptors.response.use(
    (response: AxiosResponse) => {
        console.log('✅ API Response:', {
            status: response.status,
            statusText: response.statusText,
            url: response.config.url,
            data: response.data,
        });
        return response;
    },
    async (error: AxiosError) => {
        // CORS 에러 등 상세 로깅
        if (error.code) {
            console.error('❌ API Error Info:', {
                message: error.message,
                code: error.code,
                status: error.response?.status,
                url: error.config?.url,
            });
        }

        // 401 Unauthorized 에러 처리 (토큰 만료)
        if (error.response && error.response.status === 401) {
            const originalRequest = error.config as CustomAxiosRequestConfig;

            if (!originalRequest) {
                return Promise.reject(error);
            }

            // _retry 속성이 있는지 확인 (이미 재시도한 요청인지)
            if (originalRequest._retry || originalRequest.url === '/auth/token') {
                if (typeof window !== 'undefined') {
                    console.warn("🚨 Reuse of expired token detected. Forcing logout.");
                    localStorage.removeItem('accessToken');
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }

            // 토큰 갱신 중인 경우 큐에 담아 대기
            if (isRefreshing) {
                return new Promise<string>((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                        }
                        originalRequest._retry = true;
                        return http(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // 토큰 갱신 요청 - 별도 인스턴스 사용
                const { data } = await tokenHttp.post<ApiResponse<{ accessToken: string }>>('/auth/token');
                const newAccessToken = data.data.accessToken;

                localStorage.setItem('accessToken', newAccessToken);

                // 헤더 업데이트 및 재요청
                http.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                }

                // 대기 중인 요청 처리
                processQueue(null, newAccessToken);

                // 재요청 시 _retry 속성 포함하여 실행
                return http(originalRequest);
            } catch (refreshError) {
                // 갱신 실패 시 로그아웃 처리
                processQueue(refreshError, null);
                if (typeof window !== 'undefined') {
                    console.error("❌ Token Refresh Failed. Logging out.");
                    localStorage.removeItem('accessToken');
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);
