"use client";

import { useEffect } from "react";
import styled from "@emotion/styled";
import { colors } from "@/shared/styles/tokens";
import { useModalStore } from "@/shared/stores/useModalStore";

export function Modal() {
  const { isOpen, options, closeModal } = useModalStore();

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

  if (!isOpen || !options) return null;

  const {
    title,
    message,
    type = "alert",
    confirmText = "확인",
    cancelText = "취소",
    onConfirm,
    onCancel,
  } = options;

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    closeModal();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    closeModal();
  };

  return (
    <Overlay>
      <ModalContainer>
        <Title>{title}</Title>
        {message && <Message>{message}</Message>}
        <ButtonGroup type={type}>
          {type === "confirm" && (
            <Button variant="secondary" onClick={handleCancel}>
              {cancelText}
            </Button>
          )}
          <Button variant="primary" onClick={handleConfirm}>
            {confirmText}
          </Button>
        </ButtonGroup>
      </ModalContainer>
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 400px;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1500;
`;

const ModalContainer = styled.div`
  background: white;
  width: 90%;
  max-width: 320px;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	animation: fadeIn 0.2s ease-out;

	@keyframes fadeIn {
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

const Title = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
  text-align: center;
`;

const Message = styled.p`
  font-size: 14px;
  color: #666;
  text-align: center;
  margin-bottom: 24px;
  line-height: 1.5;
  white-space: pre-wrap;
`;

const ButtonGroup = styled.div<{ type: "alert" | "confirm" }>`
  display: flex;
  gap: 12px;
  width: 100%;
  justify-content: center;
`;

const Button = styled.button<{ variant: "primary" | "secondary" }>`
  flex: 1;
  padding: 12px;
  border-radius: 8px;
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
`;
