"use client";

import { useRouter } from "next/navigation";
import styled from "@emotion/styled";

interface HeaderProps {
  title: string;
  showBackButton: boolean;
  onBack?: () => void;
  isSticky?: boolean;
}

export function Header({ title, showBackButton, onBack, isSticky = true }: HeaderProps) {
  const router = useRouter();

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <Container isSticky={isSticky}>
      <LeftSection>
        {showBackButton && (
          <BackButton onClick={handleBackClick} aria-label="Go back">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </BackButton>
        )}
      </LeftSection>
      <Title>{title}</Title>
      <RightSection />
    </Container>
  );
}

const Container = styled.header<{ isSticky?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  flex-shrink: 0;
  padding: 0 16px;
  background-color: white;
  border-bottom: 1px solid #f0f0f0;
  position: ${({ isSticky }) => (isSticky ? 'sticky' : 'relative')};
  top: 0;
  z-index: 50;
`;

const LeftSection = styled.div`
  width: 40px;
  display: flex;
  align-items: center;
`;

const RightSection = styled.div`
  width: 40px;
`;

const Title = styled.h1`
  font-family: var(--font-cafe24), sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  text-align: center;
  flex: 1;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
  margin-left: -8px; 

  &:hover {
    opacity: 0.7;
  }
`;
