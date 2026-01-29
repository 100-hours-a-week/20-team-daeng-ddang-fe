import styled from '@emotion/styled';
import { colors, radius, spacing } from '@/shared/styles/tokens';
import { useState } from 'react';

interface UserProfileSectionProps {
  dogName: string;
  profileImageUrl?: string;
  totalWalkCount: number;
  totalWalkDistance: number; // km
}

export const UserProfileSection = ({
  dogName,
  profileImageUrl,
  totalWalkCount,
  totalWalkDistance,
}: UserProfileSectionProps) => {
  const [imageError, setImageError] = useState(false);

  const hasImage = !imageError && !!profileImageUrl;

  return (
    <Section>
      <ProfileArea>
        <ImageWrapper hasImage={hasImage}>
          {hasImage ? (
            <ProfileImage
              src={profileImageUrl}
              alt={`${dogName} 프로필`}
              onError={() => setImageError(true)}
            />
          ) : (
            <PlaceholderIcon />
          )}
        </ImageWrapper>
        <InfoWrapper>
          <DogName>{dogName}</DogName>
          <WalkStats>
            <StatItem>
              <StatValue>{totalWalkCount}</StatValue>
              <StatLabel>회 산책</StatLabel>
            </StatItem>
            <Divider />
            <StatItem>
              <StatValue>{totalWalkDistance.toFixed(1)}</StatValue>
              <StatLabel>km</StatLabel>
            </StatItem>
          </WalkStats>
        </InfoWrapper>
      </ProfileArea>
    </Section>
  );
};

const PlaceholderIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#E0E0E0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="4" r="2" />
    <circle cx="18" cy="8" r="2" />
    <circle cx="20" cy="16" r="2" />
    <path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z" />
  </svg>
);

const Section = styled.section`
  background-color: white;
  padding: ${spacing[5]}px ${spacing[4]}px;
  border-bottom: 8px solid ${colors.gray[50]};
`;

const ProfileArea = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing[4]}px;
`;

const ImageWrapper = styled.div<{ hasImage: boolean }>`
  width: 80px;
  height: 80px;
  border-radius: ${radius.full};
  overflow: hidden;
  background-color: ${colors.gray[50]};
  flex-shrink: 0;
  border: 1px solid ${colors.gray[200]};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ProfileImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const InfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[2]}px;
  flex: 1;
`;

const DogName = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: ${colors.gray[900]};
  margin: 0;
`;

const WalkStats = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing[3]}px;
`;

const StatItem = styled.div`
  display: flex;
  align-items: baseline;
  gap: ${spacing[1]}px;
`;

const StatValue = styled.span`
  font-size: 18px;
  font-weight: 700;
  color: ${colors.primary[600]};
`;

const StatLabel = styled.span`
  font-size: 14px;
  color: ${colors.gray[700]};
`;

const Divider = styled.div`
  width: 1px;
  height: 12px;
  background-color: ${colors.gray[200]};
`;
