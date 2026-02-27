"use client";

import { RankingItem } from "@/entities/ranking/model/types";
import styled from "@emotion/styled";
import { colors, spacing } from "@/shared/styles/tokens";
import { useEffect, useRef } from "react";
import { calculateAge } from "@/shared/utils/calculateAge";
import { GapBadge, RankItem } from "./RankItem";
import { formatDistance } from "@/shared/utils/formatDistance";

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
            return { type: 'target' as const, diff: `+${formatDistance(diff)}km` };
        } else if (itemRank === myRank + 1) {
            const diff = myDistance - itemDistance;
            return { type: 'chaser' as const, diff: `-${formatDistance(diff)}km` };
        }
        return null;
    };

    return (
        <ListContainer>
            {ranks.map((item) => {
                const isMyRank = item.dogId === myRankInfo?.dogId;
                const gapInfo = getGapInfo(item.rank, item.totalDistance);

                return (
                    <RankItem
                        key={`rank-${item.rank}-${item.dogId}`}
                        isHighlighted={isMyRank}
                        id={`rank-item-${item.dogId}`}
                    >
                        <RankItem.Number isHighlighted={isMyRank}>{item.rank}</RankItem.Number>
                        <RankItem.Avatar src={item.profileImageUrl} alt={item.dogName} />
                        <RankItem.Info>
                            <RankItem.Name>
                                {item.dogName}
                                {gapInfo && <GapBadge type={gapInfo.type}>{gapInfo.diff}</GapBadge>}
                            </RankItem.Name>
                            <RankItem.SubInfo>
                                {[
                                    item.breed,
                                    item.birthDate ? `${calculateAge(item.birthDate)}살` : item.age ? `${item.age}살` : null
                                ].filter(Boolean).join(' • ')}
                            </RankItem.SubInfo>
                        </RankItem.Info>
                        <RankItem.Distance>
                            {formatDistance(item.totalDistance)}<DistanceUnit>km</DistanceUnit>
                        </RankItem.Distance>
                    </RankItem>
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

const LoadingTrigger = styled.div`
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: ${colors.gray[400]};
`;

const DistanceUnit = styled.span`
    font-size: 11px;
    font-weight: 500;
    color: ${colors.gray[500]};
    margin-left: 2px;
`;
