export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
}

// Placeholder for actual API call
export const kakaoLogin = async (code: string): Promise<LoginResponse> => {
    // In a real app, this would be an axios/fetch call
    console.log('Mocking Kakao login with code:', code);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Return mock tokens
    return {
        accessToken: "mock_access_token_" + code.substring(0, 5),
        refreshToken: "mock_refresh_token_" + code.substring(0, 5)
    };
};
