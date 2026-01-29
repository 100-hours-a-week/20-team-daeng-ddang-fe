import styled from '@emotion/styled';
import { radius } from '@/shared/styles/tokens';
import { ReactNode } from 'react';

const KAKAO_YELLOW = '#FEE500';

const Button = styled.button`
  background-color: ${KAKAO_YELLOW};
  color: #000000;
  width: 100%;
  padding: 16px 0;
  border-radius: ${radius.md};
  border: none;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  &:active {
    filter: brightness(0.95);
  }
`;


interface KakaoButtonProps {
  onClick?: () => void;
  children: ReactNode;
}

export const KakaoButton = ({ onClick, children }: KakaoButtonProps) => {
  return (
    <Button onClick={onClick}>
      {/* Icon could go here */}
      {children}
    </Button>
  );
};
