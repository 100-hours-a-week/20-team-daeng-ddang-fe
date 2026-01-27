"use client";

import styled from "@emotion/styled";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Header } from "@/widgets/Header/Header";
import { colors, radius, spacing } from "@/shared/styles/tokens";
import { useExpressionStore } from "@/entities/expression/model/expressionStore";
import { ExpressionAnalysis, PredictEmotion } from "@/entities/expression/model/types";

const EMOTION_LABELS: Record<PredictEmotion, string> = {
  HAPPY: "행복해요",
  RELAXED: "편안해요",
  SAD: "조금 슬퍼요",
  ANGRY: "화가 난 것 같아요",
};

export default function ExpressionResultPage() {
  const router = useRouter();
  const { analysis, clearAnalysis } = useExpressionStore();
  const [isFlipped, setIsFlipped] = useState(false);

  const result = useMemo<ExpressionAnalysis>(() => {
    if (analysis) return analysis;
    return {
      expressionId: 12,
      predictEmotion: "HAPPY",
      emotionScores: {
        happy: 0.82,
        relaxed: 0.1,
        sad: 0.05,
        angry: 0.03,
      },
      summary: "산책 후 반려견이 전반적으로 편안하고 즐거운 상태로 보입니다.",
      imageUrl: "https://cdn.example.com/expressions/expr_12.jpg",
      createdAt: "2026-01-08T16:40:13",
      dogId: 3,
      walkId: 0,
    };
  }, [analysis]);

  const handleComplete = () => {
    clearAnalysis();
    if (result.walkId) {
      router.replace(`/walk/complete/${result.walkId}`);
      return;
    }
    router.replace("/walk");
  };

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
              <DogImage src={result.imageUrl} alt="반려견 사진" />
            </CardFront>
            <CardBack>
              <BackTitle>감정 점수</BackTitle>
              <ScoreRow>
                <ScoreLabel>행복</ScoreLabel>
                <ScoreValue>{Math.round(result.emotionScores.happy * 100)}%</ScoreValue>
              </ScoreRow>
              <ScoreRow>
                <ScoreLabel>편안</ScoreLabel>
                <ScoreValue>{Math.round(result.emotionScores.relaxed * 100)}%</ScoreValue>
              </ScoreRow>
              <ScoreRow>
                <ScoreLabel>슬픔</ScoreLabel>
                <ScoreValue>{Math.round(result.emotionScores.sad * 100)}%</ScoreValue>
              </ScoreRow>
              <ScoreRow>
                <ScoreLabel>화남</ScoreLabel>
                <ScoreValue>{Math.round(result.emotionScores.angry * 100)}%</ScoreValue>
              </ScoreRow>
            </CardBack>
          </motion.div>
        </CardWrapper>

        <Bubble>
          <BubbleTitle>{EMOTION_LABELS[result.predictEmotion]}</BubbleTitle>
          <BubbleText>{result.summary}</BubbleText>
        </Bubble>

        <CompleteButton onClick={handleComplete}>완료</CompleteButton>
      </ContentWrapper>
    </PageContainer>
  );
}

const PageContainer = styled.div`
  min-height: 100vh;
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

const BackTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: ${colors.gray[900]};
`;

const ScoreRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: ${colors.gray[700]};
`;

const ScoreLabel = styled.span`
  font-weight: 500;
`;

const ScoreValue = styled.span`
  font-weight: 700;
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
