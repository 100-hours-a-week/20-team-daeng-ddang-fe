import { Header } from '@/widgets/Header';
import { useUserInfoQuery } from '@/features/user/api/useUserInfoQuery';
import { useUserLogic } from '@/features/user/model/useUserInfo';
import { UserForm } from './ui/UserForm';
import { GlobalLoading } from '@/widgets/GlobalLoading';
import styled from '@emotion/styled';
import { spacing } from '@/shared/styles/tokens';
import { useRouter } from 'next/navigation';

export function UserInfoScreen() {
    const router = useRouter();

    const { data: userInfo, isLoading: isQueryLoading } = useUserInfoQuery();

    const regionParts = userInfo?.region ? userInfo.region.split(' ') : [];
    const province = regionParts[0] || '';
    const city = regionParts[1] || '';

    const isNewUser = !userInfo?.userId;

    const { updateUser, withdrawUser, isSubmitting } = useUserLogic();

    if (isQueryLoading) {
        return <GlobalLoading />;
    }

    // 이메일 표시 우선순위: 1. API 응답 2. User 쿼리 응답 3. 로컬 스토리지 (가입 미완료 시)
    const savedEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;
    const displayEmail = (userInfo?.kakaoEmail || savedEmail) ?? undefined;

    return (
        <Container>
            <Header title="사용자 정보" showBackButton={true} onBack={() => router.back()} />

            <Content>
                <UserForm
                    initialData={{
                        province: province,
                        city: city
                    }}
                    initialParentRegionId={userInfo?.parentRegionId}
                    initialRegionId={userInfo?.regionId}
                    onSubmit={(data) => updateUser(data, userInfo)}
                    onWithdraw={withdrawUser}
                    isSubmitting={isSubmitting}
                    isNewUser={isNewUser}
                    kakaoEmail={displayEmail}
                />
            </Content>

        </Container>
    );
}

const Container = styled.div`
  min-height: 100vh;
  background-color: white;
  display: flex;
  flex-direction: column;
`;

const Content = styled.div`
  padding: ${spacing[5]}px; /* 20px */
  flex: 1;
`;
