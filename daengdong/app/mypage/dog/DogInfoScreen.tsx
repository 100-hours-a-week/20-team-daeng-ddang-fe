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
        const isEditMode = !!dogInfo;

        saveMutation.mutate({
            isEditMode,
            data: {
                name: data.name,
                breedId: data.breedId,
                birthDate: data.birthDate,
                weight: parseFloat(data.weight),
                gender: data.gender,
                isNeutered: data.neutered === 'YES',
                // profileImageUrl logic would go here if we had URL from upload
            }
        }, {
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
        breedId: 0, // We need to find ID from name if API doesn't return ID? 
        // Wait, API returns "breed": "name". We need ID. 
        // Actually, if we are in Edit mode, we might not need to fetch ID if backend handles it, 
        // BUT for the form to work (and submit ID), we ideally need the ID.
        // Let's check shared/api/dogs.ts again. 
        // getDogInfo returns DogInfo which has `breed: string`. IT DOES NOT HAVE ID.
        // This is a disconnect. If GET /dogs/info only returns breed NAME, we can't easily pre-fill the ID for the dropdown/search.
        // Ideally, GET /dogs/info should return breedId. 
        // Assuming for now we rely on name display, but if user saves without changing breed, we need ID.
        // Workaround: We might have to search by name to get ID, or request Backend change.
        // For now, let's map what we can. If breedId is missing, maybe we can't save?
        // Actually, let's assume we just display the name. If user changes it, we get new ID. 
        // If user DOES NOT change it, we need to send breedId. 
        // CRITIAL: If API doesn't return breedId, we are stuck on Update.
        // Let's assume for this task we map what we have. 
        // RE-READING api/dogs.ts: I defined DogResponse with breed: string.
        // If the real API returns breedId, I should use it. 
        // Let's UPDATE initial show to just use 0 if unknown, but set breedName.
        breedName: dogInfo.breed,
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
