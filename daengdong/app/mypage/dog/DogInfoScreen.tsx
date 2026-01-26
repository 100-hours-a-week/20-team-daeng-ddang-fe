import { Header } from '@/widgets/Header/Header';
import { useSaveDogMutation } from '@/features/dog/api/useSaveDogInfo';
import { useDogInfoQuery } from '@/features/dog/api/useDogInfoQuery';
import { fileApi } from '@/shared/api/file';
import { useToastStore } from '@/shared/stores/useToastStore';
import { DogForm } from '@/features/dog/ui/DogForm';
import { DogFormValues, DogInfo } from '@/entities/dog/model/types';
import styled from '@emotion/styled';
import { spacing } from '@/shared/styles/tokens';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import PawPrintIcon from '@/shared/assets/icons/paw-print.svg';

// DogInfo → DogFormValues 변환
const transformDogInfoToForm = (dogInfo: DogInfo): Partial<DogFormValues> => {
    return {
        name: dogInfo.name,
        breedId: dogInfo.breedId || 0,
        breedName: dogInfo.breed,
        birthDate: dogInfo.birthDate || '',
        isBirthDateUnknown: dogInfo.isBirthDateUnknown,
        weight: dogInfo.weight.toString(),
        gender: dogInfo.gender,
        neutered: dogInfo.neutered,
    };
};

export function DogInfoScreen() {
    const router = useRouter();
    const { showToast } = useToastStore();
    const { data: dogInfo, isLoading } = useDogInfoQuery();
    const saveMutation = useSaveDogMutation();

    const handleSave = async (data: DogFormValues) => {
        let profileImageUrl = undefined;

        try {
            if (data.imageFile) {
                const { presignedUrl, objectKey } = await fileApi.getPresignedUrl("IMAGE", data.imageFile.type, "DOG_PROFILE");
                await fileApi.uploadFile(presignedUrl, data.imageFile, data.imageFile.type);
                profileImageUrl = objectKey;
            }

            const isUpdate = !!dogInfo?.id;

            saveMutation.mutate({
                dogId: dogInfo?.id,
                data: {
                    name: data.name,
                    breedId: data.breedId,
                    birthDate: data.birthDate,
                    weight: parseFloat(data.weight),
                    gender: data.gender,
                    neutered: data.neutered,
                    profileImageUrl: profileImageUrl,
                },
            }, {
                onSuccess: () => {
                    showToast({
                        message: isUpdate ? '강아지 정보가 수정되었습니다.' : '강아지 정보가 등록되었습니다.',
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

    if (isLoading) {
        return (
            <LoadingOverlay>
                <LoadingContainer>
                    <PawContainer>
                        {[0, 1, 2].map((index) => (
                            <PawWrapper
                                key={index}
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 1] }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    delay: index * 0.2,
                                    ease: "easeInOut",
                                    times: [0, 0.2, 0.8]
                                }}
                            >
                                <Image
                                    src={PawPrintIcon}
                                    alt="Loading"
                                    width={32}
                                    height={32}
                                    style={{ width: "100%", height: "100%" }}
                                />
                            </PawWrapper>
                        ))}
                    </PawContainer>
                </LoadingContainer>
            </LoadingOverlay>
        );
    }

    return (
        <Container>
            <Header title="반려견 정보" showBackButton={true} onBack={() => router.back()} />
            <Content>
                <DogForm
                    initialData={dogInfo ? transformDogInfoToForm(dogInfo) : undefined}
                    onSubmit={handleSave}
                    isSubmitting={saveMutation.isPending}
                />
            </Content>
        </Container>
    );
}

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const PawContainer = styled.div`
  display: flex;
  gap: 12px;
  height: 40px;
  align-items: center;
`;

const PawWrapper = styled(motion.div)`
  width: 32px;
  height: 32px;
  
  &:nth-of-type(odd) {
    transform: rotate(-10deg);
  }
  &:nth-of-type(even) {
    transform: rotate(10deg);
  }
`;

const Container = styled.div`
  min-height: 100vh;
  background-color: white;
  display: flex;
  flex-direction: column;
`;

const Content = styled.div`
  flex: 1;
  padding: ${spacing[5]}px;
  padding-bottom: 80px;
`;
