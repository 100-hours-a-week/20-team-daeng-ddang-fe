"use client";

import Image from "next/image";
import { Dialog } from "@/shared/components/Dialog";
import styled from "@emotion/styled";
import { colors } from "@/shared/styles/tokens";
import dogSideGuide from "@/shared/assets/images/dog-side-guide.png";

interface HealthcareGuideOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

export const HealthcareGuideOverlay = ({ isOpen, onClose }: HealthcareGuideOverlayProps) => {
    return (
        <Dialog isOpen={isOpen} onClose={onClose}>
            <Dialog.Overlay />
            <Dialog.Container>
                <ImageWrapper>
                    <Image
                        src={dogSideGuide}
                        alt="측면에서 걷는 강아지 예시"
                        width={200}
                        height={160}
                        style={{ objectFit: "contain" }}
                        priority
                    />
                </ImageWrapper>

                <Dialog.Title>촬영 가이드</Dialog.Title>

                <RuleList>
                    <RuleItem>
                        <RuleIcon>📹</RuleIcon>
                        <RuleText>
                            반려견이 걷는 모습 <Highlight>측면</Highlight>에서 촬영해요
                        </RuleText>
                    </RuleItem>

                    <TimeBadge>
                        <TimeIcon>⏱️</TimeIcon>
                        <TimeText><strong>10초 이내</strong> 영상만 업로드 가능해요</TimeText>
                    </TimeBadge>

                    <RuleItem>
                        <RuleIcon>🤖</RuleIcon>
                        <RuleText>AI가 걸음걸이를 분석하여 건강 상태를 확인해요</RuleText>
                    </RuleItem>

                    <RuleItem warn>
                        <RuleIcon>⚠️</RuleIcon>
                        <RuleText warn>분석 결과는 <strong>진단이 아니에요</strong>. 정확한 진단은 병원을 방문해주세요</RuleText>
                    </RuleItem>
                </RuleList>

                <Dialog.ButtonGroup>
                    <Dialog.Button variant="primary" onClick={onClose}>
                        알겠어요!
                    </Dialog.Button>
                </Dialog.ButtonGroup>
            </Dialog.Container>
        </Dialog>
    );
};

const ImageWrapper = styled.div`
    width: 100%;
    display: flex;
    justify-content: center;
    margin-bottom: 4px;
`;

const RuleList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
`;

const RuleItem = styled.div<{ warn?: boolean }>`
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 10px 12px;
    background-color: ${({ warn }) => warn ? "#FFF8F6" : colors.gray[50]};
    border-radius: 10px;
    border: 1px solid ${({ warn }) => warn ? "#FFD4CC" : colors.gray[200]};
`;

const TimeBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    background-color: ${colors.primary[50]};
    border-radius: 10px;
    border: 1.5px solid ${colors.primary[300]};
`;

const RuleIcon = styled.span`
    font-size: 18px;
    line-height: 1;
    flex-shrink: 0;
`;

const TimeIcon = styled.span`
    font-size: 20px;
    line-height: 1;
    flex-shrink: 0;
`;

const RuleText = styled.p<{ warn?: boolean }>`
    margin: 0;
    font-size: 13px;
    color: ${({ warn }) => warn ? colors.gray[600] : colors.gray[700]};
    line-height: 1.5;
    word-break: keep-all;
`;

const TimeText = styled.p`
    margin: 0;
    font-size: 13px;
    color: ${colors.primary[700]};
    line-height: 1.4;

    strong {
        font-size: 14px;
        font-weight: 800;
    }
`;

const Highlight = styled.span`
    color: ${colors.primary[600]};
    font-weight: 700;
`;
