"use client";

import { PeriodType, ScopeType } from "@/entities/ranking/model/types";
import styled from "@emotion/styled";
import { colors, radius, spacing } from "@/shared/styles/tokens";

interface RankingFiltersProps {
    period: PeriodType;
    scope: ScopeType;
    regionName?: string;
    onPeriodChange: (type: PeriodType) => void;
    onScopeChange: (scope: ScopeType) => void;
    onRegionClick: () => void;
}

export const RankingFilters = ({ period, scope, regionName, onPeriodChange, onScopeChange, onRegionClick }: RankingFiltersProps) => {
    return (
        <Container>
            <ScopeSelector>
                <ScopeButton
                    isActive={scope === 'NATIONWIDE'}
                    onClick={() => onScopeChange('NATIONWIDE')}
                >
                    전국
                </ScopeButton>
                <Divider />
                <ScopeButton
                    isActive={scope === 'REGIONAL'}
                    onClick={() => {
                        if (scope === 'REGIONAL') {
                            onRegionClick();
                        } else {
                            onScopeChange('REGIONAL');
                        }
                    }}
                >
                    {scope === 'REGIONAL' ? (regionName || "지역 선택 ▾") : "지역별"}
                    {scope === 'REGIONAL' && <DropdownIcon>▾</DropdownIcon>}
                </ScopeButton>
            </ScopeSelector>

            <PeriodSelector>
                <PeriodTab isActive={period === 'WEEK'} onClick={() => onPeriodChange('WEEK')}>주간</PeriodTab>
                <PeriodTab isActive={period === 'MONTH'} onClick={() => onPeriodChange('MONTH')}>월간</PeriodTab>
                <PeriodTab isActive={period === 'YEAR'} onClick={() => onPeriodChange('YEAR')}>연간</PeriodTab>
            </PeriodSelector>
        </Container>
    );
};

const DropdownIcon = styled.span`
    font-size: 12px;
    margin-left: 4px;
    color: ${colors.gray[500]};
`;

const Container = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${spacing[3]}px ${spacing[4]}px;
    padding-bottom: 0px;
    background-color: white;
`;

const ScopeSelector = styled.div`
    display: flex;
    align-items: center;
    gap: ${spacing[2]}px;
`;

const ScopeButton = styled.button<{ isActive: boolean }>`
    font-size: 18px;
    font-weight: 700;
    color: ${({ isActive }) => (isActive ? colors.gray[900] : colors.gray[400])};
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
`;

const Divider = styled.div`
    width: 1px;
    height: 16px;
    background-color: ${colors.gray[300]};
`;

const PeriodSelector = styled.div`
    display: flex;
    gap: ${spacing[2]}px;
    background-color: ${colors.gray[100]};
    padding: 4px;
    border-radius: ${radius.md};
    min-width: 180px; 
`;

const PeriodTab = styled.button<{ isActive: boolean }>`
    flex: 1;
    padding: 6px 0;
    font-size: 13px;
    font-weight: 600;
    color: ${({ isActive }) => (isActive ? colors.gray[900] : colors.gray[500])};
    background-color: ${({ isActive }) => (isActive ? "white" : "transparent")};
    border-radius: ${radius.sm};
    border: none;
    cursor: pointer;
    box-shadow: ${({ isActive }) => (isActive ? "0 1px 2px rgba(0,0,0,0.05)" : "none")};
    transition: all 0.2s;
`;
