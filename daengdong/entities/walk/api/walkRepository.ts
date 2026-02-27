import { http } from "@/shared/api/http";
import { ApiResponse } from "@/shared/api/types";
import {
    BlockData,
    MissionAnalysisData,
    StartWalkResponse,
    EndWalkResponse,
    WriteWalkDiaryResponse
} from "../model/types";
import { WalkRepository } from "./types";

interface BlocksResponse {
    blocks: BlockData[];
}

export const walkRepository: WalkRepository = {
    getNearbyBlocks: async (params) => {
        const { data } = await http.get<ApiResponse<BlocksResponse>>("/blocks", { params });
        return data.data.blocks;
    },
    getMyBlocks: async (lat, lng) => {
        const { data } = await http.get<ApiResponse<BlocksResponse>>("/walks/blocks", {
            params: { lat, lng },
        });
        return data.data.blocks;
    },
    judgeWalkMissions: async (walkId) => {
        const { data } = await http.post<ApiResponse<MissionAnalysisData>>(
            `/walks/${walkId}/missions/analysis`,
            {},
            { timeout: 0 }
        );
        return data.data;
    },
    startWalk: async (req) => {
        const { data } = await http.post<ApiResponse<StartWalkResponse>>("/walks", req);
        return data.data;
    },
    endWalk: async (req) => {
        const { data } = await http.post<ApiResponse<EndWalkResponse>>(`/walks/${req.walkId}`, req);
        return data.data;
    },
    postWalkDiary: async (req) => {
        const { data } = await http.post<WriteWalkDiaryResponse>(`/walks/${req.walkId}/diaries`, {
            memo: req.memo,
            mapImageUrl: req.mapImageUrl
        });
        return data;
    },
};
