import { create } from 'zustand';

interface UserInfo {
    email: string | null;
    province: string | null;
    city: string | null;
}

interface UserState extends UserInfo {
    setUserInfo: (info: Partial<UserInfo>) => void;
    reset: () => void;
}

const initialState: UserInfo = {
    email: null,
    province: null,
    city: null,
};

export const useUserStore = create<UserState>((set) => ({
    ...initialState,
    setUserInfo: (info) => set((state) => ({ ...state, ...info })),
    reset: () => set(initialState),
}));
