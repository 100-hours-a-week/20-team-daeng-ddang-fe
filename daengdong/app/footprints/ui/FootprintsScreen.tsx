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
            <Header title="발자국" showBackButton={false} />

            <Content>
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
    background-color: ${colors.gray[50]};
    padding-bottom: 70px;
`;

const Content = styled.div`
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
`;
