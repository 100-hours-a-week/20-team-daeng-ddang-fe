export interface LatLng {
    lat: number;
    lng: number;
}

export interface WalkResult {
    time: number;
    distance: number;
    imageUrl?: string;
}

export interface WalkState {
    walkMode: "idle" | "walking";
    currentPos: LatLng | null;
    walkId: number | null;
    startTime: Date | null;
    elapsedTime: number;
    distance: number;
    path: LatLng[];
    walkResult: WalkResult | null;

    startWalk: (id?: number) => void;
    endWalk: () => void;
    reset: () => void;
    setCurrentPos: (pos: LatLng) => void;
    incrementTime: () => void;
    addPathPoint: (pos: LatLng) => void;
    addDistance: (km: number) => void;
    setWalkResult: (result: WalkResult) => void;
}

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

export interface WriteWalkDiaryRequest {
    walkId: number;
    memo: string;
}

export interface WriteWalkDiaryResponse {
    message: string;
    data: {
        walkDiaryId: number;
        walkId: number;
        createdAt: string;
    };
    errorCode: null;
}

export interface BlockData {
    blockId: string;
    dogId: number;
}
