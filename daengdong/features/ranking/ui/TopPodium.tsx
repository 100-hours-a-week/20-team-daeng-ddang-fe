import { RankingItem } from "@/entities/ranking/model/types";
import styled from "@emotion/styled";
import { colors, spacing, radius } from "@/shared/styles/tokens";
import { formatDistance } from "@/shared/utils/formatDistance";
import { calculateAge } from "@/shared/utils/calculateAge";
import { DogProfileImage } from "@/shared/components/DogProfileImage";

interface TopPodiumProps {
    topRanks: RankingItem[];
}

export const TopPodium = ({ topRanks }: TopPodiumProps) => {
    const sortedRanks = [...topRanks].sort((a, b) => a.rank - b.rank);

    return (
        <Container>
            {sortedRanks.map((item) => (
                <RankCard key={item.dogId} item={item} />
            ))}
        </Container>
    );
};

const RankCard = ({ item }: { item: RankingItem }) => {
    const isFirst = item.rank === 1;
    const size = isFirst ? 72 : 56;

    return (
        <CardContainer isFirst={isFirst}>
            <AvatarWrapper>
                <Avatar size={size} rank={item.rank}>
                    <DogProfileImage
                        src={item.profileImageUrl}
                        alt={item.dogName}
                        size={size}
                        priority={true}
                    />
                </Avatar>
                <RankBadge rank={item.rank}>{item.rank}</RankBadge>
            </AvatarWrapper>

            <Info>
                <NameRow>
                    <Name isFirst={isFirst}>{item.dogName}</Name>
                </NameRow>
                <Distance isFirst={isFirst}>{formatDistance(item.totalDistance)}km</Distance>
                <DetailRow>
                    <DetailText>
                        {[
                            item.breed,
                            item.birthDate ? `${calculateAge(item.birthDate)}살` : item.age ? `${item.age}살` : null
                        ].filter(Boolean).join(' · ')}
                    </DetailText>
                </DetailRow>
            </Info>
        </CardContainer>
    );
};

const Container = styled.div`
    display: flex;
    justify-content: center;
    align-items: flex-end; /* Align to bottom so 1st place pops up */
    gap: ${spacing[3]}px;
    padding: ${spacing[2]}px ${spacing[4]}px;
    background-color: white;
    margin: ${spacing[3]}px ${spacing[4]}px;
    border-radius: ${radius.lg};
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
`;

const CardContainer = styled.div<{ isFirst: boolean }>`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 30%;
    transition: transform 0.3s ease;
    z-index: ${({ isFirst }) => isFirst ? 2 : 1};
`;

const AvatarWrapper = styled.div`
    position: relative;
    margin-bottom: ${spacing[3]}px;
`;

const Avatar = styled.div<{ size: number, rank: number }>`
    width: ${({ size }) => size}px;
    height: ${({ size }) => size}px;
    border-radius: 50%;
    overflow: hidden;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
`;

const RankBadge = styled.div<{ rank: number }>`
    position: absolute;
    bottom: -6px;
    right: -6px;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background-color: ${({ rank }) =>
        rank === 1 ? colors.primary[600] : colors.gray[500]};
    color: white;
    font-size: 11px;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Info = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 4px;
`;

const NameRow = styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
`;

const Name = styled.div<{ isFirst: boolean }>`
    font-size: 15px;
    font-weight: 700;
    color: ${colors.gray[900]};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100px;
    ${({ isFirst }) => isFirst && `
        font-size: 16px;
        color: #111;
    `}
`;

const DetailRow = styled.div`
    display: flex;
    gap: 4px;
`;

const DetailText = styled.div`
    font-size: 11px;
    color: ${colors.gray[500]};
`;

const Distance = styled.div<{ isFirst: boolean }>`
    font-size: 11px;
    font-weight: 600;
    color: ${colors.primary[600]};
    padding: 2px;

    ${({ isFirst }) => isFirst && `
        font-size: 12px;
        font-weight: 700;
        padding: 3px 10px;
    `}
`;
