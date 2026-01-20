import { create } from "zustand";

interface LatLng {
    lat: number;
    lng: number;
}

interface WalkState {
    walkMode: "idle" | "walking";
    elapsedTime: number;
    distance: number;
    path: LatLng[];

    startWalk: () => void;
    endWalk: () => void;
    reset: () => void;
    incrementTime: () => void;
    addPathPoint: (pos: LatLng) => void;
    addDistance: (km: number) => void;
}

export const useWalkStore = create<WalkState>((set) => ({
    walkMode: "idle",
    elapsedTime: 0,
    distance: 0,
    path: [],

    startWalk: () =>
        set({
            walkMode: "walking",
            elapsedTime: 0,
            distance: 0,
            path: [],
        }),

    endWalk: () =>
        set({
            walkMode: "idle",
            elapsedTime: 0,
            distance: 0,
            path: [],
        }),

    reset: () =>
        set({
            walkMode: "idle",
            elapsedTime: 0,
            distance: 0,
            path: [],
        }),

    incrementTime: () =>
        set((state) => ({
            elapsedTime: state.elapsedTime + 1,
        })),

    addPathPoint: (pos) =>
        set((state) => ({
            path: [...state.path, pos],
        })),

    addDistance: (km) =>
        set((state) => ({
            distance: state.distance + km,
        })),
}));
