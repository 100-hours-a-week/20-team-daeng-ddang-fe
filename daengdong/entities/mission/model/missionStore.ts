import { create } from "zustand";

export interface Mission {
    missionId: number;
    title: string;
    description: string;
}

interface MissionStore {
    currentMission: Mission | null;
    completedMissionIds: number[];
    setCurrentMission: (mission: Mission) => void;
    clearCurrentMission: () => void;
    addCompletedMissionId: (missionId: number) => void;
}

export const useMissionStore = create<MissionStore>((set) => ({
    currentMission: null,
    completedMissionIds: [],
    setCurrentMission: (mission) => set({ currentMission: mission }),
    clearCurrentMission: () => set({ currentMission: null }),
    addCompletedMissionId: (missionId) =>
        set((state) => ({
            completedMissionIds: state.completedMissionIds.includes(missionId)
                ? state.completedMissionIds
                : [...state.completedMissionIds, missionId],
        })),
}));
