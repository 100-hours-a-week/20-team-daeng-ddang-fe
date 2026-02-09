"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/widgets/Header";
import { HealthcareMainSection } from "@/features/healthcare/ui/HealthcareMainSection";
import { VideoUploadSection } from "@/features/healthcare/ui/VideoUploadSection";
import { HealthcareCamera } from "@/features/healthcare/ui/HealthcareCamera";
import { HealthcareGuideOverlay } from "@/features/healthcare/ui/HealthcareGuideOverlay";
import { useHealthcareStore } from "@/entities/healthcare/model/healthcareStore";
import { useOnboarding } from "@/shared/hooks/useOnboarding";
import mascotImage from "@/shared/assets/images/mascot.png";
import { useHealthcareMutations } from "@/features/healthcare/model/useHealthcareMutations";
import { mockHealthcareResult } from "@/features/healthcare/lib/mockData";
import { useConfirmPageLeave } from "@/shared/hooks/useConfirmPageLeave";
import {
    PageContainer,
    ContentWrapper,
    VideoPreviewCard,
    PreviewVideo,
    PreviewImage,
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
    RetryButton,
    GuideBox,
    GuideText
} from "./style";

export const HealthcareScreen = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { step, setStep, result, setResult } = useHealthcareStore();
    const { showOnboarding, openOnboarding, closeOnboarding } = useOnboarding('hasVisitedHealthcare');
    const { uploadAndAnalyze } = useHealthcareMutations();

    const [mode, setMode] = useState<'main' | 'upload' | 'record'>('main');
    const [isCameraIdle, setIsCameraIdle] = useState(true);

    // Prevent accidental page leave during recording
    useConfirmPageLeave(mode === 'record' && !isCameraIdle);

    // TODO: mock 데이터 삭제
    useEffect(() => {
        const isMockMode = searchParams.get('mock') === '1';
        if (isMockMode && !result) {
            setResult(mockHealthcareResult);
            setStep('result');
        }
    }, [searchParams, result, setResult, setStep]);

    const handleCancel = () => {
        if (mode === 'main') {
            router.back();
        } else {
            setMode('main');
        }
    };

    const handleUpload = () => {
        setMode('upload');
    };

    const handleRecord = () => {
        setMode('record');
    };

    const handleComplete = async (videoBlob: Blob) => {
        try {
            await uploadAndAnalyze(videoBlob);
        } catch {
            setMode('main');
        }
    };

    if (step === 'result') {
        const displayResult = result || mockHealthcareResult;

        return (
            <PageContainer>
                <Header title="건강 분석 결과" showBackButton onBack={() => {
                    setStep('intro');
                    setMode('main');
                }} />

                <ContentWrapper>
                    <VideoPreviewCard>
                        {displayResult.resultImages.overlayVideoUrl ? (
                            <PreviewVideo
                                src={displayResult.resultImages.overlayVideoUrl}
                                controls
                                playsInline
                            />
                        ) : (
                            <PreviewImage src={mascotImage.src} alt="분석 결과" />
                        )}
                    </VideoPreviewCard>

                    <RiskLevelBadge level={displayResult.overallRiskLevel}>
                        {displayResult.overallRiskLevel === 'LOW' && '🟢 위험도: 낮음'}
                        {displayResult.overallRiskLevel === 'MEDIUM' && '🟡 위험도: 보통'}
                        {displayResult.overallRiskLevel === 'HIGH' && '🔴 위험도: 높음'}
                    </RiskLevelBadge>

                    {/* AI Summary */}
                    <ResultBubble>
                        <BubbleTitle>AI 분석 요약</BubbleTitle>
                        <BubbleText>{displayResult.summary}</BubbleText>
                    </ResultBubble>

                    <DetailSection>
                        <SectionTitle>상세 분석</SectionTitle>

                        {/* 슬개골 위험도 */}
                        <DetailCard>
                            <DetailCardHeader>
                                <DetailCategory>슬개골 위험도</DetailCategory>
                                <RiskBadge level={displayResult.metrics.patellaRisk.level}>
                                    {displayResult.metrics.patellaRisk.level === 'SAFE' && '안전'}
                                    {displayResult.metrics.patellaRisk.level === 'WARNING' && '주의'}
                                    {displayResult.metrics.patellaRisk.level === 'DANGER' && '위험'}
                                </RiskBadge>
                            </DetailCardHeader>
                            <DetailScore score={displayResult.metrics.patellaRisk.score} level={displayResult.metrics.patellaRisk.level}>{displayResult.metrics.patellaRisk.score}점</DetailScore>
                            <DetailDescription>{displayResult.metrics.patellaRisk.description}</DetailDescription>
                            <ProgressBarContainer>
                                <ProgressBar width={displayResult.metrics.patellaRisk.score} level={displayResult.metrics.patellaRisk.level} />
                            </ProgressBarContainer>
                        </DetailCard>

                        {/* 좌우 보행 균형 */}
                        <DetailCard>
                            <DetailCardHeader>
                                <DetailCategory>좌우 보행 균형</DetailCategory>
                            </DetailCardHeader>
                            <DetailScore score={displayResult.metrics.gaitBalance.score}>{displayResult.metrics.gaitBalance.score}점</DetailScore>
                            <DetailDescription>{displayResult.metrics.gaitBalance.description}</DetailDescription>
                            <ProgressBarContainer>
                                <ProgressBar width={displayResult.metrics.gaitBalance.score} />
                            </ProgressBarContainer>
                        </DetailCard>

                        {/* 무릎 관절 가동성 */}
                        <DetailCard>
                            <DetailCardHeader>
                                <DetailCategory>무릎 관절 가동성</DetailCategory>
                            </DetailCardHeader>
                            <DetailScore score={displayResult.metrics.kneeMobility.score}>{displayResult.metrics.kneeMobility.score}점</DetailScore>
                            <DetailDescription>{displayResult.metrics.kneeMobility.description}</DetailDescription>
                            <ProgressBarContainer>
                                <ProgressBar width={displayResult.metrics.kneeMobility.score} />
                            </ProgressBarContainer>
                        </DetailCard>

                        {/* 보행 안정성 */}
                        <DetailCard>
                            <DetailCardHeader>
                                <DetailCategory>보행 안정성</DetailCategory>
                            </DetailCardHeader>
                            <DetailScore score={displayResult.metrics.gaitStability.score}>{displayResult.metrics.gaitStability.score}점</DetailScore>
                            <DetailDescription>{displayResult.metrics.gaitStability.description}</DetailDescription>
                            <ProgressBarContainer>
                                <ProgressBar width={displayResult.metrics.gaitStability.score} />
                            </ProgressBarContainer>
                        </DetailCard>

                        {/* 보행 리듬 */}
                        <DetailCard>
                            <DetailCardHeader>
                                <DetailCategory>보행 리듬</DetailCategory>
                            </DetailCardHeader>
                            <DetailScore score={displayResult.metrics.gaitRhythm.score}>{displayResult.metrics.gaitRhythm.score}점</DetailScore>
                            <DetailDescription>{displayResult.metrics.gaitRhythm.description}</DetailDescription>
                            <ProgressBarContainer>
                                <ProgressBar width={displayResult.metrics.gaitRhythm.score} />
                            </ProgressBarContainer>
                        </DetailCard>
                    </DetailSection>

                    <GuideTooltip>
                        * 분석 결과는 진단이 아닙니다. 수의사와 상담하세요.
                    </GuideTooltip>

                    <RetryButton onClick={() => {
                        setStep('intro');
                        setMode('main');
                    }}>
                        다시 검사하기
                    </RetryButton>
                </ContentWrapper>
            </PageContainer>
        );
    }

    return (
        <PageContainer isFullScreen={mode === 'record'}>
            <Header title="건강 체크" showBackButton={mode !== 'record' || isCameraIdle} onBack={handleCancel} />

            <ContentWrapper isFullScreen={mode === 'record'}>
                {mode === 'main' && (
                    <>
                        <HealthcareMainSection
                            onUpload={handleUpload}
                            onRecord={handleRecord}
                            onHelp={openOnboarding}
                        />
                        <GuideBox>
                            <GuideText>• 반려견이 걷는 모습을 측면으로 촬영해주세요. 🐕</GuideText>
                            <GuideText>• 버튼을 누르면 촬영이 시작됩니다.</GuideText>
                            <GuideText>• 촬영은 10초간 진행되며, 자동으로 종료됩니다.</GuideText>
                        </GuideBox>
                    </>
                )}

                {mode === 'upload' && (
                    <VideoUploadSection
                        onCancel={() => setMode('main')}
                        onComplete={handleComplete}
                    />
                )}

                {mode === 'record' && (
                    <HealthcareCamera
                        onComplete={handleComplete}
                        onIdleChange={setIsCameraIdle}
                        guideContent={
                            <GuideBox>
                                <GuideText>• 반려견이 걷는 모습을 측면으로 촬영해주세요. 🐕</GuideText>
                                <GuideText>• 버튼을 누르면 촬영이 시작됩니다.</GuideText>
                                <GuideText>• 촬영은 10초간 진행되며, 자동으로 종료됩니다.</GuideText>
                            </GuideBox>
                        }
                    />
                )}
            </ContentWrapper>

            {showOnboarding && <HealthcareGuideOverlay onClose={closeOnboarding} />}
        </PageContainer>
    );
};
