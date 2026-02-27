"use client";

import React, { createContext, useContext, useEffect } from "react";
import styled from "@emotion/styled";
import { colors, radius } from "@/shared/styles/tokens";

interface DialogContextValue {
    onClose?: () => void;
}

const DialogContext = createContext<DialogContextValue>({});
const useDialog = () => useContext(DialogContext);

// ── 서브 컴포넌트 ─────────────────────────────────────────────

const Overlay = ({ onClick }: { onClick?: () => void }) => {
    const { onClose } = useDialog();
    return <StyledOverlay onClick={onClick ?? onClose} />;
};

const Container = ({ children }: { children: React.ReactNode }) => (
    <StyledContainer>{children}</StyledContainer>
);

const Title = ({ children }: { children: React.ReactNode }) => (
    <StyledTitle>{children}</StyledTitle>
);

const Message = ({ children }: { children: React.ReactNode }) => (
    <StyledMessage>{children}</StyledMessage>
);

const ButtonGroup = ({ children }: { children: React.ReactNode }) => (
    <StyledButtonGroup>{children}</StyledButtonGroup>
);

const DialogButton = ({
    children,
    variant = "primary",
    onClick,
    disabled,
}: {
    children: React.ReactNode;
    variant?: "primary" | "secondary";
    onClick?: () => void;
    disabled?: boolean;
}) => (
    <StyledButton variant={variant} onClick={onClick} disabled={disabled}>
        {children}
    </StyledButton>
);

// ── Root ─────────────────────────────────────────────────────────

interface DialogProps {
    isOpen: boolean;
    onClose?: () => void;
    children: React.ReactNode;
}

type DialogComponent = React.FC<DialogProps> & {
    Overlay: typeof Overlay;
    Container: typeof Container;
    Title: typeof Title;
    Message: typeof Message;
    ButtonGroup: typeof ButtonGroup;
    Button: typeof DialogButton;
};

export const Dialog: DialogComponent = Object.assign(
    ({ isOpen, onClose, children }: DialogProps) => {
        useEffect(() => {
            if (isOpen) {
                document.body.classList.add("modal-open");
            } else {
                document.body.classList.remove("modal-open");
            }
            return () => {
                document.body.classList.remove("modal-open");
            };
        }, [isOpen]);

        if (!isOpen) return null;

        return (
            <DialogContext.Provider value={{ onClose }}>
                <StyledRoot>{children}</StyledRoot>
            </DialogContext.Provider>
        );
    },
    {
        Overlay,
        Container,
        Title,
        Message,
        ButtonGroup,
        Button: DialogButton,
    }
);

const StyledRoot = styled.div`
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 430px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1500;
`;

const StyledOverlay = styled.div`
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
`;

const StyledContainer = styled.div`
  position: relative;
  background: white;
  width: 90%;
  max-width: 320px;
  border-radius: ${radius.lg};
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  animation: dialogFadeIn 0.2s ease-out;

  @keyframes dialogFadeIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

const StyledTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  text-align: center;
  margin: 0;
`;

const StyledMessage = styled.p`
  font-size: 14px;
  color: #666;
  text-align: center;
  line-height: 1.5;
  white-space: pre-wrap;
  margin: 0;
`;

const StyledButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  width: 100%;
  margin-top: 4px;
`;

const StyledButton = styled.button<{ variant: "primary" | "secondary" }>`
  flex: 1;
  padding: 12px;
  border-radius: ${radius.sm};
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: opacity 0.2s;

  ${({ variant }) =>
        variant === "primary"
            ? `
    background-color: ${colors.primary[500]};
    color: white;
  `
            : `
    background-color: #f5f5f5;
    color: #666;
  `}

  &:hover {
    opacity: 0.8;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;
