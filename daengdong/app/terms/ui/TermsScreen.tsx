import { TermsModal } from '@/shared/components/TermsModal';
import { TERMS_OF_SERVICE, PRIVACY_POLICY } from '@/shared/constants/terms';
import { useTermsAgreement } from '@/features/auth/model/useTermsAgreement';
import { Container, Title, AgreementSection, AgreementItem, Checkbox, Label, TermsLink, Required, Optional, SubmitButton } from './styles';

export const TermsScreen = () => {
    const {
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
    } = useTermsAgreement();

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
};
