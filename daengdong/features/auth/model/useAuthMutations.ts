import { useMutation } from '@tanstack/react-query';
import { updateTermsAgreement } from '@/entities/user/api/user';
import { useToastStore } from '@/shared/stores/useToastStore';

export const useUpdateTermsAgreement = () => {
    const { showToast } = useToastStore();

    return useMutation({
        mutationFn: updateTermsAgreement,
        onError: (error) => {
            console.error('Terms agreement update failed:', error);
            showToast({
                message: '약관 동의 처리에 실패했습니다. 다시 시도해주세요.',
                type: 'error',
                duration: 3000,
            });
        },
    });
};
