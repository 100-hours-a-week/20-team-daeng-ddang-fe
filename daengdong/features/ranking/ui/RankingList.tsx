"use client";

import { RankingItem } from "@/entities/ranking/model/types";
import styled from "@emotion/styled";
import { colors, spacing } from "@/shared/styles/tokens";
import Image from "next/image";
import { resolveS3Url } from "@/shared/utils/resolveS3Url";
import { useEffect, useRef } from "react";


interface RankingListProps {
    ranks: RankingItem[];
    myRankInfo?: RankingItem | null;
    onLoadMore: () => void;
    hasMore: boolean;
}

export const RankingList = ({ ranks, myRankInfo, onLoadMore, hasMore }: RankingListProps) => {
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore) {
                onLoadMore();
            }
        });

        if (loadMoreRef.current) {
            observerRef.current.observe(loadMoreRef.current);
        }

        return () => observerRef.current?.disconnect();
    }, [hasMore, onLoadMore]);

    const getGapInfo = (itemRank: number, itemDistance: number) => {
        if (!myRankInfo) return null;
        const myRank = myRankInfo.rank;
        const myDistance = myRankInfo.totalDistance;

        if (itemRank === myRank - 1) {
            const diff = itemDistance - myDistance;
            return { type: 'target' as const, diff: `+${diff.toFixed(1)}km` };
        } else if (itemRank === myRank + 1) {
            const diff = myDistance - itemDistance;
            return { type: 'chaser' as const, diff: `-${diff.toFixed(1)}km` };
        }
        return null;
    };

    return (
        <ListContainer>
            {ranks.map((item) => {
                const isMyRank = item.dogId === myRankInfo?.dogId;
                const gapInfo = getGapInfo(item.rank, item.totalDistance);

                return (
                    <RankRow key={`rank-${item.rank}-${item.dogId}`} isMyRank={isMyRank} id={`rank-item-${item.dogId}`}>
                        <RankNum isMyRank={isMyRank}>{item.rank}</RankNum>
                        <Avatar>
                            {item.profileImageUrl ? (
                                <Image src={resolveS3Url(item.profileImageUrl) || ''} alt={item.dogName} width={40} height={40} style={{ objectFit: 'cover' }} />
                            ) : (
                                <div style={{ backgroundColor: colors.gray[300], width: '100%', height: '100%' }} />
                            )}
                        </Avatar>
                        <Info>
                            <NameRow>
                                <Name>{item.dogName}</Name>
                                {gapInfo && (
                                    <GapBadge type={gapInfo.type}>
                                        {gapInfo.diff}
                                    </GapBadge>
                                )}
                            </NameRow>
                            <SubInfo>{item.breed || '견종 미입력'} • {item.age || '?'}살</SubInfo>
                        </Info>
                        <DistanceContainer>
                            <DistanceValue>
                                {item.totalDistance.toLocaleString()}
                                <DistanceUnit>km</DistanceUnit>
                            </DistanceValue>
                        </DistanceContainer>
                    </RankRow>
                );
            })}

            {hasMore && <LoadingTrigger ref={loadMoreRef}>Loading...</LoadingTrigger>}
        </ListContainer>
    );
};

const ListContainer = styled.div`
    display: flex;
    flex-direction: column;
    padding: 0 ${spacing[4]}px ${spacing[6]}px;
`;

const RankRow = styled.div<{ isMyRank: boolean }>`
    display: flex;
    align-items: center;
    padding: ${spacing[3]}px 0;
    border-bottom: 1px solid ${colors.gray[100]};
    background-color: ${({ isMyRank }) => isMyRank ? colors.primary[50] : 'transparent'};
    margin: ${({ isMyRank }) => isMyRank ? `0 -${spacing[4]}px` : '0'};
    padding-left: ${({ isMyRank }) => isMyRank ? `${spacing[4]}px` : '0'};
    padding-right: ${({ isMyRank }) => isMyRank ? `${spacing[4]}px` : '0'};
    
    &:last-child {
        border-bottom: none;
    }
`;

const RankNum = styled.div<{ isMyRank: boolean }>`
    width: 30px;
    font-size: 16px;
    font-weight: 700;
    color: ${({ isMyRank }) => isMyRank ? colors.primary[600] : colors.gray[500]};
    text-align: center;
    margin-right: ${spacing[3]}px;
`;

const Avatar = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
    margin-right: ${spacing[3]}px;
    background-color: ${colors.gray[200]};
`;

const Info = styled.div`
    flex: 1;
`;

const NameRow = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
`;

const Name = styled.div`
    font-size: 15px;
    font-weight: 600;
    color: ${colors.gray[900]};
`;

const GapBadge = styled.span<{ type: 'target' | 'chaser' }>`
    font-size: 10px;
    font-weight: 700;
    padding: 2px 5px;
    border-radius: 4px;
    color: ${({ type }) => type === 'target' ? '#E65100' : '#1565C0'};
    background-color: ${({ type }) => type === 'target' ? '#FFF3E0' : '#E3F2FD'};
`;

const SubInfo = styled.div`
    font-size: 12px;
    color: ${colors.gray[500]};
    margin-top: 2px;
`;

const DistanceContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: center;
    min-width: 60px; /* Ensure space for alignment */
`;

const DistanceValue = styled.div`
    font-size: 15px;
    font-weight: 700;
    color: ${colors.gray[600]};
    letter-spacing: -0.5px;
    font-variant-numeric: tabular-nums; /* Align numbers */
`;

const DistanceUnit = styled.span`
    font-size: 11px;
    font-weight: 500;
    color: ${colors.gray[500]};
    margin-left: 2px;
`;

const LoadingTrigger = styled.div`
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: ${colors.gray[400]};
`;
