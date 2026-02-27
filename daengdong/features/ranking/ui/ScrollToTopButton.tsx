"use client";

import { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { colors } from "@/shared/styles/tokens";
import { m, AnimatePresence } from "framer-motion";
import MotionProvider from "@/shared/components/MotionProvider";

interface ScrollToTopButtonProps {
    scrollContainerRef: React.RefObject<HTMLDivElement | null>;
    hasMyRank?: boolean;
}

export const ScrollToTopButton = ({ scrollContainerRef, hasMyRank = true }: ScrollToTopButtonProps) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    setIsVisible(container.scrollTop > 200);
                    ticking = false;
                });
                ticking = true;
            }
        };

        container.addEventListener('scroll', handleScroll, { passive: true });
        return () => container.removeEventListener('scroll', handleScroll);
    }, [scrollContainerRef]);

    const scrollToTop = () => {
        scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    };
    return (
        <Wrapper hasMyRank={hasMyRank}>
            <MotionProvider>
                <AnimatePresence>
                    {isVisible && (
                        <StyledButton
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 20, opacity: 0 }}
                            onClick={scrollToTop}
                            whileTap={{ scale: 0.9 }}
                        >
                            <Icon>↑</Icon>
                        </StyledButton>
                    )}
                </AnimatePresence>
            </MotionProvider>
        </Wrapper>
    );
};

const Wrapper = styled.div<{ hasMyRank: boolean }>`
    position: fixed;
    bottom: ${({ hasMyRank }) => hasMyRank ? '135px' : '85px'};
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 430px;
    pointer-events: none; 
    display: flex;
    justify-content: flex-end;
    padding-right: 20px;
    z-index: 90;
`;

const StyledButton = styled(m.button)`
    pointer-events: auto; 
    width: 44px;
    height: 44px;
    background-color: white;
    color: ${colors.gray[600]};
    border-radius: 50%;
    border: 1px solid ${colors.gray[200]};
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    cursor: pointer;
`;

const Icon = styled.span`
    font-size: 20px;
    font-weight: 600;
`;
