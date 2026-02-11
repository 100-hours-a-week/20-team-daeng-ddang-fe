"use client";

import { useState } from "react";
import styled from "@emotion/styled";
import { format } from "date-fns";
import { colors } from "@/shared/styles/tokens";
import { CalendarSection } from "./CalendarSection";
import { RecordListSection } from "./RecordListSection";
import { DailyRecordItem } from "@/entities/footprints/model/types";
import { WalkDetailScreen } from "./WalkDetailScreen";
import { HealthcareDetailScreen } from "./HealthcareDetailScreen";
import { Header } from "@/widgets/Header";

export default function FootprintsScreen() {

    const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [viewDate, setViewDate] = useState({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1
    });
    const [selectedRecord, setSelectedRecord] = useState<DailyRecordItem | null>(null);

    const handleDateSelect = (date: string) => {
        setSelectedDate(date);
    };

    const handleMonthChange = (year: number, month: number) => {
        setViewDate({ year, month });
    };

    const handleRecordClick = (record: DailyRecordItem) => {
        setSelectedRecord(record);
    };

    const handleBack = () => {
        setSelectedRecord(null);
    };

    if (selectedRecord?.type === 'WALK') {
        return (
            <WalkDetailScreen
                walkId={selectedRecord.id}
                onBack={handleBack}
            />
        );
    }

    if (selectedRecord?.type === 'HEALTH') {
        return (
            <HealthcareDetailScreen
                healthcareId={selectedRecord.id}
                onBack={handleBack}
            />
        );
    }

    return (
        <ScreenContainer>
            <Content>
                <Header title="발자국" showBackButton={false} isSticky={false} />
                <CalendarSection
                    year={viewDate.year}
                    month={viewDate.month}
                    selectedDate={selectedDate}
                    onDateSelect={handleDateSelect}
                    onMonthChange={handleMonthChange}
                />

                <RecordListSection
                    selectedDate={selectedDate}
                    onRecordClick={handleRecordClick}
                />
            </Content>
        </ScreenContainer>
    );
}

const ScreenContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100vh;
    height: 100dvh; 
    background-color: ${colors.gray[50]};
    overflow: hidden; 
`;

const Content = styled.div`
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    padding-bottom: 90px; 
    /* Hide scrollbar */
    &::-webkit-scrollbar {
        display: none;
    }
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
`;
