import styled from '@emotion/styled';
import { colors, radius, spacing } from '@/shared/styles/tokens';
import { useState } from 'react';
import { FailureReasonModal } from './FailureReasonModal';
import { useWalkMissionQuery } from '@/entities/walk/model/useMissionQuery';
import { MissionRecord } from '@/entities/walk/model/types';

interface MissionResultSectionProps {
    walkId: number;
}

export const MissionResultSection = ({ walkId }: MissionResultSectionProps) => {
    const [selectedFailure, setSelectedFailure] = useState<string | null>(null);
    const { data: missionData, isLoading, isError } = useWalkMissionQuery(walkId);

    if (isLoading || isError || !missionData || missionData.missions.length === 0) {
        return null;
    }

    const { missions } = missionData;

    const handleMissionClick = (mission: MissionRecord) => {
        if (mission.status === 'FAIL' && mission.message) {
            setSelectedFailure(mission.message);
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
                        key={mission.missionRecordId}
                        status={mission.status}
                        onClick={() => handleMissionClick(mission)}
                        isClickable={mission.status === 'FAIL'}
                    >
                        <MissionTitle>{mission.title}</MissionTitle>
                        <StatusBadge status={mission.status}>
                            {mission.status === 'SUCCESS' ? '성공' : '실패'}
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

const MissionItem = styled.div<{ status: 'SUCCESS' | 'FAIL'; isClickable: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${spacing[4]}px;
  background-color: white;
  border-radius: ${radius.md};
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border: 1px solid ${props => props.status === 'FAIL' ? colors.semantic.error : 'transparent'};
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

const StatusBadge = styled.span<{ status: 'SUCCESS' | 'FAIL' }>`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.status === 'SUCCESS' ? colors.semantic.success : colors.semantic.error};
`;
