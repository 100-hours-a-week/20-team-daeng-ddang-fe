import { Header } from '@/widgets/Header/Header';
import { useDogInfoQuery } from '@/features/dog/api/useDogInfoQuery';
import { DogForm } from '@/app/mypage/dog/ui/DogForm';
import { DogFormValues } from '@/entities/dog/model/types';
import styled from '@emotion/styled';
import { useRouter } from 'next/navigation';
import { useDogProfile } from '@/features/dog/model/useDogProfile';
import { spacing } from '@/shared/styles/tokens';
import { LoadingView } from '@/widgets/Loading/GlobalLoading';

export function DogInfoScreen() {
    const router = useRouter();
    const { data: dogInfo, isLoading: isDogLoading } = useDogInfoQuery();
    const { saveDogProfile, transformDogInfoToForm, isSaving } = useDogProfile();

    const handleSave = async (data: DogFormValues) => {
        await saveDogProfile(data, dogInfo);
    };

    if (isDogLoading) {
        return <LoadingView />;
    }

    return (
        <Container>
            <Header title="반려견 정보" showBackButton={true} onBack={() => router.back()} />
            <Content>
                <DogForm
                    initialData={dogInfo ? transformDogInfoToForm(dogInfo) : undefined}
                    initialImageUrl={dogInfo?.imageUrl ?? null}
                    onSubmit={handleSave}
                    isSubmitting={isSaving}
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
  padding-bottom: 80px;
`;
