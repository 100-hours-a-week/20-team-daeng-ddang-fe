import styled from "@emotion/styled";
import { colors } from "@/shared/styles/tokens";

interface DefaultDogImageProps {
    size?: number;
}

export const DefaultDogImage = ({ size = 40 }: DefaultDogImageProps) => {
    return (
        <Container size={size}>
            <svg
                width={size * 0.6}
                height={size * 0.6}
                viewBox="0 0 24 24"
                fill="none"
                stroke={colors.gray[300]}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <circle cx="11" cy="4" r="2" />
                <circle cx="18" cy="8" r="2" />
                <circle cx="20" cy="16" r="2" />
                <path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z" />
            </svg>
        </Container>
    );
};

const Container = styled.div<{ size: number }>`
    width: ${({ size }) => size}px;
    height: ${({ size }) => size}px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: ${colors.gray[50]};
    border-radius: 50%;
    border: 1px solid ${colors.gray[100]};
    flex-shrink: 0;
`;
