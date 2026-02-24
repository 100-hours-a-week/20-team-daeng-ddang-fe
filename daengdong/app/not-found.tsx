"use client";

import styled from "@emotion/styled";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { colors, radius, spacing } from "@/shared/styles/tokens";
import ConstructionImage from "@/shared/assets/images/construction.png";

export default function ForbiddenPage() {
    const router = useRouter();

    return (
        <Container>
            <ImageWrapper>
                <Image
                    src={ConstructionImage}
                    alt="공사중"
                    width={200}
                    height={200}
                    style={{ objectFit: "contain" }}
                />
            </ImageWrapper>
            <Message>
                페이지를 찾을 수 없습니다.
            </Message>
            <SubMessage>
                잘못된 접근이거나, 페이지가 삭제되었어요.
            </SubMessage>

            <ButtonGroup>
                <PrimaryButton onClick={() => router.push('/')}>
                    홈으로 가기
                </PrimaryButton>
                <SecondaryButton onClick={() => router.back()}>
                    이전 페이지로
                </SecondaryButton>
            </ButtonGroup>
        </Container>
    );
}

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100svh;
    padding: 20px;
    background-color: #fff;
    padding-bottom: 80px; /* BottomNav space */
`;


const ImageWrapper = styled.div`
    margin-bottom: 32px;
`;

const Message = styled.h2`
    font-size: 24px;
    font-weight: 700;
    color: ${colors.gray[900]};
    text-align: center;
    line-height: 1.4;
    margin-bottom: 12px;
`;

const SubMessage = styled.p`
    font-size: 16px;
    color: ${colors.gray[700]};
    text-align: center;
    line-height: 1.5;
`;


const ButtonGroup = styled.div`
    margin-top: 24px;
    display: flex;
    flex-direction: column;
    gap: ${spacing[2]}px;
    width: 100%;
`;

const PrimaryButton = styled.button`
    width: 100%;
    padding: 14px;
    border-radius: ${radius.md};
    background-color: ${colors.primary[500]};
    color: white;
    font-weight: 700;
    font-size: 15px;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s;

    &:active {
        background-color: ${colors.primary[600]};
    }
`;

const SecondaryButton = styled.button`
    width: 100%;
    padding: 14px;
    border-radius: ${radius.md};
    background-color: white;
    color: ${colors.gray[700]};
    font-weight: 600;
    font-size: 15px;
    border: 1px solid ${colors.gray[300]};
    cursor: pointer;
    transition: background-color 0.2s;

    &:active {
        background-color: ${colors.gray[50]};
    }
`;
