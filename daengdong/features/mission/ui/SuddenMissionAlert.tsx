import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { Mission } from "@/entities/mission/api/mission";
import { colors, radius, spacing } from "@/shared/styles/tokens";
import { useMissionStore } from "@/entities/mission/model/missionStore";
import { useRouter } from "next/navigation";
import { useWalkStore } from "@/entities/walk/model/walkStore";

interface SuddenMissionAlertProps {
    mission: Mission;
}

export const SuddenMissionAlert = ({ mission }: SuddenMissionAlertProps) => {
    const router = useRouter();
    const { setCurrentMission } = useMissionStore();
    const { setActiveMissionAlert } = useWalkStore();
    const [timeLeft, setTimeLeft] = useState(10);
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setActiveMissionAlert(null); // Dismiss on timeout
                    return 0;
                }
                return prev - 1;
            });
            setProgress((prev) => Math.max(0, prev - 10)); // 10s -> 10% per sec
        }, 1000);

        return () => clearInterval(timer);
    }, [setActiveMissionAlert]);

    const handleClick = () => {
        // Activate Mission
        setCurrentMission({
            missionId: mission.missionId,
            title: mission.title,
            description: mission.description,
        });
        setActiveMissionAlert(null); // Clear alert
        router.push("/walk/mission");
    };

    return (
        <AlertContainer onClick={handleClick}>
            <ProgressBar style={{ width: `${progress}%` }} />
            <Content>
                <Icon>🚨</Icon>
                <TextWrapper>
                    <Title>돌발 미션 발생!</Title>
                    <SubTitle>{timeLeft}초 안에 터치하여 시작하세요</SubTitle>
                </TextWrapper>
            </Content>
        </AlertContainer>
    );
};

const AlertContainer = styled.button`
    position: relative;
    width: 100%;
    height: 60px;
    background: ${colors.gray[900]};
    border-radius: ${radius.lg};
    overflow: hidden;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    margin-bottom: ${spacing[3]}px;
    padding: 0;
`;

const ProgressBar = styled.div`
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    height: 100%;
    background: ${colors.primary[500]};
    opacity: 0.2;
    transition: width 1s linear;
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
    font-size: 24px;
`;

const TextWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
`;

const Title = styled.span`
    font-size: 16px;
    font-weight: 700;
    color: white;
`;

const SubTitle = styled.span`
    font-size: 12px;
    color: ${colors.gray[300]};
`;
