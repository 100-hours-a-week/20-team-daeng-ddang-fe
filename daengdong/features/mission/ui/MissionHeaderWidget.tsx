import styled from "@emotion/styled";
import { colors, spacing } from "@/shared/styles/tokens";
import { useRouter } from "next/navigation";
import { useMissionStore } from "@/entities/mission/model/missionStore";

// Back Icon (Simple SVG)
const BackIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 19L8 12L15 5" stroke="#212121" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

interface MissionHeaderWidgetProps {
    title: string;
    description: string;
    isBackEnabled: boolean;
}

export const MissionHeaderWidget = ({ title, description, isBackEnabled }: MissionHeaderWidgetProps) => {
    const router = useRouter();
    const { clearCurrentMission } = useMissionStore();

    const handleBack = () => {
        if (!isBackEnabled) return;
        clearCurrentMission();
        router.replace("/walk");
    };

    return (
        <Container>
            <TopRow>
                <BackButton onClick={handleBack} disabled={!isBackEnabled}>
                    <BackIcon />
                </BackButton>
                <Title>{title}</Title>
                <Placeholder /> {/* For centering if needed, using flux layout */}
            </TopRow>
            <Description>{description}</Description>
        </Container>
    );
};

const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${spacing[3]}px;
    padding: ${spacing[4]}px ${spacing[4]}px 0;
`;

const TopRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 48px;
`;

const BackButton = styled.button`
    background: none;
    border: none;
    padding: 8px;
    margin-left: -8px; 
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: ${props => props.disabled ? 0 : 1};
    pointer-events: ${props => props.disabled ? 'none' : 'auto'};
    transition: opacity 0.2s;
`;

const Title = styled.h2`
    font-size: 18px;
    font-weight: 700;
    color: ${colors.gray[900]};
    margin: 0;
    flex: 1;
    text-align: center;
    transform: translateX(-16px); // Adjusting specifically for centering with just Left Icon
`;

const Placeholder = styled.div`
    width: 40px; 
`;

const Description = styled.p`
    font-size: 15px;
    color: ${colors.gray[700]};
    margin: 0;
    line-height: 1.5;
    text-align: center;
    white-space: pre-wrap;
`;
