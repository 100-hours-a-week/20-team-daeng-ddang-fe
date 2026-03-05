import styled from "@emotion/styled";
import { RegionRankingItem, PeriodType } from "@/entities/ranking/model/types";
import { RegionRankRow } from "./RegionRankRow";
import React, { useEffect } from "react";
import { spacing } from "@/shared/styles/tokens";

interface RegionRankingListProps {
    ranks: RegionRankingItem[];
    expandedRegionId: number | null;
    onToggleRegion: (regionId: number) => void;
    onLoadMore: () => void;
    hasMore: boolean;
    periodType: PeriodType;
    periodValue: string;
    userRegionId?: number;
    isFetchingNextPage: boolean;
    scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

import { useVirtualizer } from "@tanstack/react-virtual";

export const RegionRankingList = ({
    ranks,
    expandedRegionId,
    onToggleRegion,
    onLoadMore,
    hasMore,
    periodType,
    periodValue,
    userRegionId,
    isFetchingNextPage,
    scrollContainerRef
}: RegionRankingListProps) => {
    const virtualizer = useVirtualizer({
        count: ranks.length,
        getScrollElement: () => scrollContainerRef.current,
        estimateSize: () => 64,
        overscan: 5,
    });

    // expandedRegionId 변경 시 크기 재계산
    useEffect(() => {
        virtualizer.measure();
    }, [expandedRegionId, virtualizer]);

    const virtualItems = virtualizer.getVirtualItems();

    useEffect(() => {
        if (!virtualItems.length) return;

        const lastVirtualItem = virtualItems[virtualItems.length - 1];
        if (
            lastVirtualItem.index >= ranks.length - 1 &&
            hasMore &&
            !isFetchingNextPage
        ) {
            onLoadMore();
        }
    }, [virtualItems, ranks.length, hasMore, isFetchingNextPage, onLoadMore]);

    return (
        <ListContainer style={{ height: `${virtualizer.getTotalSize()}px` }}>
            {virtualItems.map((virtualRow) => {
                const item = ranks[virtualRow.index];
                if (!item) return null;
                const isMy = userRegionId === item.regionId;
                return (
                    <VirtualItemWrapper
                        key={`region-wrapper-${item.regionId}`}
                        data-index={virtualRow.index}
                        ref={virtualizer.measureElement}
                        style={{
                            transform: `translateY(${virtualRow.start}px)`,
                        }}
                    >
                        <RegionRankRow
                            key={`region-${item.regionId}`}
                            item={item}
                            isExpanded={expandedRegionId === item.regionId}
                            onToggle={() => onToggleRegion(item.regionId)}
                            periodType={periodType}
                            periodValue={periodValue}
                            isMyRegion={isMy}
                        />
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
