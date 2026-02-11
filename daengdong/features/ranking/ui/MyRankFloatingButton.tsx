"use client";

import styled from "@emotion/styled";
import { colors, radius, spacing } from "@/shared/styles/tokens";
import { motion, AnimatePresence } from "framer-motion";

interface MyRankFloatingButtonProps {
    isVisible: boolean;
    onClick: () => void;
}

export const MyRankFloatingButton = ({ isVisible, onClick }: MyRankFloatingButtonProps) => {
    return (
        <AnimatePresence>
            {isVisible && (
                <FixedContainer>
                    <StyledButton
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        onClick={onClick}
                    >
                        <Icon>🔎</Icon>
                        <Text>내 순위</Text>
                    </StyledButton>
                </FixedContainer>
            )}
        </AnimatePresence>
    );
};

const FixedContainer = styled.div`
    position: fixed;
    bottom: 90px;   
    left: 50%;  
    transform: translateX(-50%);
    width: 100%;
    max-width: 430px;
    z-index: 100;
    pointer-events: none; 
    display: flex;
    justify-content: flex-end;
    padding-right: ${spacing[4]}px;
`;

const StyledButton = styled(motion.button)`
    pointer-events: auto;
    background-color: ${colors.primary[500]};
    color: white;
    padding: ${spacing[3]}px ${spacing[5]}px;
    border-radius: ${radius.full};
    border: none;
    display: flex;
    align-items: center;
    gap: ${spacing[2]}px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    cursor: pointer;
    width: max-content;
`;

const Icon = styled.span`
    font-size: 16px;
`;

const Text = styled.span`
    font-size: 14px;
    font-weight: 600;
`;