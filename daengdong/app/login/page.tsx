"use client";

import { Container, ContentWrapper, BrandText, LogoImage, ButtonWrapper, HeaderWrapper, BrandTitle } from './styles';
import { KakaoButton } from '@/shared/components/KakaoButton';
import { Header } from '@/widgets/Header/Header';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleKakaoLogin = () => {
    // If no API URL is set, we use a mock flow for testing UI
    if (!API_BASE_URL) {
      console.warn('API_BASE_URL is not defined. Using mock login flow.');
      // Simulate redirection back from Kakao with a mock code
      router.push('/oauth/kakao/callback?code=mock_auth_code_12345');
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
          showBackButton={false}
        />
      </HeaderWrapper>

      <ContentWrapper>
        <BrandTitle>댕동여지도</BrandTitle>
        <BrandText>댕동여지도와 함께하는 산책</BrandText>
        <LogoImage src="/댕동여지도 마스코트.png" alt="Daengdong Map Logo" />
      </ContentWrapper>

      <ButtonWrapper>
        <KakaoButton onClick={handleKakaoLogin}>
          카카오로 로그인
        </KakaoButton>
      </ButtonWrapper>
    </Container>
  );
}
