import { useMutation, useQueryClient } from '@tanstack/react-query';
import { registerUserInfo, updateUserInfo } from '@/entities/user/api/user';
import { CreateUserParams, UpdateUserParams } from '@/entities/user/model/types';

import { queryKeys } from '@/shared/api/queryKeys';

interface SaveUserMutationParams {
    userId?: number;
    regionId: number;
}

export const useSaveUserMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ userId, regionId }: SaveUserMutationParams) => {
            if (userId) {
                // 수정: PATCH
                const params: UpdateUserParams = { regionId };
                return await updateUserInfo(params);
            } else {
                // 등록: POST
                const params: CreateUserParams = { regionId };
                return await registerUserInfo(params);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [queryKeys.userInfo] });
            queryClient.invalidateQueries({ queryKey: queryKeys.userInfoCombined });
        },
    });
};
