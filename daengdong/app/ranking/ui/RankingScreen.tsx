"use client";

import { useState } from "react";
import styled from "@emotion/styled";
import { Header } from "@/widgets/Header";
import { RankingTabs } from "@/features/ranking/ui/RankingTabs";
import { PersonalRankingView } from "@/features/ranking/ui/PersonalRankingView";
import { UnderConstruction } from "@/widgets/UnderConstruction";

export const RankingScreen = () => {
    const [activeTab, setActiveTab] = useState<'PERSONAL' | 'REGIONAL'>('PERSONAL');

    return (
        <ScreenContainer>
            <Header title="랭킹" showBackButton={false} />
            <RankingTabs activeTab={activeTab} onTabChange={setActiveTab} />

            <Content>
                {activeTab === 'PERSONAL' ? (
                    <PersonalRankingView />
                ) : (
                    <UnderConstruction title="지역 랭킹 준비 중" message="우리 동네 랭킹 기능은 곧 오픈될 예정입니다!" />
                )}
            </Content>
        </ScreenContainer>
    );
};

const ScreenContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100vh;
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
