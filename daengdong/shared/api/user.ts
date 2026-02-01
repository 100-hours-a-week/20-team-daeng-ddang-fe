import { http } from './http';
import { ApiResponse } from './types';

/**
 * 약관 동의 요청 데이터
 */
export interface AgreementRequest {
    termsAgreed: boolean;
    privacyAgreed: boolean;
    marketingAgreed: boolean;
}

/**
 * 사용자 정보 응답
 */
export interface UserInfo {
    userId: number;
    agreementsCompleted?: boolean;
    // 필요한 다른 필드들 추가 가능
}

/**
 * 약관 동의 제출
 * POST /users/agreements
 */
export const submitAgreements = async (data: AgreementRequest): Promise<void> => {
    await http.post<ApiResponse<void>>(
        '/users/agreements',
        data,
        {
            withCredentials: true, // refreshToken 쿠키 포함
        }
    );
};

/**
 * 현재 사용자 정보 조회
 * GET /users/me
 */
export const getUserInfo = async (): Promise<UserInfo> => {
    const response = await http.get<ApiResponse<UserInfo>>(
        '/users/me',
        {
            withCredentials: true,
        }
    );

    return response.data.data;
};
