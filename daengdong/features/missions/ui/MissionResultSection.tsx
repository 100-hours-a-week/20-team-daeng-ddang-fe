import styled from '@emotion/styled';
import { colors, radius, spacing } from '@/shared/styles/tokens';
import { useState } from 'react';
import { FailureReasonModal } from './FailureReasonModal';

type MissionStatus = 'success' | 'failed';

interface Mission {
    id: number;
    title: string;
    status: MissionStatus;
    reason?: string;
}

export const MissionResultSection = () => {
    const [selectedFailure, setSelectedFailure] = useState<string | null>(null);

    // Dummy Data
    const missions: Mission[] = [
        { id: 1, title: "10초 동안 멈추기", status: "success" },
        { id: 2, title: "왼쪽으로 걷기", status: "failed", reason: "강아지가 멈추지 않았습니다." },
        { id: 3, title: "친구와 인사하기", status: "success" },
        { id: 4, title: "나무 냄새 맡기", status: "failed", reason: "시간이 초과되었습니다." },
    ];

    const handleMissionClick = (mission: Mission) => {
        if (mission.status === 'failed' && mission.reason) {
            setSelectedFailure(mission.reason);
        }
    };

    const closeModal = () => {
        setSelectedFailure(null);
    };

    return (
        <Container>
            <Title>돌발 미션 결과</Title>
            <MissionList>
                {missions.map((mission) => (
                    <MissionItem
                        key={mission.id}
                        status={mission.status}
                        onClick={() => handleMissionClick(mission)}
                        isClickable={mission.status === 'failed'}
                    >
                        <MissionTitle>{mission.title}</MissionTitle>
                        <StatusBadge status={mission.status}>
                            {mission.status === 'success' ? '성공' : '실패'}
                        </StatusBadge>
                    </MissionItem>
                ))}
            </MissionList>

            <FailureReasonModal
                isOpen={!!selectedFailure}
                onClose={closeModal}
                reason={selectedFailure || ''}
            />
        </Container>
    );
};

const Container = styled.section`
  margin-top: ${spacing[4]}px;
`;

const Title = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: ${colors.gray[900]};
  margin-bottom: ${spacing[3]}px;
  padding: 0 ${spacing[1]}px;
`;

const MissionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[3]}px;
`;

const MissionItem = styled.div<{ status: MissionStatus; isClickable: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${spacing[4]}px;
  background-color: white;
  border-radius: ${radius.md};
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border: 1px solid ${props => props.status === 'failed' ? colors.semantic.error : 'transparent'};
  cursor: ${props => props.isClickable ? 'pointer' : 'default'};
  transition: transform 0.1s;

  &:active {
    transform: ${props => props.isClickable ? 'scale(0.99)' : 'none'};
  }
`;

const MissionTitle = styled.span`
  font-size: 16px;
  color: ${colors.gray[900]};
`;

const StatusBadge = styled.span<{ status: MissionStatus }>`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.status === 'success' ? colors.semantic.success : colors.semantic.error};
`;
