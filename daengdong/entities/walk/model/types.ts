export interface StartWalkRequest {
    startLat: number;
    startLng: number;
}

export interface StartWalkResponse {
    walkId: number;
    startedAt: string;
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
    walkId: number;
    startedAt: string;
    endedAt: string;
    totalDistanceKm: number;
    durationSeconds: number;
    occupiedBlockCount: number;
    status: "FINISHED";
}
