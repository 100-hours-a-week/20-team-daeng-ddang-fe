export type PeriodType = 'WEEK' | 'MONTH' | 'YEAR';
export type ScopeType = 'NATIONWIDE' | 'REGIONAL';

export interface RankingItem {
    rank: number;
    dogId: number;
    dogName: string;
    profileImageUrl?: string;
    totalDistance: number;
    breed: string;
    age: number;
}

export type MyRankInfo = RankingItem;

export interface RankingSummary {
    topRanks: RankingItem[];
    myRank: MyRankInfo | null;
}

export interface RankingList {
    ranks: RankingItem[];
    nextCursor: string | null;
    hasNext: boolean;
}

export interface RankingQueryParams {
    periodType: PeriodType;
    periodValue: string;
    regionId?: number;
    cursor?: string;
    limit?: number;
}
