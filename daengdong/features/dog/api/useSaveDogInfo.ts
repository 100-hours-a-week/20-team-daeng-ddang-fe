import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDog } from '@/entities/dog/api/dog';
import { CreateDogParams } from '@/entities/dog/model/types';

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
