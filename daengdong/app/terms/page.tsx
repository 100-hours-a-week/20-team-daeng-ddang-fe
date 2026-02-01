"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import styled from '@emotion/styled';
import { submitAgreements } from '@/shared/api/user';
import { useToastStore } from '@/shared/stores/useToastStore';

export default function TermsPage() {
    const router = useRouter();
    const [termsAgreed, setTermsAgreed] = useState(false);
    const [privacyAgreed, setPrivacyAgreed] = useState(false);
    const [marketingAgreed, setMarketingAgreed] = useState(false);

    const agreementMutation = useMutation({
        mutationFn: submitAgreements,
        onSuccess: () => {
            const { showToast } = useToastStore.getState();
            showToast({
                message: '약관 동의가 완료되었습니다.',
                type: 'success',
                duration: 2000,
            });
            router.replace('/walk');
        },
        onError: (error) => {
            console.error('Agreement submission failed:', error);
            const { showToast } = useToastStore.getState();
            showToast({
                message: '약관 동의 처리에 실패했습니다. 다시 시도해주세요.',
                type: 'error',
                duration: 3000,
            });
        },
    });

    const handleSubmit = () => {
        if (!termsAgreed || !privacyAgreed) {
            return;
        }

        agreementMutation.mutate({
            termsAgreed,
            privacyAgreed,
            marketingAgreed,
        });
    };

    const isSubmitEnabled = termsAgreed && privacyAgreed && !agreementMutation.isPending;

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
                        <Required>[필수]</Required> 이용약관 동의
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
                        <Required>[필수]</Required> 개인정보 처리방침 동의
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
                disabled={!isSubmitEnabled}
            >
                {agreementMutation.isPending ? '처리 중...' : '동의하고 시작하기'}
            </SubmitButton>
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
    accent-color: #3b82f6;
`;

const Label = styled.label`
    font-size: 16px;
    color: #374151;
    cursor: pointer;
    user-select: none;
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
    background-color: ${props => props.disabled ? '#d1d5db' : '#3b82f6'};
    border: none;
    border-radius: 12px;
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
    transition: background-color 0.2s;

    &:hover {
        background-color: ${props => props.disabled ? '#d1d5db' : '#2563eb'};
    }

    &:active {
        background-color: ${props => props.disabled ? '#d1d5db' : '#1d4ed8'};
    }
`;
