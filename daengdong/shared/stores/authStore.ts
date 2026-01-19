import { create } from 'zustand';

interface TokenInfo {
    accessToken: string;
    refreshToken: string;
}

interface AuthState {
    accessToken: string | null;
    refreshToken: string | null;
    isLoggedIn: boolean;
    setAuth: (tokenInfo: TokenInfo) => void;
    reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    accessToken: null,
    refreshToken: null,
    isLoggedIn: false,
    setAuth: (tokenInfo) =>
        set({
            accessToken: tokenInfo.accessToken,
            refreshToken: tokenInfo.refreshToken,
            isLoggedIn: true,
        }),
    reset: () =>
        set({
            accessToken: null,
            refreshToken: null,
            isLoggedIn: false,
        }),
}));
