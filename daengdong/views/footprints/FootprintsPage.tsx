"use client";

import { useState } from "react";
import styled from "@emotion/styled";
import { format } from "date-fns";
import { colors } from "@/shared/styles/tokens";
import { CalendarSection } from "../../features/footprints/ui/CalendarSection";
import { RecordListSection } from "../../features/footprints/ui/RecordListSection";
import { DailyRecordItem } from "@/entities/footprints/model/types";
import { Header } from "@/widgets/Header";
import { useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { radius } from "@/shared/styles/tokens";
import { useRouter } from "next/navigation";

export const FootprintsPage = () => {
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [viewDate, setViewDate] = useState({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1
    });
    const [showScrollTop, setShowScrollTop] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const contentEl = contentRef.current;
        if (!contentEl) return;

        const handleScroll = () => {
            setShowScrollTop(contentEl.scrollTop > 300);
        };

        contentEl.addEventListener('scroll', handleScroll);
        return () => contentEl.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        contentRef.current?.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const handleDateSelect = (date: string) => {
        setSelectedDate(date);
    };

    const handleMonthChange = (year: number, month: number) => {
        setViewDate({ year, month });
    };

    const handleRecordClick = (record: DailyRecordItem) => {
        if (record.type === 'WALK') {
            router.push(`/footprints/walk/${record.id}`);
        } else if (record.type === 'HEALTH') {
            router.push(`/footprints/healthcare/${record.id}`);
        }
    };

    return (
        <ScreenContainer>
            <Content ref={contentRef}>
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

            <AnimatePresence>
                {showScrollTop && (
                    <ScrollTopButton
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        onClick={scrollToTop}
                        aria-label="Scroll to top"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 15l-6-6-6 6" />
                        </svg>
                    </ScrollTopButton>
                )}
            </AnimatePresence>
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
    padding-bottom: 70px;
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
    -ms-overflow-style: none; /* IE & Edge */
    scrollbar-width: none; /* Firefox */
`;

const ScrollTopButton = styled(motion.button)`
    position: absolute;
    right: 20px;
    bottom: 90px; /* Above BottomNav */
    width: 44px;
    height: 44px;
    border-radius: ${radius.full};
    background-color: white;
    color: ${colors.primary[500]};
    border: none;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 100;

    &:active {
        transform: scale(0.95);
    }
`;

export default FootprintsPage;
