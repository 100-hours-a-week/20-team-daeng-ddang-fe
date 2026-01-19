import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserStore } from '@/shared/stores/userStore';
import { SaveUserParams } from '@/entities/user/model/types';

// Mock API Calls
const postUserInfo = async (params: SaveUserParams): Promise<SaveUserParams> => {
    console.log('[API] POST /api/v3/me/user', params);
    await new Promise((resolve) => setTimeout(resolve, 800));
    return params;
};

const patchUserInfo = async (params: SaveUserParams): Promise<SaveUserParams> => {
    console.log('[API] PATCH /api/v3/me/user', params);
    await new Promise((resolve) => setTimeout(resolve, 800));
    return params;
};

export const useSaveUserInfo = (isNewUser: boolean) => {
    const queryClient = useQueryClient();
    const setUserInfo = useUserStore((state) => state.setUserInfo);

    return useMutation({
        mutationFn: isNewUser ? postUserInfo : patchUserInfo,
        onSuccess: (newData) => {
            // 1. Update global store
            setUserInfo(newData);

            // 2. Invalidate query to refetch
            queryClient.invalidateQueries({ queryKey: ['userInfo'] });
        },
    });
};
