import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDog, updateDog } from '@/entities/dog/api/dog';
import { CreateDogParams, UpdateDogParams } from '@/entities/dog/model/types';

interface SaveDogParams {
    dogId?: number;
    data: CreateDogParams | UpdateDogParams;
}

export const useSaveDogMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ dogId, data }: SaveDogParams) => {
            if (dogId) {
                // 수정: PATCH
                return await updateDog(data as UpdateDogParams);
            } else {
                // 등록: POST
                return await createDog(data as CreateDogParams);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dogInfo'] });
            queryClient.invalidateQueries({ queryKey: ['myPageSummary'] });
        },
    });
};
