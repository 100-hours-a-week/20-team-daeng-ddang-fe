"use client";

import styled from "@emotion/styled";
import { colors } from "@/shared/styles/tokens";
import { useWalkControl } from "@/features/walk/model/useWalkControl";

export const WalkStatusPanel = () => {
  const {
    walkMode,
    elapsedTime,
    distance,
    handleStart,
    handleEnd,
    handleCancel,
    isDogLoading
  } = useWalkControl();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (walkMode === "idle") {
    return (
      <Container>
        <Message>산책 준비 완료!</Message>
        <StartButton onClick={handleStart} disabled={isDogLoading}>
          {isDogLoading ? '로딩 중...' : '산책 시작 🐕'}
        </StartButton>
      </Container>
    );
  }

  return (
    <Container>
      <StatsRow>
        <StatItem>
          <Label>시간</Label>
          <Value>{formatTime(elapsedTime)}</Value>
        </StatItem>
        <StatItem>
          <Label>거리</Label>
          <Value>{distance.toFixed(2)} km</Value>
        </StatItem>
      </StatsRow>

      <ButtonRow>
        <CancelButton onClick={handleCancel}>취소하기</CancelButton>
        <EndButton onClick={handleEnd}>산책 종료</EndButton>
      </ButtonRow>
    </Container>
  );
};

const Container = styled.div`
  background: white;
  padding: 24px;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  width: 100%;
`;

const Message = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #333;
`;

const StartButton = styled.button<{ disabled?: boolean }>`
  width: 100%;
  padding: 16px;
  background-color: ${props => props.disabled ? '#ccc' : colors.primary[500]};
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 700;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.6 : 1};
  
  &:active {
    opacity: ${props => props.disabled ? 0.6 : 0.9};
  }
`;

const StatsRow = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-around;
  margin-bottom: 8px;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const Label = styled.span`
  font-size: 14px;
  color: #888;
`;

const Value = styled.span`
  font-size: 24px;
  font-weight: 700;
  color: #333;
`;

const ButtonRow = styled.div`
  display: flex;
  width: 100%;
  gap: 12px;
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 14px;
  background-color: #f5f5f5;
  color: #666;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
`;

const EndButton = styled.button`
  flex: 2;
  padding: 14px;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
`;
