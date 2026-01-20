import { http } from "@/shared/api/http";

export interface StartWalkRequest {
    startLat: number;
    startLng: number;
}

export interface StartWalkResponse {
    message: string;
    data: {
        walkId: number;
        startedAt: string;
    };
}

export interface EndWalkRequest {
    walkId: number;
    endLat: number;
    endLng: number;
    totalDistanceKm: number;
    durationSeconds: number;
    status: "FINISHED";
}

export interface EndWalkResponse {
    message: string;
    data: {
        walkId: number;
        startedAt: string;
        endedAt: string;
        totalDistanceKm: number;
        durationSeconds: number;
        occupiedBlockCount: number;
        status: "FINISHED";
    };
}

export const startWalkApi = async (req: StartWalkRequest) => {
    // TODO: 연동 시 주석 해제
    // const response = await http.post<StartWalkResponse>("/api/v3/walks", req);
    // return response;

    // Mock response
    console.log("POST /api/v3/walks", req);
    return {
        message: "산책이 시작되었습니다.",
        data: {
            walkId: Math.floor(Math.random() * 1000),
            startedAt: new Date().toISOString(),
        },
    } as StartWalkResponse;
};

export const endWalkApi = async (req: EndWalkRequest) => {
    // TODO: 연동 시 주석 해제
    // const response = await http.post<EndWalkResponse>(`/api/v3/walks/${req.walkId}`, req);
    // return response;

    // Mock response
    console.log(`POST /api/v3/walks/${req.walkId}`, req);
    return {
        message: "산책이 정상적으로 종료되었습니다.",
        data: {
            walkId: req.walkId,
            startedAt: new Date().toISOString(), // Mock, should be actual start time
            endedAt: new Date().toISOString(),
            totalDistanceKm: req.totalDistanceKm,
            durationSeconds: req.durationSeconds,
            occupiedBlockCount: 0, // Mock
            status: "FINISHED",
        },
    } as EndWalkResponse;
};
