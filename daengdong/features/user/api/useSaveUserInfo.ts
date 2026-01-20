import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserStore } from '@/shared/stores/userStore';
import { registerUserInfo } from '@/shared/api/user';
import { SaveUserParams } from '@/entities/user/model/types';

export const useSaveUserInfo = (isNewUser: boolean) => {
    const queryClient = useQueryClient();
    const setUserInfo = useUserStore((state) => state.setUserInfo);

    return useMutation({
        mutationFn: async (params: { regionId: number; province?: string; city?: string }) => {
            if (isNewUser) {
                await registerUserInfo(params.regionId);
                // Return params to update local state optimistically or effectively
                // Note: The UI currently expects { province, city } for local store update, 
                // but backend only needs regionId. We pass province/city for UI update.
                return { province: params.province, city: params.city };
            } else {
                // TODO: Implement PATCH if needed, for now focusing on Registration (POST)
                // If PATCH API is different, implement it in shared/api/user.ts
                throw new Error("Update not implemented yet");
            }
        },
        onSuccess: (newData) => {
            // 1. Update global store
            if (newData.province && newData.city) {
                setUserInfo({ province: newData.province, city: newData.city });
            }

            // 2. Invalidate query to refetch
            queryClient.invalidateQueries({ queryKey: ['userInfo'] });
        },
    });
};
