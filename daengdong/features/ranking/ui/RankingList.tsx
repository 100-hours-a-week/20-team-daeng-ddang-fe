"use client";

import { RankingItem } from "@/entities/ranking/model/types";
import styled from "@emotion/styled";
import { colors, spacing } from "@/shared/styles/tokens";
import { useEffect } from "react";
import { calculateAge } from "@/shared/utils/calculateAge";
import { GapBadge, RankItem } from "./RankItem";
import { formatDistance } from "@/shared/utils/formatDistance";

interface RankingListProps {
    ranks: RankingItem[];
    myRankInfo?: RankingItem | null;
    onLoadMore: () => void;
    hasMore: boolean;
    isFetchingNextPage: boolean;
    scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

import { useVirtualizer } from "@tanstack/react-virtual";
export const RankingList = ({ ranks, myRankInfo, onLoadMore, hasMore, isFetchingNextPage, scrollContainerRef }: RankingListProps) => {
    // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Virtual API
    const virtualizer = useVirtualizer({
        count: ranks.length,
        getScrollElement: () => scrollContainerRef.current,
        estimateSize: () => 64,
        overscan: 5,
    });

    const virtualItems = virtualizer.getVirtualItems();

    useEffect(() => {
        if (!virtualItems.length) return;

        const lastVirtualItem = virtualItems[virtualItems.length - 1];
        const lastIndex = ranks.length - 1;

        if (
            lastVirtualItem.index >= lastIndex &&
            hasMore &&
            !isFetchingNextPage
        ) {
            onLoadMore();
        }
    }, [virtualItems, ranks.length, hasMore, isFetchingNextPage, onLoadMore]);

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
        <ListContainer style={{ height: `${virtualizer.getTotalSize()}px` }}>
            {virtualItems.map((virtualRow) => {
                const itemIndex = virtualRow.index;
                const item = ranks[itemIndex];
                if (!item) return null;

                const isMyRank = item.dogId === myRankInfo?.dogId;
                const gapInfo = getGapInfo(item.rank, item.totalDistance);

                return (
                    <VirtualItemWrapper
                        key={`rank-wrapper-${item.dogId ?? virtualRow.index}`}
                        data-index={virtualRow.index}
                        ref={virtualizer.measureElement}
                        style={{
                            transform: `translateY(${virtualRow.start}px)`,
                        }}
                    >
                        <RankItem
                            key={`rank-${item.dogId ?? virtualRow.index}`}
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
                    </VirtualItemWrapper>
                );
            })}
        </ListContainer>
    );
};

const ListContainer = styled.div`
    position: relative;
    width: 100%;
    padding: 0 ${spacing[4]}px;
`;

const VirtualItemWrapper = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    padding: 0 ${spacing[4]}px;
`;

const DistanceUnit = styled.span`
    font-size: 11px;
    font-weight: 500;
    color: ${colors.gray[500]};
    margin-left: 2px;
`;
