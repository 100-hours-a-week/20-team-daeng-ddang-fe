import styled from '@emotion/styled';
import { colors, radius, spacing } from '@/shared/styles/tokens';
import { useWalkMissionQuery } from '@/entities/walk/model/useMissionQuery';


interface MissionResultSectionProps {
  walkId: number;
}

export const MissionResultSection = ({ walkId }: MissionResultSectionProps) => {
  const { data: missionAnalysis, isLoading, isError, error } = useWalkMissionQuery(walkId);

  console.log('[MissionResultSection] State:', {
    walkId,
    isLoading,
    isError,
    hasData: !!missionAnalysis,
    missionCount: missionAnalysis?.missions?.length,
    error: error?.message,
  });

  if (isLoading) {
    return (
      <Container>
        <Title>돌발 미션 결과</Title>
        <LoadingRow>
          <Spinner />
          <LoadingText>결과 불러오는 중...</LoadingText>
        </LoadingRow>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container>
        <Title>돌발 미션 결과</Title>
        <ErrorRow>
          ❌ 미션 결과를 불러오는데 실패했습니다.
        </ErrorRow>
      </Container>
    );
  }

  if (!missionAnalysis || missionAnalysis.walkId !== walkId || missionAnalysis.missions.length === 0) {
    return null;
  }

  const { missions } = missionAnalysis;

  return (
    <Container>
      <Title>돌발 미션 결과</Title>
      <MissionList>
        {missions.map((mission) => (
          <MissionItem
            key={mission.missionId}
            status={mission.success ? 'SUCCESS' : 'FAIL'}
            isClickable={false}
          >
            <MissionTitle>{`미션 ${mission.missionId}`}</MissionTitle>
            <StatusBadge status={mission.success ? 'SUCCESS' : 'FAIL'}>
              {mission.success ? '성공' : '실패'}
            </StatusBadge>
          </MissionItem>
        ))}
      </MissionList>
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

const LoadingRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing[2]}px;
  padding: ${spacing[3]}px ${spacing[1]}px;
  color: ${colors.gray[700]};
  font-size: 14px;
`;

const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid ${colors.gray[200]};
  border-top-color: ${colors.primary[500]};
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.span``;

const ErrorRow = styled.div`
  padding: ${spacing[3]}px ${spacing[1]}px;
  color: ${colors.semantic.error};
  font-size: 14px;
  text-align: center;
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
