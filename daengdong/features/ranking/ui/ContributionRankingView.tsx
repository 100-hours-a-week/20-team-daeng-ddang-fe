import styled from "@emotion/styled";
import { useContributionRanking } from "../model/useContributionRanking";
import { PeriodType, ContributionRankingItem } from "@/entities/ranking/model/types";
import { colors, radius, spacing } from "@/shared/styles/tokens";
import { LoadingView } from "@/widgets/GlobalLoading";
import { formatDistance } from "@/shared/utils/formatDistance";
import { DogProfileImage } from "@/shared/components/DogProfileImage";

interface ContributionRankingViewProps {
    regionId: number;
    periodType: PeriodType;
    periodValue: string;
    onClose?: () => void;
}

export const ContributionRankingView = ({ regionId, periodType, periodValue, onClose }: ContributionRankingViewProps) => {
    const {
        summaryData,
        isSummaryLoading,
        contributionRanks,
        fetchNextPage,
        hasNextPage
    } = useContributionRanking({ regionId, periodType, periodValue });

    if (isSummaryLoading) return <LoadingView message="기여도 정보 불러오는 중..." />;

    const topRanks = summaryData?.topRanks || [];
    const myRank = summaryData?.myRank;

    return (
        <Container>
            <Title>🎖️ 지역 기여도 TOP 3</Title>

            <TopList>
                {topRanks.map((item: ContributionRankingItem) => (
                    <ContributionRow key={`top-${item.dogId}`} item={item} isTop={true} />
                ))}
            </TopList>

            {myRank && (
                <MyRankContainer>
                    <SectionTitle>내 기여도</SectionTitle>
                    <ContributionRow item={myRank} isMyRank={true} />
                </MyRankContainer>
            )}

            <Divider />

            <FullList>
                {contributionRanks
                    .filter((item: ContributionRankingItem) => item.rank > 3)
                    .map((item: ContributionRankingItem) => (
                        <ContributionRow key={`list-${item.dogId}`} item={item} />
                    ))}
            </FullList>

            {contributionRanks.length > 3 && (
                <ButtonGroup>
                    {hasNextPage && (
                        <LoadMoreBtn onClick={() => fetchNextPage()}>
                            더 보기 ⌄
                        </LoadMoreBtn>
                    )}
                    {onClose && (
                        <CloseBtn onClick={onClose} hasNextPage={hasNextPage}>
                            목록 닫기 ⌃
                        </CloseBtn>
                    )}
                </ButtonGroup>
            )}
        </Container>
    );
};

const ContributionRow = ({ item, isTop = false, isMyRank = false }: { item: ContributionRankingItem, isTop?: boolean, isMyRank?: boolean }) => (
    <Row isMyRank={isMyRank}>
        <RankBadge isTop={isTop}>{item.rank}</RankBadge>
        <Avatar>
            <DogProfileImage
                src={item.profileImageUrl}
                alt={item.dogName}
                size={32}
            />
        </Avatar>
        <Info>
            <Name>{item.dogName}</Name>
            <Meta>{(item.contributionRate * 100).toFixed(0)}% 기여 • {formatDistance(item.dogDistance)}km</Meta>
        </Info>
    </Row>
);

const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${spacing[3]}px;
`;

const Title = styled.div`
    font-size: 13px;
    font-weight: 700;
    color: ${colors.gray[800]};
    margin-bottom: ${spacing[1]}px;
`;

const SectionTitle = styled.div`
    font-size: 12px;
    font-weight: 600;
    color: ${colors.gray[500]};
    margin-bottom: ${spacing[1]}px;
`;

const TopList = styled.div`
    background-color: white;
    border-radius: ${radius.md};
    padding: ${spacing[2]}px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
`;

const MyRankContainer = styled.div`
    margin-top: ${spacing[1]}px;
`;

const FullList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${spacing[1]}px;
`;

const Row = styled.div<{ isMyRank?: boolean }>`
    display: flex;
    align-items: center;
    padding: ${spacing[2]}px;
    background-color: ${({ isMyRank }) => isMyRank ? colors.primary[50] : 'white'};
    border-radius: ${radius.sm};
    border: ${({ isMyRank }) => isMyRank ? `1px solid ${colors.primary[200]}` : 'none'};
`;

const RankBadge = styled.div<{ isTop: boolean }>`
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: ${({ isTop }) => isTop ? colors.primary[100] : colors.gray[100]};
    color: ${({ isTop }) => isTop ? colors.primary[700] : colors.gray[600]};
    font-size: 10px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: ${spacing[2]}px;
`;

const Avatar = styled.div`
    width: 32px;
    height: 32px;
    border-radius: 50%;
    overflow: hidden;
    margin-right: ${spacing[2]}px;
    background-color: ${colors.gray[200]};
`;

const Info = styled.div`
    flex: 1;
`;

const Name = styled.div`
    font-size: 13px;
    font-weight: 600;
    color: ${colors.gray[900]};
`;

const Meta = styled.div`
    font-size: 11px;
    color: ${colors.gray[500]};
`;

const Divider = styled.div`
    height: 1px;
    background-color: ${colors.gray[200]};
    margin: ${spacing[1]}px 0;
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: ${spacing[2]}px;
    margin-top: ${spacing[2]}px;
    width: 100%;
`;

const LoadMoreBtn = styled.button`
    flex: 1;
    padding: 8px;
    font-size: 13px;
    font-weight: 600;
    color: ${colors.gray[600]};
    background-color: ${colors.gray[100]};
    border-radius: ${radius.md};
    border: none;
    cursor: pointer;
    transition: background-color 0.2s;

    &:active {
        background-color: ${colors.gray[200]};
    }
`;

const CloseBtn = styled(LoadMoreBtn) <{ hasNextPage?: boolean }>`
    background-color: ${({ hasNextPage }) => hasNextPage ? 'white' : colors.gray[100]};
    border: ${({ hasNextPage }) => hasNextPage ? `1px solid ${colors.gray[200]}` : 'none'};
    color: ${colors.gray[700]};

    &:active {
        background-color: ${({ hasNextPage }) => hasNextPage ? colors.gray[50] : colors.gray[200]};
    }
`;


