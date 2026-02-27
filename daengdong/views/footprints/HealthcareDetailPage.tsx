"use client";

import styled from "@emotion/styled";

import { useHealthcareDetailQuery } from "@/features/footprints/api/useFootprintsQuery";
import { Header } from "@/widgets/Header";
import {
    RiskLevelBadge,
    ResultBubble,
    BubbleTitle,
    BubbleText,
    DetailSection,
    SectionTitle,
    DetailCard,
    DetailCardHeader,
    DetailCategory,
    RiskBadge,
    DetailScore,
    DetailDescription,
    ProgressBarContainer,
    ProgressBar,
    GuideTooltip,
    formatLevelToKorean
} from "@/views/healthcare/_style";
import { useRouter } from "next/navigation";

interface HealthcareDetailScreenProps {
    healthcareId: number;
    onBack?: () => void;
}

export const HealthcareDetailPage = ({ healthcareId, onBack }: HealthcareDetailScreenProps) => {
    const router = useRouter();
    const handleBack = onBack || (() => router.back());
    const { data: healthcare, isLoading } = useHealthcareDetailQuery(healthcareId);

    if (isLoading) return null;
    if (!healthcare) return null;

    return (
        <ScreenContainer>
            <Header title="헬스 케어 상세 기록" showBackButton={true} onBack={handleBack} />
            <Content>
                {healthcare.artifacts?.keypointOverlayVideoUrl && (
                    <video
                        src={healthcare.artifacts.keypointOverlayVideoUrl}
                        controls
                        style={{ width: "100%", borderRadius: 12 }}
                    />
                )}

                <RiskLevelBadge level={healthcare.overallRiskLevel}>
                    {healthcare.overallRiskLevel === 'low' && '🟢 위험도: 낮음'}
                    {healthcare.overallRiskLevel === 'medium' && '🟡 위험도: 보통'}
                    {healthcare.overallRiskLevel === 'high' && '🔴 위험도: 높음'}
                </RiskLevelBadge>

                {/* 요약 */}
                <ResultBubble>
                    <BubbleTitle>AI 분석 요약</BubbleTitle>
                    <BubbleText>{healthcare.summary}</BubbleText>
                </ResultBubble>

                {/* 상세 지표 */}
                <DetailSection>
                    <SectionTitle>상세 분석</SectionTitle>

                    {/* 슬개골 위험도 */}
                    <DetailCard>
                        <DetailCardHeader>
                            <DetailCategory>슬개골 위험도</DetailCategory>
                            <RiskBadge level={healthcare.metrics.patellaRiskSignal.level}>
                                {formatLevelToKorean(healthcare.metrics.patellaRiskSignal.level)}
                            </RiskBadge>
                        </DetailCardHeader>
                        <DetailScore score={healthcare.metrics.patellaRiskSignal.score} level={healthcare.metrics.patellaRiskSignal.level}>{healthcare.metrics.patellaRiskSignal.score}점</DetailScore>
                        <DetailDescription>{healthcare.metrics.patellaRiskSignal.description}</DetailDescription>
                        <ProgressBarContainer>
                            <ProgressBar width={healthcare.metrics.patellaRiskSignal.score} level={healthcare.metrics.patellaRiskSignal.level} />
                        </ProgressBarContainer>
                    </DetailCard>

                    {/* 좌우 보행 균형 */}
                    <DetailCard>
                        <DetailCardHeader>
                            <DetailCategory>좌우 보행 균형</DetailCategory>
                            <RiskBadge level={healthcare.metrics.gaitBalance.level}>
                                {formatLevelToKorean(healthcare.metrics.gaitBalance.level)}
                            </RiskBadge>
                        </DetailCardHeader>
                        <DetailScore score={healthcare.metrics.gaitBalance.score} level={healthcare.metrics.gaitBalance.level}>{healthcare.metrics.gaitBalance.score}점</DetailScore>
                        <DetailDescription>{healthcare.metrics.gaitBalance.description}</DetailDescription>
                        <ProgressBarContainer>
                            <ProgressBar width={healthcare.metrics.gaitBalance.score} level={healthcare.metrics.gaitBalance.level} />
                        </ProgressBarContainer>
                    </DetailCard>

                    {/* 무릎 관절 가동성 */}
                    <DetailCard>
                        <DetailCardHeader>
                            <DetailCategory>무릎 관절 가동성</DetailCategory>
                            <RiskBadge level={healthcare.metrics.kneeMobility.level}>
                                {formatLevelToKorean(healthcare.metrics.kneeMobility.level)}
                            </RiskBadge>
                        </DetailCardHeader>
                        <DetailScore score={healthcare.metrics.kneeMobility.score} level={healthcare.metrics.kneeMobility.level}>{healthcare.metrics.kneeMobility.score}점</DetailScore>
                        <DetailDescription>{healthcare.metrics.kneeMobility.description}</DetailDescription>
                        <ProgressBarContainer>
                            <ProgressBar width={healthcare.metrics.kneeMobility.score} level={healthcare.metrics.kneeMobility.level} />
                        </ProgressBarContainer>
                    </DetailCard>

                    {/* 보행 안정성 */}
                    <DetailCard>
                        <DetailCardHeader>
                            <DetailCategory>보행 안정성</DetailCategory>
                            <RiskBadge level={healthcare.metrics.gaitStability.level}>
                                {formatLevelToKorean(healthcare.metrics.gaitStability.level)}
                            </RiskBadge>
                        </DetailCardHeader>
                        <DetailScore score={healthcare.metrics.gaitStability.score} level={healthcare.metrics.gaitStability.level}>{healthcare.metrics.gaitStability.score}점</DetailScore>
                        <DetailDescription>{healthcare.metrics.gaitStability.description}</DetailDescription>
                        <ProgressBarContainer>
                            <ProgressBar width={healthcare.metrics.gaitStability.score} level={healthcare.metrics.gaitStability.level} />
                        </ProgressBarContainer>
                    </DetailCard>

                    {/* 보행 리듬 */}
                    <DetailCard>
                        <DetailCardHeader>
                            <DetailCategory>보행 리듬</DetailCategory>
                            <RiskBadge level={healthcare.metrics.gaitRhythm.level}>
                                {formatLevelToKorean(healthcare.metrics.gaitRhythm.level)}
                            </RiskBadge>
                        </DetailCardHeader>
                        <DetailScore score={healthcare.metrics.gaitRhythm.score} level={healthcare.metrics.gaitRhythm.level}>{healthcare.metrics.gaitRhythm.score}점</DetailScore>
                        <DetailDescription>{healthcare.metrics.gaitRhythm.description}</DetailDescription>
                        <ProgressBarContainer>
                            <ProgressBar width={healthcare.metrics.gaitRhythm.score} level={healthcare.metrics.gaitRhythm.level} />
                        </ProgressBarContainer>
                    </DetailCard>
                </DetailSection>

                <GuideTooltip>
                    * 분석 결과는 진단이 아닙니다. 수의사와 상담하세요.
                </GuideTooltip>
            </Content>
        </ScreenContainer>
    );
};

const ScreenContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100svh;
    background-color: white;
    width: 100%;
    max-width: 430px;
    margin: 0 auto;
`;

const Content = styled.div`
    padding: 16px;
    overflow-y: auto;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
`;



export default HealthcareDetailPage;
