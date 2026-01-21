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
