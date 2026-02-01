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

    // 산책이 시작되고 아직 예약된 미션이 없을 때 스케줄링 시작
    useEffect(() => {
        if (walkMode !== "walking" || !startTime) return;
        if (scheduledMissions.length > 0) return;

        const initializeMissions = async () => {
            try {
                const response = await missionApi.getMissions();
                const availableMissions = response.missions;

                // 랜덤 미션 3개 선택
                const shuffled = [...availableMissions].sort(() => 0.5 - Math.random());
                const selected = shuffled.slice(0, 3);

                // M1: 5-10 분 후
                // M2: 20-40 분 후
                // M3: 40-60 분 후

                let currentOffset = 0;
                const newSchedule: { mission: Mission; triggerAt: number; triggered: boolean }[] = [];

                // M1: 5-10 분 후
                // const delay1 = (Math.floor(Math.random() * (10 - 5 + 1)) + 5) * 60 * 1000;
                const delay1 = 10; // 테스트용 10초후 돌발미션 활성화
                currentOffset += delay1;
                if (selected[0]) newSchedule.push({ mission: selected[0], triggerAt: startTime + currentOffset, triggered: false });

                // M2: 산책 시작 후 20-40분
                const delay2 = (Math.floor(Math.random() * (40 - 20 + 1)) + 20) * 60 * 1000;
                if (selected[1]) newSchedule.push({ mission: selected[1], triggerAt: startTime + delay2, triggered: false });

                // M3: 산책 시작 후 40-60분
                const delay3 = (Math.floor(Math.random() * (60 - 40 + 1)) + 40) * 60 * 1000;
                if (selected[2]) newSchedule.push({ mission: selected[2], triggerAt: startTime + delay3, triggered: false });

                console.log("[MissionScheduler] Scheduled:", newSchedule.map(s => new Date(s.triggerAt).toLocaleTimeString()));
                setScheduledMissions(newSchedule);

            } catch (e) {
                console.error("Failed to fetch missions:", e);
            }
        };

        initializeMissions();
    }, [walkMode, startTime, scheduledMissions.length, setScheduledMissions]);

    // 주기적으로 스케줄 확인
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

            // 새로 트리거된 미션이 있는지 확인
            const newlyTriggered = updated.find((item, idx) => item.triggered && !scheduledMissions[idx].triggered);
            if (newlyTriggered) {
                console.log("[MissionScheduler] Triggering:", newlyTriggered.mission.title);
                setActiveMissionAlert(newlyTriggered.mission);
                setScheduledMissions(updated);
            }

        }, 1000);

        return () => clearInterval(interval);
    }, [walkMode, startTime, scheduledMissions, activeMissionAlert, setScheduledMissions, setActiveMissionAlert]);
};
