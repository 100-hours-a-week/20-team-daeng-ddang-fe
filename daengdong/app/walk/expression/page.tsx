"use client";

import styled from "@emotion/styled";
import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/widgets/Header/Header";
import { spacing, colors, radius } from "@/shared/styles/tokens";
import { ExpressionCamera } from "@/features/expression/ui/ExpressionCamera";
import { useExpressionStore } from "@/entities/expression/model/expressionStore";
import { useToastStore } from "@/shared/stores/useToastStore";
import { useWalkStore } from "@/entities/walk/model/walkStore";
import { fileApi } from "@/shared/api/file";
import { expressionApi } from "@/entities/expression/api/expression";

export default function WalkExpressionPage() {
  return (
    <Suspense fallback={null}>
      <ExpressionContent />
    </Suspense>
  );
}

const ExpressionContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const walkIdFromStore = useWalkStore((state) => state.walkId);
  const { setAnalysis } = useExpressionStore();
  const { showToast } = useToastStore();

  const [isIdle, setIsIdle] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const walkId = useMemo(() => {
    const param = searchParams.get("walkId");
    if (param && !Number.isNaN(Number(param))) return Number(param);
    return walkIdFromStore ?? undefined;
  }, [searchParams, walkIdFromStore]);

  const isMock = searchParams.get("mock") === "1";

  const handleCancel = () => {
    if (walkId) {
      router.replace(`/walk/complete/${walkId}`);
      return;
    }
    router.replace("/walk");
  };

  const handleAnalyze = async (videoBlob: Blob) => {
    setIsAnalyzing(true);
    try {
      if (isMock) {
        setAnalysis({
          expressionId: "12",
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
          walkId: walkId ?? 0,
        });
        router.replace("/walk/expression/result?mock=1");
        return;
      }

      if (!walkId) {
        throw new Error("산책 정보가 없습니다.");
      }

      /*
      const presignedData = await fileApi.getPresignedUrl(
        "VIDEO",
        "video/mp4",
        "EXPRESSION"
      );
      await fileApi.uploadFile(presignedData.presignedUrl, videoBlob, "video/mp4");
      const videoUrl = presignedData.presignedUrl.split("?")[0];
      */

      const videoUrl = "https://daeng-map.s3.ap-northeast-2.amazonaws.com/test_set2/ANGRY_01.mp4";

      const analysis = await expressionApi.analyzeExpression(walkId, { videoUrl });
      setAnalysis(analysis);
      router.replace("/walk/expression/result");
    } catch (e) {
      console.error(e);
      showToast({ message: "분석에 실패했습니다. 잠시 후 다시 시도해주세요.", type: "error" });
      handleCancel();
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <PageContainer>
      <Header title="반려견 표정 분석" showBackButton={isIdle} onBack={handleCancel} />

      <ContentWrapper>
        <ExpressionCamera
          onAnalyze={handleAnalyze}
          onIdleChange={setIsIdle}
          onAnalyzingChange={setIsAnalyzing}
          guideContent={
            <GuideBox>
              {!isAnalyzing ? (
                <>
                  <GuideText>버튼을 누르면 3초 카운트 다운 후, 시작됩니다.</GuideText>
                  <GuideText>촬영은 5초간 진행됩니다.</GuideText>
                </>
              ) : (
                <>
                  <GuideText>분석 도중 오류 발생 시, 이전 페이지로 자동으로 이동합니다.</GuideText>
                  <GuideText>최대 3분 소요됩니다.</GuideText>
                </>
              )}
            </GuideBox>
          }
        />
      </ContentWrapper>

      {isAnalyzing && (
        <LoadingOverlay>
          <LoadingCard>
            <Spinner />
            <LoadingText>표정 분석 중입니다...</LoadingText>
          </LoadingCard>
        </LoadingOverlay>
      )}
    </PageContainer>
  );
};

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
  gap: ${spacing[4]}px;
  padding: ${spacing[4]}px ${spacing[4]}px ${spacing[6]}px;
`;

const GuideBox = styled.div`
  padding: ${spacing[3]}px;
  background: ${colors.gray[50]};
  border-radius: ${radius.md};
  display: flex;
  flex-direction: column;
  gap: ${spacing[1]}px;
`;

const GuideText = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${colors.gray[700]};
  line-height: 1.5;
`;

const LoadingOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const LoadingCard = styled.div`
  width: 80%;
  max-width: 280px;
  background: white;
  border-radius: ${radius.lg};
  padding: ${spacing[5]}px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[3]}px;
`;

const LoadingText = styled.p`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: ${colors.gray[800]};
`;

const Spinner = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 4px solid ${colors.gray[200]};
  border-top-color: ${colors.primary[500]};
  animation: spin 0.9s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;
