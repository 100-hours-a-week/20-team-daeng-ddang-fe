import { useMutation } from '@tanstack/react-query';
import { useUserStore } from '@/entities/user/model/userStore';
import { useAuthStore } from '@/entities/session/model/store';
import { useRouter } from 'next/navigation';
import { deleteUser } from '@/entities/user/api/user';
import { clearLegacyAccessToken } from '@/shared/lib/auth/legacyToken';



export const useDeleteUser = () => {
    const router = useRouter();
    const resetUser = useUserStore((state) => state.reset);
    const setLoggedIn = useAuthStore((state) => state.setLoggedIn);

    return useMutation({
        mutationFn: deleteUser,
        onSuccess: async () => {
            const useBffAuth = process.env.NEXT_PUBLIC_USE_BFF_AUTH === 'true';
            if (useBffAuth) {
                await fetch('/bff/auth/logout', {
                    method: 'POST',
                    credentials: 'include',
                }).catch(() => undefined);
            } else {
                clearLegacyAccessToken();
            }
            resetUser();
            setLoggedIn(false);
            router.replace('/login');
        },
    });
};
