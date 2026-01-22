"use client";

import styled from "@emotion/styled";
import { useWalkStore } from "@/entities/walk/model/walkStore";
import { useModalStore } from "@/shared/stores/useModalStore";
import { useLoadingStore } from "@/shared/stores/useLoadingStore";
import { colors } from "@/shared/styles/tokens";
import { useStartWalk, useEndWalk } from "@/features/walk/model/useWalkMutations";
import { useRouter } from "next/navigation";

export const WalkStatusPanel = () => {
    const { walkMode, elapsedTime, distance, currentPos, walkId, startWalk, endWalk, reset, setWalkResult } = useWalkStore();
    const { openModal } = useModalStore();
    const { showLoading, hideLoading } = useLoadingStore();
    const { mutate: startWalkMutate, isPending: isStarting } = useStartWalk();
    const { mutate: endWalkMutate, isPending: isEnding } = useEndWalk();
    const router = useRouter();

    const handleStart = () => {
        if (!currentPos) {
            alert("위치 정보를 불러오는 중입니다. 잠시만 기다려주세요.");
            return;
        }

        startWalkMutate(
            { startLat: currentPos.lat, startLng: currentPos.lng },
            {
                onSuccess: (res) => {
                    startWalk(res.walkId);
                },
                onError: () => {
                    alert("산책 시작에 실패했습니다.");
                }
            }
        );
    };

    const handleCancel = () => {
        openModal({
            title: "산책 취소",
            message: "산책을 취소하시겠습니까? 기록은 저장되지 않습니다.",
            type: "confirm",
            confirmText: "취소하기",
            cancelText: "계속 산책하기",
            onConfirm: () => {
                reset();
            },
        });
    };

    const handleEnd = () => {
        if (!currentPos || !walkId) {
            if (!walkId) {
                endWalk();
                return;
            }
            return;
        }

        openModal({
            title: "산책 종료",
            message: "산책을 종료하시겠습니까? 기록이 저장됩니다.",
            type: "confirm",
            confirmText: "종료하기",
            cancelText: "계속 산책하기",
            onConfirm: async () => {
                showLoading("산책 결과를 저장하고 스냅샷을 생성 중입니다...");

                endWalkMutate(
                    {
                        walkId: walkId,
                        endLat: currentPos.lat,
                        endLng: currentPos.lng,
                        totalDistanceKm: Number(distance.toFixed(4)),
                        durationSeconds: elapsedTime,
                        status: "FINISHED"
                    },
                    {
                        onSuccess: () => {
                            router.push(`/walk/complete/${walkId}`);
                            endWalk();
                            hideLoading();
                        },
                        onError: () => {
                            hideLoading();
                            alert("산책 종료 저장에 실패했습니다.");
                            endWalk();
                        }
                    }
                )
            },
        });
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    if (walkMode === "idle") {
        return (
            <Container>
                <Message>산책 준비 완료!</Message>
                <StartButton onClick={handleStart}>산책 시작 🐕</StartButton>
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
  position: fixed;
  bottom: calc(60px + env(safe-area-inset-bottom));
  left: 0;
  right: 0;
  background: white;
  padding: 24px;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
`;

const Message = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #333;
`;

const StartButton = styled.button`
  width: 100%;
  padding: 16px;
  background-color: ${colors.primary[500]};
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  
  &:active {
    opacity: 0.9;
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
