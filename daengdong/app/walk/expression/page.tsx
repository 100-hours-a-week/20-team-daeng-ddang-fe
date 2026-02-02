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
import { useConfirmPageLeave } from "@/shared/hooks/useConfirmPageLeave";
import { useLoadingStore } from "@/shared/stores/useLoadingStore";

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
  const { showLoading, hideLoading } = useLoadingStore();

  const [isIdle, setIsIdle] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 페이지 이탈 방지 
  // 촬영 전/중/후 모두 새로고침 방지
  useConfirmPageLeave(
    true,
    "페이지를 새로고침하면 진행 중인 작업이 취소됩니다."
  );

  const walkId = useMemo(() => {
    const param = searchParams.get("walkId");
    if (param && !Number.isNaN(Number(param))) return Number(param);
    return walkIdFromStore ?? undefined;
  }, [searchParams, walkIdFromStore]);

  const handleCancel = () => {
    if (walkId) {
      router.replace(`/walk/complete/${walkId}`);
      return;
    }
    router.replace("/walk");
  };

  const handleAnalyze = async (videoBlob: Blob) => {
    setIsAnalyzing(true);
    showLoading("표정 분석 중입니다...");
    try {
      if (!walkId) {
        throw new Error("산책 정보가 없습니다.");
      }

      const mimeType = videoBlob.type || "video/mp4";

      const presignedData = await fileApi.getPresignedUrl(
        "VIDEO",
        mimeType,
        "EXPRESSION"
      );
      await fileApi.uploadFile(presignedData.presignedUrl, videoBlob, mimeType);
      const videoUrl = presignedData.presignedUrl.split("?")[0];

      const analysis = await expressionApi.analyzeExpression(walkId, { videoUrl });
      setAnalysis(analysis);
      router.replace("/walk/expression/result");
    } catch (e) {
      console.error(e);
      showToast({ message: "분석 실패 : 강아지 얼굴을 찾을 수 없습니다.", type: "error" });
      handleCancel();
    } finally {
      setIsAnalyzing(false);
      hideLoading();
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

