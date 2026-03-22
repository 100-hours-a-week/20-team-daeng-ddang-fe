import { create } from 'zustand';
import { getLegacyAccessToken } from '@/shared/lib/auth/legacyToken';

interface AuthState {
    isLoggedIn: boolean;
    isAuthChecked: boolean;
    setLoggedIn: (value: boolean) => void;
    checkLoginStatus: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    isLoggedIn: false,
    isAuthChecked: false,
    setLoggedIn: (value) => set({ isLoggedIn: value, isAuthChecked: true }),
    checkLoginStatus: async () => {
        const useBffAuth = process.env.NEXT_PUBLIC_USE_BFF_AUTH === 'true';

        if (!useBffAuth) {
            const accessToken = getLegacyAccessToken();
            set({ isLoggedIn: !!accessToken, isAuthChecked: true });
            return;
        }

        try {
            const response = await fetch('/bff/auth/session', {
                method: 'GET',
                credentials: 'include',
                cache: 'no-store',
            });

            if (!response.ok) {
                set({ isLoggedIn: false, isAuthChecked: true });
                return;
            }

            const body = (await response.json()) as { authenticated?: boolean };
            set({ isLoggedIn: !!body.authenticated, isAuthChecked: true });
        } catch {
            set({ isLoggedIn: false, isAuthChecked: true });
        }
    }
}));
