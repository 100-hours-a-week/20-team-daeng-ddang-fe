import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDog, updateDog, CreateDogParams } from '@/shared/api/dogs';

export const useSaveDogInfo = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (params: { isEditMode: boolean; data: CreateDogParams }) => {
            if (params.isEditMode) {
                return await updateDog(params.data);
            } else {
                return await createDog(params.data);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dogInfo'] });
        },
    });
};
