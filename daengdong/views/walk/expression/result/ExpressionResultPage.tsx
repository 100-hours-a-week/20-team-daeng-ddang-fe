"use client";

import styled from "@emotion/styled";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/widgets/Header";
import { colors, radius, spacing } from "@/shared/styles/tokens";
import { ExpressionAnalysis, PredictEmotion } from "@/entities/expression/model/types";
import mascotImage from "@/shared/assets/images/mascot.png";
import { useExpressionResult } from "@/features/expression/model/useExpressionResult";

const EMOTION_LABELS: Record<PredictEmotion, string> = {
  HAPPY: "행복해요",
  RELAXED: "편안해요",
  SAD: "조금 슬퍼요",
  ANGRY: "화가 난 것 같아요",
};

const EMOTION_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  happy: { label: "행복", icon: "🥰", color: "#FFB74D" },
  relaxed: { label: "편안", icon: "🌿", color: "#81C784" },
  sad: { label: "슬픔", icon: "💧", color: "#64B5F6" },
  angry: { label: "화남", icon: "💢", color: "#E57373" },
};

function ExpressionResultPage() {
  const { analysis, scores, handleComplete } = useExpressionResult();
  const [isFlipped, setIsFlipped] = useState(false);

  const result = useMemo<ExpressionAnalysis | undefined>(() => {
    return analysis ?? undefined;
  }, [analysis]);

  if (!result) return null;
  return (

    <PageContainer>
      <Header title="표정 분석 결과" showBackButton={false} />

      <ContentWrapper>
        <HintText>이미지를 클릭해보세요</HintText>

        <CardWrapper onClick={() => setIsFlipped((prev) => !prev)}>
          <motion.div
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6 }}
            style={{ width: "100%", height: "100%", transformStyle: "preserve-3d" }}
          >
            <CardFront>
              {result.videoUrl ? (
                <DogVideo src={result.videoUrl} autoPlay loop muted playsInline />
              ) : (
                <DogImage src={result.imageUrl || mascotImage.src} alt="반려견 사진" />
              )}
            </CardFront>
            <CardBack>
              <BackTitle>감정 상세 분석</BackTitle>
              <ScoreList>
                {Object.entries(scores).map(([key, value]) => {
                  const config = EMOTION_CONFIG[key] || { label: key, icon: "❓", color: colors.gray[500] };
                  const percent = Math.round(value * 100);

                  return (
                    <ScoreItem key={key}>
                      <ScoreHeader>
                        <ScoreLabel>
                          <Icon>{config.icon}</Icon> {config.label}
                        </ScoreLabel>
                        <ScoreValue color={config.color}>{percent}%</ScoreValue>
                      </ScoreHeader>
                      <ProgressBar>
                        <ProgressFill
                          width={percent}
                          color={config.color}
                          initial={{ width: 0 }}
                          animate={{ width: `${percent}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                        />
                      </ProgressBar>
                    </ScoreItem>
                  );
                })}
              </ScoreList>
            </CardBack>
          </motion.div>
        </CardWrapper>

        <Bubble>
          <BubbleTitle>{EMOTION_LABELS[result.predictEmotion as PredictEmotion] || result.predictEmotion}</BubbleTitle>
          <BubbleText>{result.summary}</BubbleText>
        </Bubble>
        <DisclaimerText>분석 결과는 100% 정확하지 않을 수 있습니다.</DisclaimerText>
        <CompleteButton onClick={handleComplete}>완료</CompleteButton>
      </ContentWrapper>
    </PageContainer>
  );
}

const PageContainer = styled.div`
  min-height: 100svh;
  background: white;
  display: flex;
  flex-direction: column;
`;

const ContentWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[4]}px;
  padding: ${spacing[5]}px ${spacing[4]}px ${spacing[6]}px;
`;

const HintText = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${colors.gray[700]};
`;

const CardWrapper = styled.div`
  width: 100%;
  max-width: 320px;
  aspect-ratio: 1 / 1;
  perspective: 1000px;
  position: relative;
  cursor: pointer;
`;

const CardBase = styled.div`
  width: 100%;
  height: 100%;
  border-radius: ${radius.lg};
  overflow: hidden;
  backface-visibility: hidden;
  position: absolute;
  top: 0;
  left: 0;
`;

const CardFront = styled(CardBase)`
  background: ${colors.gray[100]};
`;

const CardBack = styled(CardBase)`
  background: white;
  border: 1px solid ${colors.gray[200]};
  transform: rotateY(180deg);
  display: flex;
  flex-direction: column;
  gap: ${spacing[2]}px;
  padding: ${spacing[4]}px;
`;

const DogImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const DogVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const BackTitle = styled.h3`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: ${colors.gray[900]};
`;

const ScoreList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  margin-top: 12px;
`;

const ScoreItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ScoreHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ScoreLabel = styled.span`
  font-size: 18px;
  font-weight: 600;
  color: ${colors.gray[800]};
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Icon = styled.span`
  font-size: 20px;
`;

const ScoreValue = styled.span<{ color: string }>`
  font-size: 20px;
  font-weight: 800;
  color: ${({ color }) => color};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 10px;
  background-color: ${colors.gray[100]};
  border-radius: 5px;
  overflow: hidden;
`;

const ProgressFill = styled(motion.div) <{ width: number; color: string }>`
  height: 100%;
  background-color: ${({ color }) => color};
  border-radius: 5px;
`;

const Bubble = styled.div`
  width: 100%;
  max-width: 320px;
  background: white;
  border: 1px solid ${colors.gray[200]};
  border-radius: 20px;
  padding: ${spacing[4]}px;
  position: relative;
`;

const BubbleTitle = styled.p`
  margin: 0 0 ${spacing[2]}px;
  font-weight: 700;
  font-size: 16px;
  color: ${colors.gray[900]};
`;

const BubbleText = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${colors.gray[700]};
  line-height: 1.5;
`;

const CompleteButton = styled.button`
  width: 100%;
  max-width: 320px;
  padding: 16px;
  border-radius: ${radius.md};
  border: none;
  background: ${colors.primary[500]};
  color: white;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
`;

const DisclaimerText = styled.p`
  margin: 0;
  font-size: 12px;
  color: ${colors.gray[500]};
  text-align: center;
  margin-top: -8px;
`;

export default ExpressionResultPage;
