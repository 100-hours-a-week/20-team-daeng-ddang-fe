"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Header } from "@/widgets/Header";
import { HealthcareMainSection } from "@/features/healthcare/ui/HealthcareMainSection";
import { VideoUploadSection } from "@/features/healthcare/ui/VideoUploadSection";
import { HealthcareCamera } from "@/features/healthcare/ui/HealthcareCamera";
import { HealthcareGuideOverlay } from "@/features/healthcare/ui/HealthcareGuideOverlay";
import { useHealthcareStore } from "@/entities/healthcare/model/healthcareStore";
import { useOnboarding } from "@/shared/hooks/useOnboarding";
import mascotImage from "@/shared/assets/images/mascot.png";
import { useHealthcareMutations } from "@/features/healthcare/model/useHealthcareMutations";
import { useAuthStore } from "@/entities/session/model/store";
import { useModalStore } from "@/shared/stores/useModalStore";
import { useConfirmPageLeave } from "@/shared/hooks/useConfirmPageLeave";
import { ChatbotSection } from "@/features/chatbot/ui/ChatbotSection";
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
    GuideText,
    formatLevelToKorean,
    FabWrapper,
    TooltipBubble,
    ChatFab
} from "./_style";

export const HealthcarePage = () => {
    const router = useRouter();
    const { step, setStep, result } = useHealthcareStore();
    const { showOnboarding, openOnboarding, closeOnboarding } = useOnboarding('hasVisitedHealthcare');
    const { uploadAndAnalyze } = useHealthcareMutations();
    const { openModal } = useModalStore();

    const [mode, setMode] = useState<'main' | 'upload' | 'record' | 'chatbot'>('main');
    const [isCameraIdle, setIsCameraIdle] = useState(true);

    useConfirmPageLeave(mode === 'record' && !isCameraIdle);


    const handleCancel = () => {
        if (mode === 'main') {
            router.back();
        } else {
            setMode('main');
        }
    };

    const requireLogin = (onSuccess: () => void) => {
        const isLoggedIn = useAuthStore.getState().isLoggedIn;
        if (!isLoggedIn) {
            openModal({
                title: "로그인이 필요해요!",
                message: "해당 기능을 사용하려면 로그인이 필요해요.\n로그인 페이지로 이동할까요?",
                type: "confirm",
                confirmText: "로그인하기",
                cancelText: "취소",
                onConfirm: () => {
                    router.push("/login");
                },
            });
        } else {
            onSuccess();
        }
    };

    const requireAvailableTime = (onSuccess: () => void) => {
        const currentHour = new Date().getHours();
        const available = currentHour >= 9 && currentHour < 21;
        if (!available) {
            openModal({
                title: "이용 시간 안내",
                message: "현재 헬스케어 분석은\n오전 9시부터 오후 9시까지만\n이용이 가능합니다.",
                type: "alert",
                confirmText: "확인",
                onConfirm: () => { }
            });
        } else {
            onSuccess();
        }
    };

    const handleUpload = () => {
        requireAvailableTime(() => {
            requireLogin(() => setMode('upload'));
        });
    };

    const handleRecord = () => {
        requireAvailableTime(() => {
            requireLogin(() => setMode('record'));
        });
    };

    const handleChat = () => {
        requireLogin(() => setMode('chatbot'));
    };

    const handleComplete = async (videoBlob: Blob, backVideoBlob?: Blob) => {
        try {
            await uploadAndAnalyze(videoBlob, backVideoBlob);
        } catch {
            setMode('main');
        }
    };

    if (step === 'result' && result) {
        const displayResult = result;

        return (
            <PageContainer>
                <Header title="건강 분석 결과" showBackButton onBack={() => {
                    setStep('intro');
                    setMode('main');
                }} />

                <ContentWrapper>
                    <VideoPreviewCard>
                        {displayResult.artifacts?.keypointOverlayVideoUrl ? (
                            <PreviewVideo
                                src={displayResult.artifacts.keypointOverlayVideoUrl}
                                preload="auto"
                                controls
                                playsInline
                            />
                        ) : (
                            <PreviewImage src={mascotImage.src} alt="분석 결과" />
                        )}
                    </VideoPreviewCard>

                    <RiskLevelBadge level={displayResult.overallRiskLevel}>
                        {displayResult.overallRiskLevel === 'low' && '🟢 위험도: 낮음'}
                        {displayResult.overallRiskLevel === 'medium' && '🟡 위험도: 보통'}
                        {displayResult.overallRiskLevel === 'high' && '🔴 위험도: 높음'}
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
                                <RiskBadge level={displayResult.metrics.patellaRiskSignal.level}>
                                    {formatLevelToKorean(displayResult.metrics.patellaRiskSignal.level)}
                                </RiskBadge>
                            </DetailCardHeader>
                            <DetailScore score={displayResult.metrics.patellaRiskSignal.score} level={displayResult.metrics.patellaRiskSignal.level}>{displayResult.metrics.patellaRiskSignal.score}점</DetailScore>
                            <DetailDescription>{displayResult.metrics.patellaRiskSignal.description}</DetailDescription>
                            <ProgressBarContainer>
                                <ProgressBar width={displayResult.metrics.patellaRiskSignal.score} level={displayResult.metrics.patellaRiskSignal.level} />
                            </ProgressBarContainer>
                        </DetailCard>

                        {/* 좌우 보행 균형 */}
                        <DetailCard>
                            <DetailCardHeader>
                                <DetailCategory>좌우 보행 균형</DetailCategory>
                                <RiskBadge level={displayResult.metrics.gaitBalance.level}>
                                    {formatLevelToKorean(displayResult.metrics.gaitBalance.level)}
                                </RiskBadge>
                            </DetailCardHeader>
                            <DetailScore score={displayResult.metrics.gaitBalance.score} level={displayResult.metrics.gaitBalance.level}>{displayResult.metrics.gaitBalance.score}점</DetailScore>
                            <DetailDescription>{displayResult.metrics.gaitBalance.description}</DetailDescription>
                            <ProgressBarContainer>
                                <ProgressBar width={displayResult.metrics.gaitBalance.score} level={displayResult.metrics.gaitBalance.level} />
                            </ProgressBarContainer>
                        </DetailCard>

                        {/* 무릎 관절 가동성 */}
                        <DetailCard>
                            <DetailCardHeader>
                                <DetailCategory>무릎 관절 가동성</DetailCategory>
                                <RiskBadge level={displayResult.metrics.kneeMobility.level}>
                                    {formatLevelToKorean(displayResult.metrics.kneeMobility.level)}
                                </RiskBadge>
                            </DetailCardHeader>
                            <DetailScore score={displayResult.metrics.kneeMobility.score} level={displayResult.metrics.kneeMobility.level}>{displayResult.metrics.kneeMobility.score}점</DetailScore>
                            <DetailDescription>{displayResult.metrics.kneeMobility.description}</DetailDescription>
                            <ProgressBarContainer>
                                <ProgressBar width={displayResult.metrics.kneeMobility.score} level={displayResult.metrics.kneeMobility.level} />
                            </ProgressBarContainer>
                        </DetailCard>

                        {/* 보행 안정성 */}
                        <DetailCard>
                            <DetailCardHeader>
                                <DetailCategory>보행 안정성</DetailCategory>
                                <RiskBadge level={displayResult.metrics.gaitStability.level}>
                                    {formatLevelToKorean(displayResult.metrics.gaitStability.level)}
                                </RiskBadge>
                            </DetailCardHeader>
                            <DetailScore score={displayResult.metrics.gaitStability.score} level={displayResult.metrics.gaitStability.level}>{displayResult.metrics.gaitStability.score}점</DetailScore>
                            <DetailDescription>{displayResult.metrics.gaitStability.description}</DetailDescription>
                            <ProgressBarContainer>
                                <ProgressBar width={displayResult.metrics.gaitStability.score} level={displayResult.metrics.gaitStability.level} />
                            </ProgressBarContainer>
                        </DetailCard>

                        {/* 보행 리듬 */}
                        <DetailCard>
                            <DetailCardHeader>
                                <DetailCategory>보행 리듬</DetailCategory>
                                <RiskBadge level={displayResult.metrics.gaitRhythm.level}>
                                    {formatLevelToKorean(displayResult.metrics.gaitRhythm.level)}
                                </RiskBadge>
                            </DetailCardHeader>
                            <DetailScore score={displayResult.metrics.gaitRhythm.score} level={displayResult.metrics.gaitRhythm.level}>{displayResult.metrics.gaitRhythm.score}점</DetailScore>
                            <DetailDescription>{displayResult.metrics.gaitRhythm.description}</DetailDescription>
                            <ProgressBarContainer>
                                <ProgressBar width={displayResult.metrics.gaitRhythm.score} level={displayResult.metrics.gaitRhythm.level} />
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

                <FabWrapper>
                    <TooltipBubble>
                        궁금한 점이 있나요? 🐾
                    </TooltipBubble>
                    <ChatFab onClick={handleChat}>
                        <Image src={mascotImage} alt="AI 챗봇" width={40} height={40} style={{ objectFit: 'contain' }} />
                    </ChatFab>
                </FabWrapper>
            </PageContainer>
        );
    }

    if (mode === 'chatbot') {
        return (
            <PageContainer isFullScreen>
                <Header title="AI 챗봇 상담" showBackButton onBack={() => setMode('main')} />
                <ChatbotSection />
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <Header title="헬스 케어" showBackButton={mode !== 'main' && (mode !== 'record' || isCameraIdle)} onBack={handleCancel} />

            <ContentWrapper>
                {mode === 'main' && (
                    <>
                        <HealthcareMainSection
                            onUpload={handleUpload}
                            onRecord={handleRecord}
                            onChat={handleChat}
                            onHelp={openOnboarding}
                        />
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

            <HealthcareGuideOverlay isOpen={showOnboarding} onClose={closeOnboarding} />
        </PageContainer>
    );
};

export default HealthcarePage;
