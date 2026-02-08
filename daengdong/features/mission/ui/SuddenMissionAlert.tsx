import styled from "@emotion/styled";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Mission } from "@/entities/mission/api/mission";
import { radius, spacing } from "@/shared/styles/tokens";
import { useMissionStore } from "@/entities/mission/model/missionStore";
import { useRouter } from "next/navigation";
import { useWalkStore } from "@/entities/walk/model/walkStore";

interface SuddenMissionAlertProps {
    mission: Mission;
}

export const SuddenMissionAlert = ({ mission }: SuddenMissionAlertProps) => {
    const router = useRouter();
    const { setCurrentMission } = useMissionStore();
    const { setActiveMissionAlert, walkId } = useWalkStore();
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [progress, setProgress] = useState(100);

    const STORAGE_KEY = `SUDDEN_KEY_ALERT_START_${walkId}_${mission.missionId}`;

    useEffect(() => {
        // 초기 / 복구 시간 설정
        const storedStart = sessionStorage.getItem(STORAGE_KEY);
        let startTime = 0;

        if (storedStart) {
            startTime = parseInt(storedStart, 10);
        } else {
            startTime = Date.now();
            sessionStorage.setItem(STORAGE_KEY, startTime.toString());
        }

        // 타이머
        const updateTimer = () => {
            const now = Date.now();
            const elapsed = Math.floor((now - startTime) / 1000);
            const remaining = 10 - elapsed;

            if (remaining <= 0) {
                sessionStorage.removeItem(STORAGE_KEY);
                setActiveMissionAlert(null);
                setTimeLeft(0);
                return false;
            }

            setTimeLeft(remaining);
            setProgress(Math.max(0, (remaining / 10) * 100));
            return true;
        };

        if (!updateTimer()) return;

        const timer = setInterval(() => {
            if (!updateTimer()) {
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [mission.missionId, setActiveMissionAlert, STORAGE_KEY]);

    const handleClick = () => {
        sessionStorage.removeItem(STORAGE_KEY);
        setCurrentMission({
            missionId: mission.missionId,
            title: mission.title,
            description: mission.description,
        });
        setActiveMissionAlert(null);
        router.push("/walk/mission");
    };

    if (timeLeft === null) return null;

    const alertWidth = Math.max(35, progress);

    return (
        <AlertWrapper>
            <AlertContainer
                onClick={handleClick}
                animate={{ width: `${alertWidth}%` }}
                transition={{ duration: 0.9, ease: "easeInOut" }}
            >
                <Content>
                    <Icon>🚨</Icon>
                    <TextWrapper>
                        <Title>돌발 미션 발생!</Title>
                        <SubTitle>{timeLeft}초 안에 터치하여 시작하세요</SubTitle>
                    </TextWrapper>
                </Content>
            </AlertContainer>
        </AlertWrapper>
    );
};

const AlertWrapper = styled.div`
    width: 100%;
    display: flex;
    justify-content: center;
    margin-bottom: ${spacing[3]}px;
`;

const AlertContainer = styled(motion.button)`
    position: relative;
    height: 48px;
    background: linear-gradient(135deg, #2f6bff, #1c4fd4);
    border-radius: ${radius.lg};
    overflow: hidden;
    border: none;
    cursor: pointer;
    box-shadow: 0 6px 16px rgba(28, 79, 212, 0.35);
    padding: 0;
    transition: transform 0.15s ease, box-shadow 0.15s ease;

    &:active {
        transform: scale(0.98);
        box-shadow: 0 4px 10px rgba(28, 79, 212, 0.25);
    }
`;

const Content = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${spacing[3]}px;
    height: 100%;
    width: 100%;
    z-index: 1;
`;

const Icon = styled.span`
    font-size: 20px;
`;

const TextWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
`;

const Title = styled.span`
    font-size: 14px;
    font-weight: 700;
    color: white;
`;

const SubTitle = styled.span`
    font-size: 11px;
    color: rgba(255, 255, 255, 0.85);
`;
