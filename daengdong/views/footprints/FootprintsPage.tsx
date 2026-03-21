"use client";

import { useState } from "react";
import styled from "@emotion/styled";
import { format } from "date-fns";
import { colors } from "@/shared/styles/tokens";
import { CalendarSection } from "../../features/footprints/ui/CalendarSection";
import { Header } from "@/widgets/Header";
import { useRef, useEffect } from "react";
import { AnimatePresence, m } from "framer-motion";
import MotionProvider from "@/shared/components/MotionProvider";
import { radius } from "@/shared/styles/tokens";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useModalStore } from '@/shared/stores/useModalStore';
import { useAuthStore } from '@/entities/session/model/store';
import { useScrollRestoration } from '@/shared/hooks/useScrollRestoration';

interface FootprintsPageProps {
    initialSelectedDate: string;
    children: React.ReactNode;
}

export const FootprintsPage = ({ initialSelectedDate, children }: FootprintsPageProps) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const contentRef = useRef<HTMLDivElement>(null);
    const { openModal } = useModalStore();
    const selectedDate = searchParams.get("date") || initialSelectedDate;
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
    const isAuthChecked = useAuthStore((state) => state.isAuthChecked);

    const [viewDate, setViewDate] = useState(() => {
        const dateObj = new Date(selectedDate);
        return {
            year: dateObj.getFullYear(),
            month: dateObj.getMonth() + 1
        };
    });

    // 파라미터에 날짜가 없으면 오늘 날짜로 설정
    useEffect(() => {
        const currentDate = searchParams.get("date");

        if (!currentDate) {
            const today = format(new Date(), "yyyy-MM-dd");
            const params = new URLSearchParams(searchParams.toString());
            params.set("date", today);

            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        }
    }, [pathname, router, searchParams]);



    useEffect(() => {
        if (isAuthChecked && !isLoggedIn) {
            openModal({
                title: "로그인이 필요해요!",
                message: "발자국 기록을 보려면 로그인이 필요해요.\n로그인 페이지로 이동할까요?",
                type: "confirm",
                confirmText: "로그인하기",
                cancelText: "메인으로",
                onConfirm: () => router.push('/login'),
                onCancel: () => router.push('/'),
            });
        }
    }, [isAuthChecked, isLoggedIn, openModal, router]);

    const { showScrollTop, scrollToTop } = useScrollRestoration({
        ref: contentRef,
        storageKey: 'footprints-scroll',
        threshold: 300
    });

    const handleDateSelect = (date: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('date', date);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const handleMonthChange = (year: number, month: number) => {
        setViewDate({ year, month });
    };

    return (
        <MotionProvider>
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

                    {children}
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
        </MotionProvider>
    );
}

const ScreenContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100svh;
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

const ScrollTopButton = styled(m.button)`
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
