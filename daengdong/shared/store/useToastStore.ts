import { create } from 'zustand';

interface ToastOptions {
    message: string;
    type?: "success" | "error" | "info";
    duration?: number;
}

interface ToastStore {
    isOpen: boolean;
    options: ToastOptions | null;
    showToast: (options: ToastOptions) => void;
    hideToast: () => void;
}

export const useToastStore = create<ToastStore>((set) => ({
    isOpen: false,
    options: null,
    showToast: (options) => {
        set({ isOpen: true, options });
        if (options.duration !== Infinity) {
            setTimeout(() => {
                set({ isOpen: false, options: null });
            }, options.duration || 3000);
        }
    },
    hideToast: () => set({ isOpen: false, options: null }),
}));
