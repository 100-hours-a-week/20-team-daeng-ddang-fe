import { useMutation } from '@tanstack/react-query';
import { useUserStore } from '@/shared/stores/userStore';
import { useAuthStore } from '@/shared/stores/authStore';
import { useRouter } from 'next/navigation';

// Mock API Call
const deleteUser = async (): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
};

export const useDeleteUser = () => {
    const router = useRouter();
    const resetUser = useUserStore((state) => state.reset);
    const setLoggedIn = useAuthStore((state) => state.setLoggedIn);

    return useMutation({
        mutationFn: deleteUser,
        onSuccess: () => {
            // 1. Clear cookie (Client-side)
            document.cookie = 'accessToken=; Max-Age=0; path=/;';

            // 2. Reset stores
            resetUser();
            setLoggedIn(false);

            // 3. Redirect to login
            router.replace('/login');
        },
    });
};
