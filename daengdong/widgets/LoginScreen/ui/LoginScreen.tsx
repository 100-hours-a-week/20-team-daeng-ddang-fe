"use client";

import { Container, ContentWrapper, BrandText, LogoImage, ButtonWrapper, HeaderWrapper, BrandTitle } from './styles';
import { KakaoButton } from '@/shared/components/KakaoButton';
import { Header } from '@/widgets/Header/Header';
import { DevLoginButton } from '@/features/auth/ui/DevLoginButton';
import MascotImage from "@/shared/assets/images/mascot.png";

export const LoginScreen = () => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

    const handleKakaoLogin = () => {
        if (!API_BASE_URL) {
            console.warn("API_BASE_URL 정의되지 않아 mock 로그인으로 이동");
            return;
        }

        window.location.href = `${API_BASE_URL}/auth`;
    };

    return (
        <Container>
            <HeaderWrapper>
                <Header title="로그인" showBackButton={false} />
            </HeaderWrapper>

            <ContentWrapper>
                <BrandTitle>댕동여지도</BrandTitle>
                <BrandText>댕동여지도와 함께하는 산책</BrandText>
                <LogoImage src={MascotImage.src} alt="Daengdong Map Logo" />
            </ContentWrapper>

            <ButtonWrapper>
                <DevLoginButton />
                <KakaoButton onClick={handleKakaoLogin}>
                    카카오로 로그인
                </KakaoButton>
            </ButtonWrapper>
        </Container>
    );
};
