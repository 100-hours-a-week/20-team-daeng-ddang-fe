import { RankingSummary, RankingList, RankingQueryParams } from "../model/types";
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
    }
};
