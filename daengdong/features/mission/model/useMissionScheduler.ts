import { useEffect } from "react";
import { useWalkStore } from "@/entities/walk/model/walkStore";
import { missionApi, Mission } from "@/entities/mission/api/mission";

export const useMissionScheduler = () => {
    const walkMode = useWalkStore((state) => state.walkMode);
    const startTime = useWalkStore((state) => state.startTime);
    const scheduledMissions = useWalkStore((state) => state.scheduledMissions);
    const setScheduledMissions = useWalkStore((state) => state.setScheduledMissions);
    const setActiveMissionAlert = useWalkStore((state) => state.setActiveMissionAlert);
    const activeMissionAlert = useWalkStore((state) => state.activeMissionAlert);

    // Start Scheduling when walk starts and no missions scheduled yet
    useEffect(() => {
        if (walkMode !== "walking" || !startTime) return;
        if (scheduledMissions.length > 0) return; // Already scheduled

        const initializeMissions = async () => {
            try {
                const response = await missionApi.getMissions();
                const availableMissions = response.missions;

                // Select 3 random missions
                const shuffled = [...availableMissions].sort(() => 0.5 - Math.random());
                const selected = shuffled.slice(0, 3);

                // Rules:
                // M1: 5-10 min (300-600s)
                // M2-M3: +10-20 min (600-1200s)

                let currentOffset = 0;
                const newSchedule: { mission: Mission; triggerAt: number; triggered: boolean }[] = [];

                // M1
                const delay1 = (Math.floor(Math.random() * (10 - 5 + 1)) + 5) * 60 * 1000;
                currentOffset += delay1;
                if (selected[0]) newSchedule.push({ mission: selected[0], triggerAt: startTime + currentOffset, triggered: false });

                // M2
                const delay2 = (Math.floor(Math.random() * (20 - 10 + 1)) + 10) * 60 * 1000;
                currentOffset += delay2;
                if (selected[1]) newSchedule.push({ mission: selected[1], triggerAt: startTime + currentOffset, triggered: false });

                // M3
                const delay3 = (Math.floor(Math.random() * (20 - 10 + 1)) + 10) * 60 * 1000;
                currentOffset += delay3;
                if (selected[2]) newSchedule.push({ mission: selected[2], triggerAt: startTime + currentOffset, triggered: false });

                console.log("[MissionScheduler] Scheduled:", newSchedule.map(s => new Date(s.triggerAt).toLocaleTimeString()));
                setScheduledMissions(newSchedule);

            } catch (e) {
                console.error("Failed to fetch missions:", e);
            }
        };

        initializeMissions();
    }, [walkMode, startTime, scheduledMissions.length, setScheduledMissions]);

    // Check triggers
    useEffect(() => {
        if (walkMode !== "walking" || !startTime) return;

        const interval = setInterval(() => {
            const now = Date.now();
            const updated = scheduledMissions.map(item => {
                if (!item.triggered && now >= item.triggerAt) {
                    return { ...item, triggered: true };
                }
                return item;
            });

            // Is there a newly triggered item?
            const newlyTriggered = updated.find((item, idx) => item.triggered && !scheduledMissions[idx].triggered);
            if (newlyTriggered) {
                console.log("[MissionScheduler] Triggering:", newlyTriggered.mission.title);
                // Only set alert if no alert is active? 
                // However, "triggerAt" logic implies we process it. 
                // If an alert is already active, we might overwrite it or queue? 
                // Given the interval > 10m, active alerts (10s duration) shouldn't overlap.
                setActiveMissionAlert(newlyTriggered.mission);
                setScheduledMissions(updated);
            }

        }, 1000);

        return () => clearInterval(interval);
    }, [walkMode, startTime, scheduledMissions, activeMissionAlert, setScheduledMissions, setActiveMissionAlert]);
};
