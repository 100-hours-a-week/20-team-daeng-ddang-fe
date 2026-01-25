import axios from 'axios';
import { ApiResponse } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
    throw new Error('API_BASE_URL is not defined');
}

export const http = axios.create({
    baseURL: API_BASE_URL,
});

http.interceptors.request.use(
    (config) => {
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
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
);

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

http.interceptors.response.use(
    (response) => {
        console.log('✅ API Response:', {
            status: response.status,
            statusText: response.statusText,
            url: response.config.url,
            data: response.data,
        });
        return response;
    },
    async (error) => {
        // CORS 에러 등 상세 로깅
        console.error('❌ API Error:', {
            message: error.message,
            code: error.code,
            status: error.response?.status,
            statusText: error.response?.statusText,
            url: error.config?.url,
            method: error.config?.method,
            data: error.response?.data,
            // CORS 에러인 경우
            isCorsError: error.message.includes('CORS') || error.message.includes('Network Error'),
        });

        // 401 Unauthorized 에러 처리 (토큰 만료)
        if (error.response && error.response.status === 401) {
            const originalRequest = error.config;

            // 이미 재시도한 요청이거나, 토큰 갱신 요청 자체가 실패한 경우
            if (originalRequest._retry || originalRequest.url === '/auth/token') {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('accessToken');
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }

            // 토큰 갱신 중인 경우 큐에 담아 대기
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return http(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // 토큰 갱신 요청 
                const { data } = await http.post<ApiResponse<{ accessToken: string }>>('/auth/token');
                const newAccessToken = data.data.accessToken;

                localStorage.setItem('accessToken', newAccessToken);

                // 헤더 업데이트 및 재요청
                http.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                // 대기 중인 요청 처리
                processQueue(null, newAccessToken);

                return http(originalRequest);
            } catch (refreshError) {
                // 갱신 실패 시 로그아웃 처리
                processQueue(refreshError, null);
                if (typeof window !== 'undefined') {
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
