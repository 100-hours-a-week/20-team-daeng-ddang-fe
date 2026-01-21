import { create } from "zustand";
import { WalkState } from "./types";

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
            walkResult: null,
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
            walkResult: null,
        }),

    setCurrentPos: (pos) =>
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
