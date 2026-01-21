import { useMutation } from '@tanstack/react-query';
import { useUserStore } from '@/entities/user/model/userStore';
import { useAuthStore } from '@/entities/session/model/store';
import { useRouter } from 'next/navigation';

// Mock API 요청
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
            document.cookie = 'accessToken=; Max-Age=0; path=/;';
            resetUser();
            setLoggedIn(false);
            router.replace('/login');
        },
    });
};
