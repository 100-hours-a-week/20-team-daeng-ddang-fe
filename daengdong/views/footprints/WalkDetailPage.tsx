"use client";

import styled from "@emotion/styled";
import { colors, radius, spacing } from "@/shared/styles/tokens";
import Image from "next/image";
import { Header } from "@/widgets/Header";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { formatDistance } from "@/shared/utils/formatDistance";
import { useRouter } from "next/navigation";
import { WalkDetail, WalkExpressionAnalysis } from "@/entities/footprints/model/types";

interface WalkDetailScreenProps {
    walk: WalkDetail;
    expression: WalkExpressionAnalysis | null;
    onBack?: () => void;
}

const getEmotionLabel = (emotion: string) => {
    switch (emotion) {
        case 'happy': return '행복해요';
        case 'sad': return '슬퍼요';
        case 'angry': return '화났어요';
        case 'relaxed': return '편안해요';
        default: return emotion;
    }
};

const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}분 ${remainingSeconds.toString().padStart(2, '0')}초`;
};

export const WalkDetailPage = ({ walk, expression, onBack }: WalkDetailScreenProps) => {
    const router = useRouter();
    const handleBack = onBack || (() => router.back());

    const startTime = `${format(new Date(walk.createdAt), 'a h시 mm분', { locale: ko })}`;

    const dateText = format(new Date(walk.createdAt), 'yyyy년 MM월 dd일');

    return (
        <ScreenContainer>
            <Header title="산책 상세 기록" showBackButton={true} onBack={handleBack} />
            <Content>
                <DateText>{dateText}</DateText>

                {/* 지도 스냅샷 */}
                {walk.mapImageUrl && (
                    <MapImageWrapper>
                        <Image
                            src={walk.mapImageUrl}
                            alt="Path Map"
                            fill
                            sizes="(max-width: 430px) 100vw, 430px"
                            style={{ objectFit: 'cover' }}
                            priority
                        />
                    </MapImageWrapper>
                )}

                {/* 기본 정보 */}
                <InfoGrid>
                    <InfoItem>
                        <Label>시작 시간</Label>
                        <Value>{startTime}</Value>
                    </InfoItem>
                    <InfoItem>
                        <Label>산책 거리</Label>
                        <Value>{formatDistance(walk.distance, 2)} km</Value>
                    </InfoItem>
                    <InfoItem>
                        <Label>소요 시간</Label>
                        <Value>{formatDuration(walk.duration)}</Value>
                    </InfoItem>
                    {walk.region && (
                        <InfoItem>
                            <Label>거주 지역</Label>
                            <Value>{walk.region}</Value>
                        </InfoItem>
                    )}
                </InfoGrid>

                {/* 기록 */}
                {walk.memo && (
                    <Section>
                        <SectionTitle>산책 메모</SectionTitle>
                        <MemoText>{walk.memo}</MemoText>
                    </Section>
                )}

                {/* 표정 분석 */}
                {expression && (
                    <Section>
                        <SectionTitle>표정 분석 결과</SectionTitle>
                        {expression.videoUrl && (
                            <Video
                                src={expression.videoUrl}
                                controls
                                playsInline
                                preload="metadata"
                            />
                        )}
                        <ExpressionCard>
                            <SectionTitle>감정 상세 분석</SectionTitle>
                            {expression.emotionProbabilities && (
                                <EmotionList>
                                    <EmotionRow>
                                        <EmotionInfo>
                                            <EmotionIcon>💢</EmotionIcon>
                                            <EmotionName>화남</EmotionName>
                                        </EmotionInfo>
                                        <EmotionPercent>{(expression.emotionProbabilities.angry * 100).toFixed(0)}%</EmotionPercent>
                                    </EmotionRow>
                                    <ProgressBarContainer>
                                        <ProgressBar width={expression.emotionProbabilities.angry * 100} color={colors.semantic.error} />
                                    </ProgressBarContainer>

                                    <EmotionRow>
                                        <EmotionInfo>
                                            <EmotionIcon>🥰</EmotionIcon>
                                            <EmotionName>행복</EmotionName>
                                        </EmotionInfo>
                                        <EmotionPercent>{(expression.emotionProbabilities.happy * 100).toFixed(0)}%</EmotionPercent>
                                    </EmotionRow>
                                    <ProgressBarContainer>
                                        <ProgressBar width={expression.emotionProbabilities.happy * 100} color={colors.semantic.warning} />
                                    </ProgressBarContainer>

                                    <EmotionRow>
                                        <EmotionInfo>
                                            <EmotionIcon>🌿</EmotionIcon>
                                            <EmotionName>편안</EmotionName>
                                        </EmotionInfo>
                                        <EmotionPercent>{(expression.emotionProbabilities.relaxed * 100).toFixed(0)}%</EmotionPercent>
                                    </EmotionRow>
                                    <ProgressBarContainer>
                                        <ProgressBar width={expression.emotionProbabilities.relaxed * 100} color={colors.green[600]} />
                                    </ProgressBarContainer>

                                    <EmotionRow>
                                        <EmotionInfo>
                                            <EmotionIcon>💧</EmotionIcon>
                                            <EmotionName>슬픔</EmotionName>
                                        </EmotionInfo>
                                        <EmotionPercent>{(expression.emotionProbabilities.sad * 100).toFixed(0)}%</EmotionPercent>
                                    </EmotionRow>
                                    <ProgressBarContainer>
                                        <ProgressBar width={expression.emotionProbabilities.sad * 100} color={colors.blue[500]} />
                                    </ProgressBarContainer>
                                </EmotionList>
                            )}
                        </ExpressionCard>

                        <SummaryCard>
                            <SummaryTitle>{getEmotionLabel(expression.predictedEmotion)}</SummaryTitle>
                            <SummaryText>{expression.summary}</SummaryText>
                            <Disclaimer>분석 결과는 100% 정확하지 않을 수 있습니다.</Disclaimer>
                        </SummaryCard>
                    </Section>
                )}
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
    padding-bottom: 70px;
`;

const Content = styled.div`
    padding: ${spacing[4]}px;
    overflow-y: auto;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: ${spacing[4]}px;
`;

const MapImageWrapper = styled.div`
    position: relative;
    width: 100%;
    height: 0;
    padding-bottom: 100%; /* 1:1 Aspect Ratio */
    border-radius: ${radius.md};
    overflow: hidden;
    background-color: ${colors.gray[100]};
`;

const Video = styled.video`
    width: 100%;
    aspect-ratio: 1/1;
    border-radius: ${radius.md};
    background-color: black;
    object-fit: cover;
`;

const InfoGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${spacing[3]}px;
    background-color: ${colors.gray[50]};
    padding: ${spacing[3]}px;
    border-radius: ${radius.md};
`;

const InfoItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const Label = styled.span`
    font-size: 12px;
    color: ${colors.gray[500]};
`;

const Value = styled.span`
    font-size: 15px;
    font-weight: 600;
    color: ${colors.gray[900]};
`;

const Section = styled.div`
    padding-top: ${spacing[5]}px;
    display: flex;
    flex-direction: column;
    gap: ${spacing[2]}px;
`;

const SectionTitle = styled.h3`
    font-size: 16px;
    font-weight: 700;
    color: ${colors.gray[900]};
`;

const MemoText = styled.p`
    font-size: 14px;
    color: ${colors.gray[700]};
    line-height: 1.5;
    background-color: white;
    padding: ${spacing[2]}px;
    border-radius: ${radius.sm};
    border: 1px solid ${colors.gray[200]};
    white-space: pre-wrap;
`;

const ExpressionCard = styled.div`
    border: 1px solid ${colors.gray[200]};
    border-radius: ${radius.lg};
    padding: ${spacing[4]}px;
    background-color: white;
    display: flex;
    flex-direction: column;
    gap: ${spacing[2]}px;
`;

const EmotionList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const EmotionRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
`;

const EmotionInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const EmotionIcon = styled.span`
    font-size: 20px;
`;

const EmotionName = styled.span`
    font-size: 15px;
    font-weight: 600;
    color: ${colors.gray[800]};
`;

const EmotionPercent = styled.span`
    font-size: 15px;
    font-weight: 700;
    color: ${colors.primary[600]}; 
`;

const ProgressBarContainer = styled.div`
    width: 100%;
    height: 8px;
    background-color: ${colors.gray[100]};
    border-radius: ${radius.full};
    overflow: hidden;
`;

const ProgressBar = styled.div<{ width: number; color: string }>`
    width: ${({ width }) => width}%;
    height: 100%;
    background-color: ${({ color }) => color};
    border-radius: ${radius.full};
`;

const SummaryCard = styled.div`
    background-color: ${colors.gray[50]};
    border-radius: ${radius.lg};
    padding: ${spacing[4]}px;
    margin-top: ${spacing[2]}px;
`;

const SummaryTitle = styled.h4`
    font-size: 16px;
    font-weight: 700;
    color: ${colors.gray[900]};
    margin-bottom: ${spacing[2]}px;
`;

const SummaryText = styled.p`
    font-size: 14px;
    color: ${colors.gray[700]};
    line-height: 1.5;
    margin-bottom: ${spacing[3]}px;
`;

const Disclaimer = styled.p`
    font-size: 12px;
    color: ${colors.gray[400]};
    text-align: center;
`;


const DateText = styled.h2`
    font-size: 15px;
    font-weight: 600;
    color: ${colors.gray[900]};
    margin-bottom: ${spacing[2]}px;
    padding-left: ${spacing[1]}px;
`;

export default WalkDetailPage;
