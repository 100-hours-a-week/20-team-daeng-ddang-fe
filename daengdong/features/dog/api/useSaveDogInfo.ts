import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDog, CreateDogParams } from '@/shared/api/dogs';

export const useSaveDogInfo = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateDogParams) => {
            await createDog(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dogInfo'] });
        },
    });
};
