import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DogFormValues } from '@/entities/dog/model/types';

// Mock API Call
const saveDogInfo = async (data: DogFormValues): Promise<void> => {
    console.log('[API] Saving Dog Info:', data);
    if (data.imageFile) {
        console.log('[API] Uploading Image:', data.imageFile.name);
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));
};

export const useSaveDogInfo = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: saveDogInfo,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dogInfo'] });
        },
    });
};
