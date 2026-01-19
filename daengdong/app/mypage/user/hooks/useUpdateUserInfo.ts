import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserStore } from '@/shared/stores/userStore';

interface UpdateUserParams {
    province: string;
    city: string;
}

// Mock API Call
const updateUserInfo = async (params: UpdateUserParams): Promise<UpdateUserParams> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    // In real app, this would patch /api/v3/me/user
    // For mock, simply return what was sent
    return params;
};

export const useUpdateUserInfo = () => {
    const queryClient = useQueryClient();
    const setUserInfo = useUserStore((state) => state.setUserInfo);

    return useMutation({
        mutationFn: updateUserInfo,
        onSuccess: (newData) => {
            // 1. Update global store
            setUserInfo(newData);

            // 2. Invalidate query to refetch (or optimistically update, but refetch is safer for now)
            queryClient.invalidateQueries({ queryKey: ['userInfo'] });
        },
    });
};
