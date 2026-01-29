import styled from '@emotion/styled';
import { colors, radius, spacing } from '@/shared/styles/tokens';
import { useEffect } from 'react';

interface FailureReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason: string;
}

export const FailureReasonModal = ({ isOpen, onClose, reason }: FailureReasonModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'; // 스크롤 방지
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Title>실패 사유</Title>
        <Message>{reason}</Message>
        <Button onClick={onClose}>확인</Button>
      </ModalContainer>
    </Overlay>
  );
};

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${spacing[4]}px;
`;

const ModalContainer = styled.div`
  background: white;
  width: 100%;
  max-width: 320px;
  border-radius: ${radius.lg};
  padding: ${spacing[6]}px;
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

const Title = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: ${colors.gray[900]};
  margin-bottom: ${spacing[3]}px;
`;

const Message = styled.p`
  font-size: 14px;
  color: ${colors.gray[700]};
  text-align: center;
  margin-bottom: ${spacing[6]}px;
  line-height: 1.5;
  white-space: pre-wrap;
`;

const Button = styled.button`
  width: 100%;
  padding: ${spacing[3]}px;
  background-color: ${colors.primary[600]};
  color: white;
  border: none;
  border-radius: ${radius.md};
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  
  &:active {
    background-color: ${colors.primary[700]};
  }
`;
