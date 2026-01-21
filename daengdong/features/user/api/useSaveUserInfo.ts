import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserStore } from '@/shared/stores/userStore';
import { registerUserInfo } from '@/entities/user/api/user';

export const useSaveUserInfo = (isNewUser: boolean) => {
    const queryClient = useQueryClient();
    const setUserInfo = useUserStore((state) => state.setUserInfo);

    return useMutation({
        mutationFn: async (params: { regionId: number; province?: string; city?: string }) => {
            if (isNewUser) {
                await registerUserInfo(params.regionId);
                return { province: params.province, city: params.city };
            } else {
                throw new Error("Update not implemented yet");
            }
        },
        onSuccess: (newData) => {
            if (newData.province && newData.city) {
                setUserInfo({ province: newData.province, city: newData.city });
            }

            queryClient.invalidateQueries({ queryKey: ['userInfo'] });
        },
    });
};
