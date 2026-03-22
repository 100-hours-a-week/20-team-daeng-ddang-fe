import styled from '@emotion/styled';
import KakaoLoginButtonImage from '@/shared/assets/images/kakao_login_large_wide.png';

const Button = styled.button`
  background: transparent;
  width: 100%;
  padding: 0;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:active {
    filter: brightness(0.95);
  }
`;

const ButtonImage = styled.img`
  display: block;
  width: 100%;
  height: auto;
`;

interface KakaoButtonProps {
  onClick?: () => void;
}

export const KakaoButton = ({ onClick }: KakaoButtonProps) => {
  return (
    <Button onClick={onClick} aria-label="카카오 로그인">
      <ButtonImage src={KakaoLoginButtonImage.src} alt="카카오 로그인" />
    </Button>
  );
};
