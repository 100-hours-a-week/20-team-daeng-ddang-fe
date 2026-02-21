"use client";

import { useState } from "react";
import styled from "@emotion/styled";
import { Header } from "@/widgets/Header";
import { RankingTabs } from "@/features/ranking/ui/RankingTabs";
import { PersonalRankingView } from "@/features/ranking/ui/PersonalRankingView";
import { RegionalRankingView } from "@/features/ranking/ui/RegionalRankingView";

export const RankingPage = () => {
    const [activeTab, setActiveTab] = useState<'PERSONAL' | 'REGIONAL'>('PERSONAL');

    return (
        <ScreenContainer>
            <Header title="랭킹" showBackButton={false} />
            <RankingTabs activeTab={activeTab} onTabChange={setActiveTab} />

            <Content>
                {activeTab === 'PERSONAL' ? (
                    <PersonalRankingView />
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
    padding-bottom: 70px;
`;

const Content = styled.div`
    flex: 1;
    overflow-y: auto;
    /* Hide scrollbar */
    &::-webkit-scrollbar {
        display: none;
    }
    -ms-overflow-style: none; /* IE & Edge */
    scrollbar-width: none; /* Firefox */
`;
