import { RankingSummary, RankingList, RankingQueryParams, RegionRankingQueryParams, RegionRankingList, RegionRankingSummary, ContributionRankingQueryParams, ContributionRankingSummary, ContributionRankingList } from "../model/types";
import { ApiResponse } from "@/shared/api/types";
import { http } from "@/shared/api/http";

export const rankingApi = {
    getRankingSummary: async (params: RankingQueryParams): Promise<ApiResponse<RankingSummary>> => {
        const { data } = await http.get<ApiResponse<RankingSummary>>("/rankings/dogs/summary", {
            params: {
                periodType: params.periodType,
                periodValue: params.periodValue,
                regionId: params.regionId,
            }
        });
        return data;
    },

    getRankingList: async (params: RankingQueryParams): Promise<ApiResponse<RankingList>> => {
        const { data } = await http.get<ApiResponse<RankingList>>("/rankings/dogs", {
            params: {
                periodType: params.periodType,
                periodValue: params.periodValue,
                regionId: params.regionId,
                cursor: params.cursor,
                limit: params.limit,
            }
        });
        return data;
    },

    getRegionRankingSummary: async (params: RegionRankingQueryParams): Promise<ApiResponse<RegionRankingSummary>> => {
        const { data } = await http.get<ApiResponse<RegionRankingSummary>>("/rankings/regions/summary", {
            params: {
                periodType: params.periodType,
                periodValue: params.periodValue,
                regionId: params.regionId,
            }
        });
        return data;
    },

    getRegionRankingList: async (params: RegionRankingQueryParams): Promise<ApiResponse<RegionRankingList>> => {
        const { data } = await http.get<ApiResponse<RegionRankingList>>("/rankings/regions", {
            params: {
                periodType: params.periodType,
                periodValue: params.periodValue,
                cursor: params.cursor,
                limit: params.limit,
            }
        });
        return data;
    },

    getRegionContributionSummary: async (params: ContributionRankingQueryParams): Promise<ApiResponse<ContributionRankingSummary>> => {
        const { data } = await http.get<ApiResponse<ContributionRankingSummary>>("/rankings/regions/contributions/summary", {
            params: {
                periodType: params.periodType,
                periodValue: params.periodValue,
                regionId: params.regionId,
            }
        });
        return data;
    },

    getRegionContributionList: async (params: ContributionRankingQueryParams): Promise<ApiResponse<ContributionRankingList>> => {
        const { data } = await http.get<ApiResponse<ContributionRankingList>>("/rankings/regions/contributions", {
            params: {
                periodType: params.periodType,
                periodValue: params.periodValue,
                regionId: params.regionId,
                cursor: params.cursor,
                limit: params.limit,
            }
        });
        return data;
    }
};
