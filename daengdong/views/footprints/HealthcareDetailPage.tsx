"use client";

import styled from "@emotion/styled";
import { colors, radius, spacing } from "@/shared/styles/tokens";
import { useHealthcareDetailQuery } from "@/features/footprints/api/useFootprintsQuery";
import { Header } from "@/widgets/Header";
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
                {/* 전체 위험도 */}
                <RiskBanner level={healthcare.overallRiskLevel}>

                    <RiskLabel>전체 위험도</RiskLabel>
                    <RiskValue>
                        {healthcare.overallRiskLevel === 'low' && '안전 (LOW)'}
                        {healthcare.overallRiskLevel === 'medium' && '주의 (MEDIUM)'}
                        {healthcare.overallRiskLevel === 'high' && '위험 (HIGH)'}
                    </RiskValue>
                </RiskBanner>
                {healthcare.artifacts?.keypointOverlayVideoUrl && (
                    <video
                        src={healthcare.artifacts.keypointOverlayVideoUrl}
                        controls
                        playsInline
                        style={{ width: "100%", borderRadius: 12 }}
                    />
                )}
                {/* 요약 */}
                <SummaryBox>
                    <SummaryText>{healthcare.summary}</SummaryText>
                </SummaryBox>

                {/* 상세 지표 */}
                <Section>
                    <SectionTitle>상세 분석 지표</SectionTitle>
                    <MetricsList>
                        <MetricItem>
                            <MetricName>슬개골 위험도</MetricName>
                            <MetricScore level={healthcare.metrics.patellaRiskSignal.level}>
                                {healthcare.metrics.patellaRiskSignal.score}점
                            </MetricScore>
                        </MetricItem>
                        <MetricDesc>{healthcare.metrics.patellaRiskSignal.description}</MetricDesc>

                        <MetricItem>
                            <MetricName>좌우 보행 균형</MetricName>
                            <MetricScore level={healthcare.metrics.gaitBalance.level}>{healthcare.metrics.gaitBalance.score}점</MetricScore>
                        </MetricItem>
                        <MetricDesc>{healthcare.metrics.gaitBalance.description}</MetricDesc>

                        <MetricItem>
                            <MetricName>무릎 관절 가동성</MetricName>
                            <MetricScore level={healthcare.metrics.kneeMobility.level}>{healthcare.metrics.kneeMobility.score}점</MetricScore>
                        </MetricItem>
                        <MetricDesc>{healthcare.metrics.kneeMobility.description}</MetricDesc>

                        <MetricItem>
                            <MetricName>보행 밸런스</MetricName>
                            <MetricScore level={healthcare.metrics.gaitStability.level}>{healthcare.metrics.gaitStability.score}점</MetricScore>
                        </MetricItem>
                        <MetricDesc>{healthcare.metrics.gaitStability.description}</MetricDesc>

                        <MetricItem>
                            <MetricName>보행 리듬</MetricName>
                            <MetricScore level={healthcare.metrics.gaitRhythm.level}>{healthcare.metrics.gaitRhythm.score}점</MetricScore>
                        </MetricItem>
                        <MetricDesc>{healthcare.metrics.gaitRhythm.description}</MetricDesc>
                    </MetricsList>
                </Section>

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
    padding: ${spacing[4]}px;
    overflow-y: auto;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: ${spacing[4]}px;
`;

const RiskBanner = styled.div<{ level: 'low' | 'medium' | 'high' }>`
    background-color: ${({ level }) => {
        switch (level) {
            case 'low': return colors.semantic.success + '20';
            case 'medium': return '#FFC107' + '30';
            case 'high': return colors.semantic.error + '20';
        }
    }};
    padding: ${spacing[3]}px;
    border-radius: ${radius.md};
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    border: 1px solid ${({ level }) => {
        switch (level) {
            case 'low': return colors.semantic.success;
            case 'medium': return '#FFC107';
            case 'high': return colors.semantic.error;
        }
    }};
`;

const RiskLabel = styled.span`
    font-size: 12px;
    color: ${colors.gray[600]};
    font-weight: 600;
`;

const RiskValue = styled.span`
    font-size: 18px;
    font-weight: 800;
    color: ${colors.gray[900]};
`;

const SummaryBox = styled.div`
    background-color: ${colors.gray[50]};
    padding: ${spacing[3]}px;
    border-radius: ${radius.md};
`;

const SummaryText = styled.p`
    font-size: 15px;
    color: ${colors.gray[800]};
    line-height: 1.5;
`;

const Section = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${spacing[2]}px;
`;

const SectionTitle = styled.h3`
    font-size: 16px;
    font-weight: 700;
    color: ${colors.gray[900]};
    border-bottom: 2px solid ${colors.gray[100]};
    padding-bottom: ${spacing[1]}px;
`;

const MetricsList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${spacing[3]}px;
`;

const MetricItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const MetricName = styled.span`
    font-size: 14px;
    color: ${colors.gray[700]};
    font-weight: 600;
`;

const MetricScore = styled.span<{ level?: string }>`
    font-size: 14px;
    font-weight: 700;
    color: ${({ level }) => {
        switch (level) {
            case 'low':
            case 'normal':
            case 'stable':
            case 'regular':
            case 'good':
            case 'flexible':
            case 'safe':
                return colors.semantic.success;
            case 'medium':
            case 'fair':
            case 'warning':
                return '#FFC107';
            case 'high':
            case 'poor':
            case 'irregular':
            case 'unstable':
            case 'stiff':
            case 'danger':
                return colors.semantic.error;
            default:
                return colors.primary[600];
        }
    }};
`;

const MetricDesc = styled.p`
    font-size: 13px;
    color: ${colors.gray[500]};
    margin-top: -${spacing[2]}px;
    padding-bottom: ${spacing[2]}px;
    border-bottom: 1px solid ${colors.gray[100]};
`;

const GuideTooltip = styled.p`
    font-size: 12px;
    color: ${colors.gray[400]};
    text-align: center;
    margin-top: ${spacing[4]}px;
`;

export default HealthcareDetailPage;
