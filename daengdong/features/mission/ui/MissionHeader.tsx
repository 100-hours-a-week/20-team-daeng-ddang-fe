import styled from "@emotion/styled";
import { colors, spacing } from "@/shared/styles/tokens";

interface MissionHeaderProps {
    title: string;
    description: string;
}

export const MissionHeader = ({ title, description }: MissionHeaderProps) => {
    return (
        <Container>
            <Title>{title}</Title>
            <Description>{description}</Description>
        </Container>
    );
};

const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${spacing[2]}px;
    padding: ${spacing[4]}px ${spacing[4]}px 0;
`;

const Title = styled.h2`
    font-size: 20px;
    font-weight: 700;
    color: ${colors.gray[900]};
    margin: 0;
`;

const Description = styled.p`
    font-size: 14px;
    color: ${colors.gray[700]};
    margin: 0;
    line-height: 1.5;
`;
