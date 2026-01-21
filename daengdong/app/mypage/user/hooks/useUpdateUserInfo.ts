import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserStore } from '@/shared/stores/userStore';

interface UpdateUserParams {
    province: string;
    city: string;
}

// Mock API 요청
const updateUserInfo = async (params: UpdateUserParams): Promise<UpdateUserParams> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return params;
};

export const useUpdateUserInfo = () => {
    const queryClient = useQueryClient();
    const setUserInfo = useUserStore((state) => state.setUserInfo);

    return useMutation({
        mutationFn: updateUserInfo,
        onSuccess: (newData) => {
            setUserInfo(newData);
            queryClient.invalidateQueries({ queryKey: ['userInfo'] });
        },
    });
};
