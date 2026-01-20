import { create } from "zustand";

interface LatLng {
    lat: number;
    lng: number;
}

interface WalkState {
    walkMode: "idle" | "walking";
    currentPos: LatLng | null;
    walkId: number | null;
    startTime: Date | null;
    elapsedTime: number;
    distance: number;
    path: LatLng[];

    startWalk: (id?: number) => void;
    endWalk: () => void;
    reset: () => void;
    setCurrentPos: (pos: LatLng) => void;
    incrementTime: () => void;
    addPathPoint: (pos: LatLng) => void;
    addDistance: (km: number) => void;
}

export const useWalkStore = create<WalkState>((set) => ({
    walkMode: "idle",
    currentPos: null,
    walkId: null,
    startTime: null,
    elapsedTime: 0,
    distance: 0,
    path: [],

    startWalk: (id?: number) =>
        set({
            walkMode: "walking",
            walkId: id ?? null, // Optional for now, but will come from API
            startTime: new Date(),
            elapsedTime: 0,
            distance: 0,
            path: [],
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
}));
