import styled from '@emotion/styled';
import { radius } from '@/shared/styles/tokens';
import { useWalkStore } from '@/entities/walk/model/walkStore';
import Image from 'next/image';

export const PathMapImage = ({ className }: { className?: string }) => {
  const { walkResult } = useWalkStore();
  const imageUrl = walkResult?.imageUrl;

  return (
    <Container className={className} hasImage={!!imageUrl}>
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt="산책 경로 스냅샷"
          fill
          sizes="(max-width: 430px) 100vw, 430px"
          style={{ objectFit: 'cover' }}
          priority
        />
      ) : (
        <PlaceholderText>산책 경로 이미지를 불러오지 못했어요</PlaceholderText>
      )}
    </Container>
  );
};

const Container = styled.div<{ hasImage: boolean }>`
  position: relative;
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
