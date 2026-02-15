"use client";

import styled from "@emotion/styled";
import { colors } from "@/shared/styles/tokens";
import { motion, AnimatePresence } from "framer-motion";

interface ScrollToTopButtonProps {
    isVisible: boolean;
    onClick: () => void;
}

export const ScrollToTopButton = ({ isVisible, onClick }: ScrollToTopButtonProps) => {
    return (
        <AnimatePresence>
            {isVisible && (
                <StyledButton
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    onClick={onClick}
                    whileTap={{ scale: 0.9 }}
                >
                    <Icon>↑</Icon>
                </StyledButton>
            )}
        </AnimatePresence>
    );
};

const StyledButton = styled(motion.button)`
    position: fixed;
    bottom: 100px;
    right: 20px;
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
    z-index: 90;
`;

const Icon = styled.span`
    font-size: 20px;
    font-weight: 600;
`;
