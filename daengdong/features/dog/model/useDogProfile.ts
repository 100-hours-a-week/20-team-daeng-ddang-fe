import { useSaveDogMutation } from '@/features/dog/api/useSaveDogInfo';
import fileApi from '@/shared/api/file';
import { useToastStore } from '@/shared/stores/useToastStore';
import { DogFormValues, DogInfo } from '@/entities/dog/model/types';

export const useDogProfile = () => {
    const { showToast } = useToastStore();
    const saveMutation = useSaveDogMutation();

    const transformDogInfoToForm = (dogInfo: DogInfo): Partial<DogFormValues> => {
        const GENDER_MAP = {
            수컷: 'MALE',
            암컷: 'FEMALE',
            MALE: 'MALE',
            FEMALE: 'FEMALE',
        } as const;

        const gender =
            typeof dogInfo.gender === 'string'
                ? GENDER_MAP[dogInfo.gender as keyof typeof GENDER_MAP]
                : undefined;

        return {
            name: dogInfo.name,
            breedId: dogInfo.breedId || 0,
            breedName: dogInfo.breed,
            birthDate: dogInfo.birthDate || '',
            isBirthDateUnknown: dogInfo.isBirthDateUnknown,
            weight: dogInfo.weight.toString(),
            gender: gender,
            neutered: dogInfo.neutered,
        };
    };

    const saveDogProfile = async (data: DogFormValues, currentDogInfo?: DogInfo | null) => {
        let profileImageUrl: string | null | undefined = currentDogInfo?.imageUrl ?? undefined;

        try {
            if (data.imageFile) {
                const { presignedUrl, objectKey } = await fileApi.getPresignedUrl("IMAGE", data.imageFile.type, "PROFILE");
                await fileApi.uploadFile(presignedUrl, data.imageFile, data.imageFile.type);
                profileImageUrl = objectKey;
            } else if (data.isImageDeleted) {
                profileImageUrl = null;
            }

            const isUpdate = !!currentDogInfo?.id;

            saveMutation.mutate({
                dogId: currentDogInfo?.id,
                data: {
                    name: data.name,
                    breedId: data.breedId,
                    birthDate: data.birthDate,
                    isBirthUnknown: data.isBirthDateUnknown,
                    weight: parseFloat(data.weight),
                    gender: data.gender,
                    isNeutered: data.neutered,
                    profileImageUrl: profileImageUrl,
                },
            }, {
                onSuccess: () => {
                    showToast({
                        message: isUpdate ? '반려견 정보가 수정되었습니다!' : '반려견 정보가 등록되었습니다!',
                        type: 'success'
                    });
                },
                onError: () => {
                    showToast({
                        message: isUpdate ? '수정에 실패했습니다.' : '등록에 실패했습니다.',
                        type: 'error'
                    });
                },
            });
        } catch (error) {
            console.error('강아지 정보 저장 실패:', error);
            showToast({ message: '이미지 업로드 또는 저장에 실패했습니다.', type: 'error' });
        }
    };

    return {
        saveDogProfile,
        transformDogInfoToForm,
        isSaving: saveMutation.isPending
    };
};
