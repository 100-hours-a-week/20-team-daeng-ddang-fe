import { useMutation } from '@tanstack/react-query';
import { useUserStore } from '@/entities/user/model/userStore';
import { useAuthStore } from '@/entities/session/model/store';
import { useRouter } from 'next/navigation';
import { deleteUser } from '@/entities/user/api/user';



export const useDeleteUser = () => {
    const router = useRouter();
    const resetUser = useUserStore((state) => state.reset);
    const setLoggedIn = useAuthStore((state) => state.setLoggedIn);

    return useMutation({
        mutationFn: deleteUser,
        onSuccess: () => {
            localStorage.removeItem('accessToken');
            document.cookie = 'refreshToken=; Max-Age=0; path=/;';
            document.cookie = 'isLoggedIn=; Max-Age=0; path=/;';
            resetUser();
            setLoggedIn(false);
            router.replace('/login');
        },
    });
};
