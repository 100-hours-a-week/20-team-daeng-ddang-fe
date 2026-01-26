import { create } from 'zustand';

interface AuthState {
    isLoggedIn: boolean;
    setLoggedIn: (value: boolean) => void;
    checkLoginStatus: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    isLoggedIn: false,
    setLoggedIn: (value) => set({ isLoggedIn: value }),
    checkLoginStatus: () => {
        const hasToken = typeof window !== 'undefined' ? !!localStorage.getItem('accessToken') : false;
        const hasCookie = typeof document !== 'undefined' ? document.cookie.includes('isLoggedIn=true') : false;
        set({ isLoggedIn: hasToken && hasCookie });
    }
}));
