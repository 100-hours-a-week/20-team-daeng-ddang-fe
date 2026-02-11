"use client";

import styled from "@emotion/styled";
import Image from "next/image";
import ConstructionImage from "@/shared/assets/images/construction.png";
import { colors } from "@/shared/styles/tokens";

interface UnderConstructionProps {
    title?: string;
    message?: string;
}

export const UnderConstruction = ({ title, message }: UnderConstructionProps) => {
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
                {title ? title : (
                    <>
                        앗! 지금은<br />
                        <Highlight>서비스 준비 중</Highlight>이에요
                    </>
                )}
            </Message>
            <SubMessage>
                {message ? message : (
                    <>
                        더 좋은 서비스를 위해 열심히 준비하고 있어요.<br />
                        조금만 기다려주세요! 🚧
                    </>
                )}
            </SubMessage>
        </Container>
    );
};

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
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

const Highlight = styled.span`
    color: ${colors.primary[500]};
`;

const SubMessage = styled.p`
    font-size: 16px;
    color: ${colors.gray[700]};
    text-align: center;
    line-height: 1.5;
`;
