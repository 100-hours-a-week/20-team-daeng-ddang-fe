import { create } from "zustand";

interface LatLng {
    lat: number;
    lng: number;
}

interface WalkResult {
    time: number;
    distance: number;
    imageUrl?: string;
}

interface WalkState {
    walkMode: "idle" | "walking";
    currentPos: LatLng | null;
    walkId: number | null;
    startTime: Date | null;
    elapsedTime: number;
    distance: number;
    path: LatLng[];
    walkResult: WalkResult | null; // Added walkResult

    startWalk: (id?: number) => void;
    endWalk: () => void;
    reset: () => void;
    setCurrentPos: (pos: LatLng) => void;
    incrementTime: () => void;
    addPathPoint: (pos: LatLng) => void;
    addDistance: (km: number) => void;
    setWalkResult: (result: WalkResult) => void; // Added setWalkResult
}

export const useWalkStore = create<WalkState>((set) => ({
    walkMode: "idle",
    currentPos: null,
    walkId: null,
    startTime: null,
    elapsedTime: 0,
    distance: 0,
    path: [],
    walkResult: null,

    startWalk: (id?: number) =>
        set({
            walkMode: "walking",
            walkId: id ?? null,
            startTime: new Date(),
            elapsedTime: 0,
            distance: 0,
            path: [],
            walkResult: null, // Clear result on start
        }),

    endWalk: () =>
        set({
            walkMode: "idle",
            currentPos: null,
            walkId: null,
            startTime: null,
            elapsedTime: 0,
            distance: 0,
            path: [],
            // Do NOT clear walkResult here, as we need it for the complete page
        }),

    reset: () =>
        set({
            walkMode: "idle",
            currentPos: null,
            walkId: null,
            startTime: null,
            elapsedTime: 0,
            distance: 0,
            path: [],
            walkResult: null,
        }),

    setCurrentPos: (pos: LatLng) =>
        set({ currentPos: pos }),

    incrementTime: () =>
        set((state) => {
            if (!state.startTime) return state;
            const now = new Date();
            const elapsed = Math.floor((now.getTime() - state.startTime.getTime()) / 1000);
            return { elapsedTime: elapsed };
        }),

    addPathPoint: (pos) =>
        set((state) => ({
            path: [...state.path, pos],
        })),

    addDistance: (km) =>
        set((state) => ({
            distance: state.distance + km,
        })),

    setWalkResult: (result) =>
        set({ walkResult: result }),
}));
