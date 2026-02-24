"use client";

import { useState } from "react";
import styled from "@emotion/styled";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from "date-fns";
import { ko } from "date-fns/locale";
import { colors, radius, spacing } from "@/shared/styles/tokens";
import { useFootprintsCalendarQuery } from "@/features/footprints/api/useFootprintsQuery";
import { CalendarDayMeta } from "@/entities/footprints/model/types";
import { ScrollDatePicker } from "@/widgets/ScrollDatePicker";

interface CalendarSectionProps {
    year: number;
    month: number;
    selectedDate: string;
    onDateSelect: (date: string) => void;
    onMonthChange: (year: number, month: number) => void;
}

export const CalendarSection = ({ year, month, selectedDate, onDateSelect, onMonthChange }: CalendarSectionProps) => {
    const { data: footprintsData } = useFootprintsCalendarQuery(year, month);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

    const monthStartDate = startOfMonth(new Date(year, month - 1));
    const monthEndDate = endOfMonth(monthStartDate);
    const startDate = startOfWeek(monthStartDate);
    const endDate = endOfWeek(monthEndDate);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    const handlePrevMonth = () => {
        const newDate = subMonths(monthStartDate, 1);
        onMonthChange(newDate.getFullYear(), newDate.getMonth() + 1);
    };

    const handleNextMonth = () => {
        const newDate = addMonths(monthStartDate, 1);
        onMonthChange(newDate.getFullYear(), newDate.getMonth() + 1);
    };

    const handleDateConfirm = (dateStr: string) => {
        const date = new Date(dateStr);
        onMonthChange(date.getFullYear(), date.getMonth() + 1);
        onDateSelect(dateStr);
    };

    const getMetaForDate = (dateStr: string): CalendarDayMeta | undefined => {
        return footprintsData?.find(d => d.date === dateStr);
    };

    while (day <= endDate) {
        for (let i = 0; i < 7; i++) {
            formattedDate = format(day, "yyyy-MM-dd");
            const isSelected = isSameDay(day, new Date(selectedDate));
            const isCurrentMonth = isSameMonth(day, monthStartDate);
            const meta = getMetaForDate(formattedDate);
            const cloneDay = day;

            days.push(
                <DayCell
                    key={day.toString()}
                    onClick={() => onDateSelect(format(cloneDay, "yyyy-MM-dd"))}
                >
                    <DayContent
                        isSelected={isSelected}
                        isCurrentMonth={isCurrentMonth}
                        walkLevel={meta?.walkIntensityLevel || 0}
                    >
                        {meta?.hasHealthCare && (
                            <HealthDot isOnWalk={(meta?.walkIntensityLevel || 0) > 0} />
                        )}
                        <DayNumber isOnWalk={(meta?.walkIntensityLevel || 0) > 0}>
                            {format(day, "d")}
                        </DayNumber>
                    </DayContent>
                </DayCell>
            );
            day = addDays(day, 1);
        }
        rows.push(<Row key={day.toString()}>{days}</Row>);
        days = [];
    }

    return (
        <Container>
            <Header>
                <NavButton onClick={handlePrevMonth}>&lt;</NavButton>
                <Title onClick={() => setIsDatePickerOpen(true)}>{format(monthStartDate, "yyyy년 M월", { locale: ko })}</Title>
                <NavButton onClick={handleNextMonth}>&gt;</NavButton>
            </Header>
            <WeekDaysRow>
                {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
                    <WeekDay key={i}>{d}</WeekDay>
                ))}
            </WeekDaysRow>
            <Body>{rows}</Body>

            <ScrollDatePicker
                isOpen={isDatePickerOpen}
                onClose={() => setIsDatePickerOpen(false)}
                onConfirm={handleDateConfirm}
                initialDate={format(monthStartDate, "yyyy-MM-dd")}
                mode="yearMonth"
            />
        </Container>
    );
};

const Container = styled.div`
    background-color: white;
    padding: ${spacing[4]}px;
    border-bottom-left-radius: ${radius.lg};
    border-bottom-right-radius: ${radius.lg};
    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${spacing[4]}px;
    padding: 0 ${spacing[4]}px;
`;

const Title = styled.h2`
    font-size: 15px;
    font-weight: 600;
    color: ${colors.gray[900]};
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;

    /* Add a subtle visual cue that it's clickable */
    &:active {
        opacity: 0.7;
    }
`;

const NavButton = styled.button`
    padding: ${spacing[2]}px;
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: ${colors.gray[600]};
`;

const WeekDaysRow = styled.div`
    display: flex;
    margin-bottom: ${spacing[1]}px;
`;

const WeekDay = styled.div`
    flex: 1;
    text-align: center;
    font-size: 13px;
    color: ${colors.gray[500]};
    padding: ${spacing[1]}px 0;
`;

const Body = styled.div`
    display: flex;
    flex-direction: column;
`;

const Row = styled.div`
    display: flex;
    height: 64px; 
`;

const DayCell = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
`;

const DayContent = styled.div<{ isSelected: boolean; isCurrentMonth: boolean; walkLevel: number }>`
    width: 36px;
    height: 36px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    position: relative;
    opacity: ${({ isCurrentMonth }) => isCurrentMonth ? 1 : 0.3};
    border: ${({ isSelected }) => isSelected ? `2px solid ${colors.blue[600]}` : '2px solid transparent'};

    background-color: ${({ walkLevel }) => {
        switch (walkLevel) {
            case 1: return colors.primary[200];
            case 2: return colors.primary[300];
            case 3: return colors.primary[400];
            default: return 'transparent';
        }
    }};
`;

const DayNumber = styled.span<{ isOnWalk: boolean }>`
    font-size: 14px;
    font-weight: ${({ isOnWalk }) => isOnWalk ? 700 : 400};
    color: ${({ isOnWalk }) => isOnWalk ? 'white' : colors.gray[800]};
    z-index: 1;
`;

const HealthDot = styled.div<{ isOnWalk: boolean }>`
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background-color: ${({ isOnWalk }) => isOnWalk ? 'white' : colors.primary[500]};
    position: absolute;
    top: 2px;
`;
