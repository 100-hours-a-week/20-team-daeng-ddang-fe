import { Header } from '@/widgets/Header/Header';
import { useUserInfoQuery } from '@/features/user/api/useUserInfoQuery';
import { useSaveUserMutation } from '@/features/user/api/useSaveUserInfo';
import { useDeleteUser } from './hooks/useDeleteUser';
import { UserForm } from './components/UserForm';
import { useModalStore } from '@/shared/stores/useModalStore';
import { useToastStore } from '@/shared/stores/useToastStore';
import { GlobalLoading } from '@/widgets/Loading/GlobalLoading';
import styled from '@emotion/styled';
import { spacing } from '@/shared/styles/tokens';
import { useRouter } from 'next/navigation';
import { useUserQuery } from '@/entities/user/model/useUserQuery';

export function UserInfoScreen() {
    const router = useRouter();
    const { openModal } = useModalStore();
    const { showToast } = useToastStore();

    const { data: userInfo, isLoading: isQueryLoading } = useUserInfoQuery();
    // 이메일 표시용 fallback
    const { data: userData } = useUserQuery();

    const regionParts = userInfo?.region ? userInfo.region.split(' ') : [];
    const province = regionParts[0] || '';
    const city = regionParts[1] || '';

    const isNewUser = !userInfo?.userId;

    const saveMutation = useSaveUserMutation();
    const deleteMutation = useDeleteUser();

    const handleUpdate = (data: { province: string; city: string; regionId: number }) => {
        const isUpdate = !!userInfo?.userId;

        saveMutation.mutate(
            {
                userId: userInfo?.userId,
                regionId: data.regionId
            },
            {
                onSuccess: () => {
                    showToast({
                        message: isUpdate ? '사용자 정보가 수정되었습니다.' : '사용자 정보가 등록되었습니다.',
                        type: 'success'
                    });
                },
                onError: () => {
                    showToast({
                        message: isUpdate ? '수정에 실패했습니다.' : '등록에 실패했습니다.',
                        type: 'error'
                    });
                }
            }
        );
    };

    const handleWithdrawClick = () => {
        openModal({
            title: '회원 탈퇴',
            message: '정말로 탈퇴하시겠습니까? 탈퇴 시 모든 정보가 삭제됩니다.',
            type: 'confirm',
            confirmText: '탈퇴하기',
            cancelText: '취소',
            onConfirm: () => {
                deleteMutation.mutate(undefined, {
                    onSuccess: () => {
                        showToast({ message: '회원 탈퇴가 완료되었습니다.', type: 'success' });
                    },
                    onError: () => {
                        showToast({ message: '탈퇴 처리에 실패했습니다.', type: 'error' });
                    }
                });
            }
        });
    };

    if (isQueryLoading) {
        return <GlobalLoading />;
    }

    const isSubmitting = saveMutation.isPending || deleteMutation.isPending;
    const displayEmail = userInfo?.kakaoEmail || userData?.kakaoEmail;

    return (
        <Container>
            <Header title="사용자 정보" showBackButton={true} onBack={() => router.back()} />

            <Content>
                <UserForm
                    initialData={{
                        province: province,
                        city: city
                    }}
                    initialParentRegionId={userInfo?.parentRegionId}
                    initialRegionId={userInfo?.regionId}
                    onSubmit={handleUpdate}
                    onWithdraw={handleWithdrawClick}
                    isSubmitting={isSubmitting}
                    isNewUser={isNewUser}
                    kakaoEmail={displayEmail}
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
  padding: ${spacing[5]}px; /* 20px */
  flex: 1;
`;
