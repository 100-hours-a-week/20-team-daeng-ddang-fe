import styled from '@emotion/styled';
import { radius } from '@/shared/styles/tokens';

export const PathMapImage = ({ className }: { className?: string }) => {
    return (
        <Container className={className}>
            <PlaceholderText>Map Snapshot Area</PlaceholderText>
        </Container>
    );
};

const Container = styled.div`
  width: 100%;
  aspect-ratio: 1 / 1;
  background-color: #e0e0e0;
  border-radius: ${radius.lg};
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const PlaceholderText = styled.span`
  color: #757575;
  font-size: 14px;
  font-weight: 500;
`;
