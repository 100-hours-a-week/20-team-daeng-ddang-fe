import { useKakaoLogin } from '@/features/auth/model/useKakaoLogin';
import { GlobalLoading } from '@/widgets/GlobalLoading';

export const KakaoCallbackHandler = () => {
    useKakaoLogin();

    return <GlobalLoading />;
};
