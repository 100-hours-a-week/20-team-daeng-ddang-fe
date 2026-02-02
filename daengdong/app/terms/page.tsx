"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled from '@emotion/styled';
import { useToastStore } from '@/shared/stores/useToastStore';
import { TermsModal } from '@/shared/components/TermsModal';
import { TERMS_OF_SERVICE, PRIVACY_POLICY } from '@/shared/constants/terms';
import { colors } from '@/shared/styles/tokens';
import { useUpdateTermsAgreement } from '@/features/auth/model/useAuthMutations';

export default function TermsPage() {
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

    return (
        <Container>
            <Title>서비스 이용 약관</Title>

            <AgreementSection>
                <AgreementItem>
                    <Checkbox
                        type="checkbox"
                        id="terms"
                        checked={termsAgreed}
                        onChange={(e) => setTermsAgreed(e.target.checked)}
                    />
                    <Label htmlFor="terms">
                        <Required>[필수]</Required>
                        <TermsLink onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            openModal('서비스 이용약관', TERMS_OF_SERVICE);
                        }}>
                            이용약관
                        </TermsLink>
                        {' '}동의
                    </Label>
                </AgreementItem>

                <AgreementItem>
                    <Checkbox
                        type="checkbox"
                        id="privacy"
                        checked={privacyAgreed}
                        onChange={(e) => setPrivacyAgreed(e.target.checked)}
                    />
                    <Label htmlFor="privacy">
                        <Required>[필수]</Required>
                        <TermsLink onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            openModal('개인정보 처리방침', PRIVACY_POLICY);
                        }}>
                            개인정보 처리방침
                        </TermsLink>
                        {' '}동의
                    </Label>
                </AgreementItem>

                <AgreementItem>
                    <Checkbox
                        type="checkbox"
                        id="marketing"
                        checked={marketingAgreed}
                        onChange={(e) => setMarketingAgreed(e.target.checked)}
                    />
                    <Label htmlFor="marketing">
                        <Optional>[선택]</Optional> 마케팅 수신 동의
                    </Label>
                </AgreementItem>
            </AgreementSection>

            <SubmitButton
                onClick={handleSubmit}
                disabled={!isSubmitEnabled || isPending}
            >
                {isPending ? '처리 중...' : '동의하고 시작하기'}
            </SubmitButton>

            <TermsModal
                isOpen={modalState.isOpen}
                onClose={closeModal}
                title={modalState.title}
                content={modalState.content}
            />
        </Container>
    );
}

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 24px;
    background-color: #f9fafb;
`;

const Title = styled.h1`
    font-size: 24px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 32px;
`;

const AgreementSection = styled.div`
    width: 100%;
    max-width: 400px;
    background-color: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    margin-bottom: 24px;
`;

const AgreementItem = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 16px;

    &:last-child {
        margin-bottom: 0;
    }
`;

const Checkbox = styled.input`
    width: 20px;
    height: 20px;
    margin-right: 12px;
    cursor: pointer;
    accent-color: ${colors.primary[500]};
`;

const Label = styled.label`
    font-size: 16px;
    color: #374151;
    cursor: pointer;
    user-select: none;
`;

const TermsLink = styled.span`
    color: ${colors.primary[600]};
    text-decoration: underline;
    cursor: pointer;
    font-weight: 500;

    &:hover {
        color: ${colors.primary[700]};
    }
`;

const Required = styled.span`
    color: #ef4444;
    font-weight: 600;
    margin-right: 4px;
`;

const Optional = styled.span`
    color: #6b7280;
    font-weight: 500;
    margin-right: 4px;
`;

const SubmitButton = styled.button<{ disabled: boolean }>`
    width: 100%;
    max-width: 400px;
    padding: 16px;
    font-size: 16px;
    font-weight: 600;
    color: white;
    background-color: ${props => props.disabled ? '#d1d5db' : colors.primary[500]};
    border: none;
    border-radius: 12px;
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
    transition: background-color 0.2s;

    &:hover {
        background-color: ${props => props.disabled ? '#d1d5db' : colors.primary[600]};
    }

    &:active {
        background-color: ${props => props.disabled ? '#d1d5db' : colors.primary[700]};
    }
`;
