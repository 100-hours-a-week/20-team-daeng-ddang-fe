"use client";

import { Container, ContentWrapper, BrandText, LogoImage, ButtonWrapper, HeaderWrapper, BrandTitle } from './styles';
import { KakaoButton } from '@/shared/components/KakaoButton';
import { Header } from '@/widgets/Header/Header';

export default function LoginPage() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleKakaoLogin = () => {
    // Explicitly check for variable to avoid undefined behavior
    if (!API_BASE_URL) {
      console.error('API_BASE_URL is not defined');
      // No alert here, just fail silently or log, as requested to remove alerts.
      // Ideally show toast if we had access to store here without hooking into it just for this check,
      // but usually this is a dev error.
      return;
    }

    // Redirect to backend auth endpoint
    window.location.href = `${API_BASE_URL}/auth/kakao`;
  };

  return (
    <Container>
      <HeaderWrapper>
        <Header
          title="로그인"
          showBackButton={true}
        />
      </HeaderWrapper>

      <ContentWrapper>

        <LogoImage src="/댕동여지도 마스코트.png" alt="Daengdong Map Logo" />
        <BrandTitle>댕동여지도</BrandTitle>
        <BrandText>간편하게 로그인하고<br /> 바로 산책 시작!</BrandText>
      </ContentWrapper>

      <ButtonWrapper>
        <KakaoButton onClick={handleKakaoLogin}>
          카카오로 로그인
        </KakaoButton>
      </ButtonWrapper>
    </Container>
  );
}
