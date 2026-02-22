"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import styled from '@emotion/styled';
import { spacing, colors } from "@/shared/styles/tokens";
import { PathMapImage } from '@/features/walk/ui/PathMapImage';
import { WalkSummarySection } from '@/features/walk/ui/WalkSummarySection';
import { MissionResultSection } from '@/features/mission/ui/MissionResultSection';
import { WalkLogForm } from '@/features/walk/ui/WalkLogForm';
import { ExpressionJobOverlay } from '@/shared/components/ExpressionJobOverlay';

interface WalkCompletePageProps {
  walkId: string;
}

export const WalkCompletePage = ({ walkId }: WalkCompletePageProps) => {
  const searchParams = useSearchParams();
  const taskId = searchParams?.get("taskId") ?? null;

  const [showExpressionOverlay, setShowExpressionOverlay] = useState(!!taskId);

  return (
    <PageContainer>
      <ContentWrapper>
        <PathMapImage />
        <HeaderTextContainer>
          <MainTitle>🎉 산책 완료!</MainTitle>
          <SubTitle>오늘 걸은 만큼 땅을 차지했어요</SubTitle>
        </HeaderTextContainer>
        <WalkSummarySection />
        <MissionResultSection walkId={parseInt(walkId)} />
        <WalkLogForm hasAnalysis={!!taskId} />
      </ContentWrapper>

      {showExpressionOverlay && taskId && (
        <ExpressionJobOverlay
          walkId={parseInt(walkId)}
          taskId={taskId}
          label="표정 분석"
          onDone={() => setShowExpressionOverlay(false)}
        />
      )}
    </PageContainer>
  );
};

const PageContainer = styled.div`
  min-height: 100vh;
  background-color: white;
  padding-bottom: 80px;
`;

const ContentWrapper = styled.div`
  padding: ${spacing[4]}px;
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
`;

const HeaderTextContainer = styled.div`
  text-align: center;
  margin-top: ${spacing[5]}px;
  margin-bottom: ${spacing[2]}px;
`;

const MainTitle = styled.h2`
  font-size: 24px;
  font-weight: 800;
  color: ${colors.gray[900]};
  margin-bottom: ${spacing[2]}px;
`;

const SubTitle = styled.p`
  font-size: 14px;
  color: ${colors.gray[700]};
`;

export default WalkCompletePage;
