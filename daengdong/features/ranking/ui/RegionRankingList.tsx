import styled from "@emotion/styled";
import { RegionRankingItem, PeriodType } from "@/entities/ranking/model/types";
import { RegionRankRow } from "./RegionRankRow";
import { useEffect, useRef } from "react";
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
}

export const RegionRankingList = ({
    ranks,
    expandedRegionId,
    onToggleRegion,
    onLoadMore,
    hasMore,
    periodType,
    periodValue,
    userRegionId
}: RegionRankingListProps) => {
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

    return (
        <ListContainer>
            {ranks.map((item) => {
                const isMy = userRegionId === item.regionId;
                return (
                    <RegionRankRow
                        key={`region-${item.regionId}`}
                        item={item}
                        isExpanded={expandedRegionId === item.regionId}
                        onToggle={() => onToggleRegion(item.regionId)}
                        periodType={periodType}
                        periodValue={periodValue}
                        isMyRegion={isMy}
                    />
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
    color: #999;
`;
