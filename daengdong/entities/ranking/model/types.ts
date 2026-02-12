export type PeriodType = 'WEEK' | 'MONTH' | 'YEAR';
export type ScopeType = 'NATIONWIDE' | 'REGIONAL';

export interface RankingItem {
    rank: number;
    dogId: number;
    dogName: string;
    profileImageUrl?: string;
    totalDistance: number;
    breed?: string;
    age?: number;
    birthDate?: string;
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

export interface RegionRankingItem {
    rank: number;
    regionId: number;
    regionName: string;
    totalDistance: number;
}

export interface RegionRankingList {
    ranks: RegionRankingItem[];
    nextCursor: string | null;
    hasNext: boolean;
}

export interface RegionRankingSummary {
    topRanks: RegionRankingItem[];
    myRank: RegionRankingItem | null;
}

export interface ContributionRankingItem {
    rank: number;
    dogId: number;
    dogName: string;
    profileImageUrl?: string;
    dogDistance: number;
    contributionRate: number;
}

export interface ContributionRankingSummary {
    topRanks: ContributionRankingItem[];
    myRank: ContributionRankingItem | null;
}

export interface ContributionRankingList {
    ranks: ContributionRankingItem[];
    nextCursor: string | null;
    hasNext: boolean;
}

export interface RegionRankingQueryParams {
    periodType: PeriodType;
    periodValue: string;
    regionId?: number; // Added for summary
    cursor?: string;
    limit?: number;
}

export interface ContributionRankingQueryParams {
    periodType: PeriodType;
    periodValue: string;
    regionId: number;
    cursor?: string;
    limit?: number;
}
