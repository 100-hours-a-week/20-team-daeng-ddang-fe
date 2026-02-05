import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDog, updateDog } from '@/entities/dog/api/dog';
import { CreateDogParams, UpdateDogParams } from '@/entities/dog/model/types';

import { queryKeys } from '@/shared/api/queryKeys';

interface SaveDogParams {
    dogId?: number;
    data: CreateDogParams | UpdateDogParams;
}

export const useSaveDogMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ dogId, data }: SaveDogParams) => {
            if (dogId) {
                return await updateDog(data as UpdateDogParams);
            } else {
                return await createDog(data as CreateDogParams);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [queryKeys.dogInfo] });
            queryClient.invalidateQueries({ queryKey: [queryKeys.myPageSummary] });
            queryClient.invalidateQueries({ queryKey: queryKeys.userInfoCombined });
        },
    });
};
