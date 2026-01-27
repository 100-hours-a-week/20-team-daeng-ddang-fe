import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { WalkState } from "./types";

export const useWalkStore = create<WalkState>()(
    persist(
        (set) => ({
            walkMode: "idle",
            currentPos: null,
            walkId: null,
            startTime: null,
            elapsedTime: 0,
            distance: 0,
            path: [],
            walkResult: null,
            myBlocks: [],
            othersBlocks: [],

            startWalk: (id?: number) =>
                set({
                    walkMode: "walking",
                    walkId: id ?? null,
                    startTime: Date.now(),
                    elapsedTime: 0,
                    distance: 0,
                    path: [],
                    walkResult: null,
                    myBlocks: [],
                    othersBlocks: [],
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
                    myBlocks: [],
                    othersBlocks: [],
                    // walkResult preserved for summary page
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
                    myBlocks: [],
                    othersBlocks: [],
                }),

            setCurrentPos: (pos) =>
                set({ currentPos: pos }),

            incrementTime: () =>
                set((state) => {
                    if (!state.startTime) return state;
                    const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
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

            setMyBlocks: (blocks) =>
                set({ myBlocks: blocks }),

            setOthersBlocks: (blocks) =>
                set({ othersBlocks: blocks }),

            addMyBlock: (block) =>
                set((state) => ({
                    myBlocks: [...state.myBlocks, block],
                })),

            removeMyBlock: (blockId) =>
                set((state) => ({
                    myBlocks: state.myBlocks.filter((b) => b.blockId !== blockId),
                })),

            updateOthersBlock: (block) =>
                set((state) => {
                    const existing = state.othersBlocks.find((b) => b.blockId === block.blockId);
                    if (existing) {
                        return {
                            othersBlocks: state.othersBlocks.map((b) =>
                                b.blockId === block.blockId ? block : b
                            ),
                        };
                    }
                    return {
                        othersBlocks: [...state.othersBlocks, block],
                    };
                }),

            removeOthersBlock: (blockId) =>
                set((state) => ({
                    othersBlocks: state.othersBlocks.filter((b) => b.blockId !== blockId),
                })),
        }),
        {
            name: "walk-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
);
