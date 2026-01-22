import { http } from "@/shared/api/http";
import { ApiResponse } from "@/shared/api/types";
import {
    StartWalkRequest,
    StartWalkResponse,
    EndWalkRequest,
    EndWalkResponse,
    WriteWalkDiaryRequest,
    WriteWalkDiaryResponse
} from "../model/types";

export const startWalkApi = async (req: StartWalkRequest) => {
    // TODO: 연동 시 주석 해제
    // const response = await http.post<ApiResponse<StartWalkResponse>>("/api/v3/walks", req);
    // return response.data;

    // Mock response
    console.log("POST /api/v3/walks", req);
    return {
        message: "산책이 시작되었습니다.",
        data: {
            walkId: Math.floor(Math.random() * 1000),
            startedAt: new Date().toISOString(),
        },
        errorCode: null
    };
};

export const endWalkApi = async (req: EndWalkRequest): Promise<ApiResponse<EndWalkResponse>> => {
    // TODO: 연동 시 주석 해제
    // const response = await http.post<ApiResponse<EndWalkResponse>>(`/api/v3/walks/${req.walkId}`, req);
    // return response.data;

    // Mock response
    console.log(`POST /api/v3/walks/${req.walkId}`, req);
    return {
        message: "산책이 정상적으로 종료되었습니다.",
        data: {
            walkId: req.walkId,
            startedAt: new Date().toISOString(),
            endedAt: new Date().toISOString(),
            totalDistanceKm: req.totalDistanceKm,
            durationSeconds: req.durationSeconds,
            occupiedBlockCount: 0,
            status: "FINISHED",
        } as EndWalkResponse,
        errorCode: null
    };
};

export const postWalkDiary = async (req: WriteWalkDiaryRequest) => {
    // TODO: 연동 시 주석 해제
    // const response = await http.post<WriteWalkDiaryResponse>(`/api/v3/walks/${req.walkId}/diaries`, { memo: req.memo });
    // return response;

    // Mock response
    console.log(`POST /api/v3/walks/${req.walkId}/diaries`, { memo: req.memo });
    return {
        message: "산책일지가 작성되었습니다.",
        data: {
            walkDiaryId: 10,
            walkId: req.walkId,
            createdAt: new Date().toISOString(),
        },
        errorCode: null,
    } as WriteWalkDiaryResponse;
};
