import { Header } from '@/widgets/Header/Header';
import { GlobalLoading } from '@/widgets/Loading/GlobalLoading';
import { useDogInfoQuery } from '@/features/dog/api/useDogInfoQuery';
import { useSaveDogInfo } from '@/features/dog/api/useSaveDogInfo';
import { useToastStore } from '@/shared/store/useToastStore';
import { DogForm } from './components/DogForm';
import { DogFormValues } from '@/entities/dog/model/types';
import styled from '@emotion/styled';
import { spacing } from '@/shared/styles/tokens';
import { useRouter } from 'next/navigation';

export function DogInfoScreen() {
    const router = useRouter();
    const { showToast } = useToastStore();
    const { data: dogInfo, isLoading: isQueryLoading } = useDogInfoQuery();
    const saveMutation = useSaveDogInfo();

    const handleSave = (data: DogFormValues) => {
        saveMutation.mutate(data, {
            onSuccess: () => {
                showToast({ message: '반려견 정보가 저장되었습니다.', type: 'success' });
                // Optional: Redirect or stay
            },
            onError: () => {
                showToast({ message: '저장에 실패했습니다.', type: 'error' });
            },
        });
    };

    if (isQueryLoading) {
        return <GlobalLoading />;
    }

    // Pre-fill logic if data exists
    const initialData: Partial<DogFormValues> | undefined = dogInfo ? {
        name: dogInfo.name,
        breed: dogInfo.breed,
        birthDate: dogInfo.birthDate || '',
        isBirthDateUnknown: dogInfo.isBirthDateUnknown,
        weight: dogInfo.weight.toString(),
        gender: dogInfo.gender,
        neutered: dogInfo.neutered,
    } : undefined;

    return (
        <Container>
            <Header title="반려견 정보" showBackButton={true} onBack={() => router.back()} />
            <Content>
                <DogForm
                    initialData={initialData}
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
