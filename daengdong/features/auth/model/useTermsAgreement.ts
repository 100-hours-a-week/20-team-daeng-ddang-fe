import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToastStore } from '@/shared/stores/useToastStore';
import { useUpdateTermsAgreement } from '@/features/auth/model/useAuthMutations';

export const useTermsAgreement = () => {
    const router = useRouter();
    const [termsAgreed, setTermsAgreed] = useState(false);
    const [privacyAgreed, setPrivacyAgreed] = useState(false);
    const [marketingAgreed, setMarketingAgreed] = useState(false);

    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        title: string;
        content: string;
    }>({
        isOpen: false,
        title: '',
        content: '',
    });

    // 페이지 이탈 방지 (뒤로가기, 새로고침, 탭 닫기)
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = '';
        };

        const handlePopState = () => {
            // 뒤로가기 시도 시 현재 페이지로 다시 push
            window.history.pushState(null, '', window.location.pathname);
        };

        // 초기 히스토리 상태 설정
        window.history.pushState(null, '', window.location.pathname);

        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

    const { mutate: updateTerms, isPending } = useUpdateTermsAgreement();

    const handleSubmit = () => {
        if (!termsAgreed || !privacyAgreed) {
            return;
        }

        updateTerms(true, {
            onSuccess: () => {
                localStorage.setItem('termsAgreed', 'true');

                const { showToast } = useToastStore.getState();
                showToast({
                    message: '약관 동의가 완료되었습니다.',
                    type: 'success',
                    duration: 2000,
                });

                router.replace('/walk');
            }
        });
    };

    const openModal = (title: string, content: string) => {
        setModalState({ isOpen: true, title, content });
    };

    const closeModal = () => {
        setModalState({ isOpen: false, title: '', content: '' });
    };

    const isSubmitEnabled = termsAgreed && privacyAgreed;

    return {
        termsAgreed,
        setTermsAgreed,
        privacyAgreed,
        setPrivacyAgreed,
        marketingAgreed,
        setMarketingAgreed,
        modalState,
        openModal,
        closeModal,
        handleSubmit,
        isSubmitEnabled,
        isPending
    };
};
