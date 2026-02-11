"use client";

import styled from "@emotion/styled";
import { colors, spacing } from "@/shared/styles/tokens";
import { motion } from "framer-motion";

interface RankingTabsProps {
    activeTab: 'PERSONAL' | 'REGIONAL';
    onTabChange: (tab: 'PERSONAL' | 'REGIONAL') => void;
}

export const RankingTabs = ({ activeTab, onTabChange }: RankingTabsProps) => {
    return (
        <Container>
            <Tab
                isActive={activeTab === 'PERSONAL'}
                onClick={() => onTabChange('PERSONAL')}
            >
                개인 랭킹
                {activeTab === 'PERSONAL' && <ActiveIndicator layoutId="activeTab" />}
            </Tab>
            <Tab
                isActive={activeTab === 'REGIONAL'}
                onClick={() => onTabChange('REGIONAL')}
            >
                지역 랭킹
                {activeTab === 'REGIONAL' && <ActiveIndicator layoutId="activeTab" />}
            </Tab>
        </Container>
    );
};

const Container = styled.div`
    display: flex;
    border-bottom: 1px solid ${colors.gray[200]};
    background-color: white;
`;

const Tab = styled.button<{ isActive: boolean }>`
    flex: 1;
    padding: ${spacing[3]}px 0;
    font-size: 16px;
    font-weight: ${({ isActive }) => (isActive ? 700 : 500)};
    color: ${({ isActive }) => (isActive ? colors.primary[600] : colors.gray[500])};
    border: none;
    background: none;
    cursor: pointer;
    position: relative;
    outline: none;
`;

const ActiveIndicator = styled(motion.div)`
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background-color: ${colors.primary[600]};
`;
