import styled from "@emotion/styled";
import { colors, radius, spacing } from "@/shared/styles/tokens";
import { keyframes } from "@emotion/react";
import { m } from "framer-motion";

interface OnboardingOverlayProps {
    onClose: () => void;
}

export const OnboardingOverlay = ({ onClose }: OnboardingOverlayProps) => {
    return (
        <Overlay>
            <Content
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
            >
                <Title>산책 가이드</Title>

                <RuleList>
                    <RuleItem>
                        <IconWrapper>📍</IconWrapper>
                        <TextWrapper>
                            <RuleTitle>내 땅 만들기</RuleTitle>
                            <RuleDesc>지도에서 같은 위치에 <Highlight>5초 이상</Highlight> 머무르면 내 땅이 됩니다.</RuleDesc>
                        </TextWrapper>
                    </RuleItem>

                    <RuleItem>
                        <IconWrapper>⚔️</IconWrapper>
                        <TextWrapper>
                            <RuleTitle>땅 뺏기</RuleTitle>
                            <RuleDesc>다른 강아지의 땅도 <Highlight>5초 이상</Highlight> 머무르면 뺏어올 수 있어요.</RuleDesc>
                        </TextWrapper>
                    </RuleItem>

                    <RuleItem>
                        <IconWrapper>📸</IconWrapper>
                        <TextWrapper>
                            <RuleTitle>돌발 미션</RuleTitle>
                            <RuleDesc>산책 중 나타나는 돌발 미션을 수행하며 산책에 재미를 더해보세요!</RuleDesc>
                        </TextWrapper>
                    </RuleItem>

                    <RuleItem>
                        <IconWrapper>🐶</IconWrapper>
                        <TextWrapper>
                            <RuleTitle>감정 분석</RuleTitle>
                            <RuleDesc>산책이 끝난 뒤, 강아지의 표정으로 감정을 살펴볼 수 있어요.</RuleDesc>
                        </TextWrapper>
                    </RuleItem>
                </RuleList>

                <CloseButton onClick={onClose}>
                    알겠어요!
                </CloseButton>
            </Content>
        </Overlay>
    );
};

const fadeIn = keyframes`
    from { opacity: 0; }
    to { opacity: 1; }
`;

const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 400px;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${spacing[4]}px;
    animation: ${fadeIn} 0.3s ease-out;
`;

const Content = styled(m.div)`
    background: white;
    width: 100%;
    max-width: 320px;
    border-radius: ${radius.lg};
    padding: ${spacing[5]}px ${spacing[4]}px;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
`;

const Title = styled.h2`
    font-size: 20px;
    font-weight: 700;
    color: ${colors.gray[900]};
    margin-bottom: ${spacing[5]}px;
`;

const RuleList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${spacing[4]}px;
    width: 100%;
    margin-bottom: ${spacing[6]}px;
`;

const RuleItem = styled.div`
    display: flex;
    align-items: flex-start;
    gap: ${spacing[3]}px;
`;

const IconWrapper = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: ${colors.gray[100]};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
`;

const TextWrapper = styled.div`
    flex: 1;
`;

const RuleTitle = styled.h3`
    font-size: 16px;
    font-weight: 700;
    color: ${colors.gray[900]};
    margin-bottom: 4px;
`;

const RuleDesc = styled.p`
    font-size: 14px;
    color: ${colors.gray[700]};
    line-height: 1.4;
    word-break: keep-all;
`;

const Highlight = styled.span`
    color: ${colors.primary[500]};
    font-weight: 700;
`;

const CloseButton = styled.button`
    width: 100%;
    padding: 14px;
    background-color: ${colors.primary[500]};
    color: white;
    border-radius: ${radius.md};
    font-weight: 700;
    font-size: 16px;
    border: none;
    cursor: pointer;
    transition: opacity 0.2s;

    &:active {
        opacity: 0.9;
    }
`;
