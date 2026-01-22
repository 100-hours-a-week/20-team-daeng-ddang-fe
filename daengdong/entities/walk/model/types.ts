export interface LatLng {
    lat: number;
    lng: number;
}

export interface WalkResult {
    time: number;
    distance: number;
    imageUrl?: string;
    blockCount?: number;
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
    myBlocks: BlockData[];
    othersBlocks: BlockData[];

    startWalk: (id?: number) => void;
    endWalk: () => void;
    reset: () => void;
    setCurrentPos: (pos: LatLng) => void;
    incrementTime: () => void;
    addPathPoint: (pos: LatLng) => void;
    addDistance: (km: number) => void;
    setWalkResult: (result: WalkResult) => void;
    setMyBlocks: (blocks: BlockData[]) => void;
    setOthersBlocks: (blocks: BlockData[]) => void;
    addMyBlock: (block: BlockData) => void;
    removeMyBlock: (blockId: string) => void;
    updateOthersBlock: (block: BlockData) => void;
    removeOthersBlock: (blockId: string) => void;
}

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
    occupiedAt?: string;
}

export interface NearbyBlocksParams {
    lat: number;
    lng: number;
    radius: number;
}

export interface MissionRecord {
    missionRecordId: number;
    missionId: number;
    title: string;
    status: "SUCCESS" | "FAIL";
    confidence: number;
    message: string;
}

export interface MissionAnalysisData {
    walkId: number;
    analyzedAt: string;
    missions: MissionRecord[];
}

export interface MissionAnalysisResponse {
    message: string;
    data: MissionAnalysisData;
    errorCode: string | null;
}
