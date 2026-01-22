"use client";

import styled from '@emotion/styled';
import { radius, spacing, colors } from "@/shared/styles/tokens";
import { PathMapImage } from '@/features/walk/ui/PathMapImage';
import { WalkSummarySection } from '@/features/walk/ui/WalkSummarySection';
import { MissionResultSection } from '@/features/missions/ui/MissionResultSection';
import { WalkLogForm } from '@/features/walk/ui/WalkLogForm';

import { use } from 'react';

export default function WalkCompletePage({ params }: { params: Promise<{ walkId: string }> }) {
  const { walkId } = use(params);

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
        <WalkLogForm />
      </ContentWrapper>
    </PageContainer>
  );
}

const PageContainer = styled.div`
  min-height: 100vh;
  background-color: white;
  padding-bottom: 80px; /* Space for BottomNav */
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
