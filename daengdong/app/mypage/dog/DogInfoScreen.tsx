import { Header } from '@/widgets/Header/Header';
import { GlobalLoading } from '@/widgets/Loading/GlobalLoading';
import { useDogInfoQuery } from '@/features/dog/api/useDogInfoQuery';
import { useSaveDogInfo } from '@/features/dog/api/useSaveDogInfo';
import { uploadImage } from '@/shared/api/files';
import { useToastStore } from '@/shared/store/useToastStore';
import { DogForm } from './components/DogForm';
import { DogFormValues } from '@/entities/dog/model/types';
import styled from '@emotion/styled';
import { spacing } from '@/shared/styles/tokens';
import { useRouter } from 'next/navigation';

export function DogInfoScreen() {
    const router = useRouter();
    const { showToast } = useToastStore();
    // const { data: dogInfo, isLoading: isQueryLoading } = useDogInfoQuery(); // Disabled for Create-Only Mode
    const saveMutation = useSaveDogInfo();

    const handleSave = async (data: DogFormValues) => {
        let profileImageUrl = undefined;

        try {
            if (data.imageFile) {
                // Upload new image
                profileImageUrl = await uploadImage(data.imageFile);
            }

            saveMutation.mutate({
                name: data.name,
                breedId: data.breedId,
                birthDate: data.birthDate,
                weight: parseFloat(data.weight),
                gender: data.gender,
                isNeutered: data.isNeutered,
                profileImageUrl: profileImageUrl,
            }, {
                onSuccess: () => {
                    showToast({ message: '강아지 정보가 등록되었습니다.', type: 'success' });
                    router.back(); // Redirect after success? User didn't specify, but back is safe.
                },
                onError: () => {
                    showToast({ message: '등록에 실패했습니다.', type: 'error' });
                },
            });
        } catch (error) {
            console.error('Failed to save dog info:', error);
            showToast({ message: '이미지 업로드 또는 저장에 실패했습니다.', type: 'error' });
        }
    };

    return (
        <Container>
            <Header title="반려견 정보 등록" showBackButton={true} onBack={() => router.back()} />
            <Content>
                <DogForm
                    onSubmit={handleSave}
                    isSubmitting={saveMutation.isPending}
                />
            </Content>
        </Container>
    );
}

const Container = styled.div`
  min-height: 100vh;
  background-color: white;
  display: flex;
  flex-direction: column;
`;

const Content = styled.div`
  flex: 1;
  padding: ${spacing[5]}px;
  padding-bottom: 80px; // Space for fixed bottom button
`;
