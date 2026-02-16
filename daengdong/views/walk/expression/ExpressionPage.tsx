"use client";

import styled from "@emotion/styled";
import { Header } from "@/widgets/Header";
import { spacing, colors, radius } from "@/shared/styles/tokens";
import { ExpressionCamera } from "@/features/expression/ui/ExpressionCamera";
import { useConfirmPageLeave } from "@/shared/hooks/useConfirmPageLeave";
import { useExpressionAnalysis } from "@/features/expression/model/useExpressionAnalysis";

const ExpressionPage = () => {
    const {
        isIdle,
        setIsIdle,
        isAnalyzing,
        setIsAnalyzing,
        handleAnalyze,
        handleCancel
    } = useExpressionAnalysis();

    useConfirmPageLeave(
        true,
        "페이지를 새로고침하면 진행 중인 작업이 취소됩니다."
    );

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

export default ExpressionPage;
