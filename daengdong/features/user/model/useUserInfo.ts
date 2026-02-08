import { useModalStore } from '@/shared/stores/useModalStore';
import { useToastStore } from '@/shared/stores/useToastStore';
import { useSaveUserMutation } from '@/features/user/api/useSaveUserInfo';
import { useDeleteUser } from '@/features/user/api/useDeleteUser';
import { UserInfo } from '@/entities/user/model/types';

export const useUserLogic = () => {
    const { openModal } = useModalStore();
    const { showToast } = useToastStore();

    const saveMutation = useSaveUserMutation();
    const deleteMutation = useDeleteUser();

    const updateUser = (
        data: { province: string; city: string; regionId: number },
        userInfo?: UserInfo | null
    ) => {
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

    const withdrawUser = () => {
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

    return {
        updateUser,
        withdrawUser,
        isSubmitting: saveMutation.isPending || deleteMutation.isPending
    };
};
