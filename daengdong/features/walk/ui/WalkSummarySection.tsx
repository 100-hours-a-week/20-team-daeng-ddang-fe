import styled from '@emotion/styled';
import { colors, radius, spacing } from '@/shared/styles/tokens';

export const WalkSummarySection = () => {
    // Dummy Data
    const summaryData = {
        time: '32분 21초',
        distance: '1.28km',
        blockCount: '12개',
    };

    return (
        <Container>
            <SummaryItem label="산책 시간" value={summaryData.time} />
            <Divider />
            <SummaryItem label="이동 거리" value={summaryData.distance} />
            <Divider />
            <SummaryItem label="점유 블록" value={summaryData.blockCount} />
        </Container>
    );
};

const SummaryItem = ({ label, value }: { label: string; value: string }) => (
    <ItemContainer>
        <Value>{value}</Value>
        <Label>{label}</Label>
    </ItemContainer>
);

const Container = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: ${spacing[4]}px;
  background-color: ${colors.gray[50]};
  border-radius: ${radius.md};
  margin: ${spacing[4]}px 0;
`;

const ItemContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const Value = styled.span`
  font-size: 18px;
  font-weight: 700;
  color: ${colors.gray[900]};
`;

const Label = styled.span`
  font-size: 12px;
  color: ${colors.gray[700]};
`;

const Divider = styled.div`
  width: 1px;
  height: 32px;
  background-color: ${colors.gray[200]};
`;
