"use client";

import { useState } from "react";
import styled from "@emotion/styled";
import dynamic from "next/dynamic";
import { Header } from "@/widgets/Header";
import { RankingTabs } from "@/features/ranking/ui/RankingTabs";
import { PersonalRankingView } from "@/features/ranking/ui/PersonalRankingView";
import { ApiResponse } from "@/shared/api/types";
import { RankingList, RankingSummary } from "@/entities/ranking/model/types";
import { InfiniteData } from "@tanstack/react-query";

const RegionalRankingView = dynamic(
    () => import("@/features/ranking/ui/RegionalRankingView").then((mod) => mod.RegionalRankingView),
    { ssr: false }
);

interface RankingPageProps {
    initialSummaryData?: ApiResponse<RankingSummary>;
    initialListData?: InfiniteData<ApiResponse<RankingList>, string | undefined>;
}

export const RankingPage = ({ initialSummaryData, initialListData }: RankingPageProps) => {
    const [activeTab, setActiveTab] = useState<'PERSONAL' | 'REGIONAL'>('PERSONAL');

    return (
        <ScreenContainer>
            <Header title="랭킹" showBackButton={false} />
            <RankingTabs activeTab={activeTab} onTabChange={setActiveTab} />

            <Content>
                {activeTab === 'PERSONAL' ? (
                    <PersonalRankingView
                        initialSummaryData={initialSummaryData}
                        initialListData={initialListData}
                    />
                ) : (
                    <RegionalRankingView />
                )}
            </Content>
        </ScreenContainer>
    );
};

export default RankingPage;

const ScreenContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100svh;
    background-color: white;
    padding-bottom: 60px;
`;

const Content = styled.div`
    flex: 1;
    min-height: 0;
    overflow: hidden;
    /* Hide scrollbar */
    &::-webkit-scrollbar {
        display: none;
    }
    -ms-overflow-style: none; /* IE & Edge */
    scrollbar-width: none; /* Firefox */
`;
