import { Header } from '@/widgets/Header';
import { useUserInfoQuery } from '@/features/user/api/useUserInfoQuery';
import { useUserLogic } from '@/features/user/model/useUserInfo';
import { UserForm } from '@/features/user/ui/UserForm';
import { GlobalLoading } from '@/widgets/GlobalLoading';
import styled from '@emotion/styled';
import { spacing } from '@/shared/styles/tokens';
import { useRouter } from 'next/navigation';

export function UserInfoPage() {
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
                    onSubmit={(data: { province: string; city: string; regionId: number }) => updateUser(data, userInfo)}
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
  min-height: 100svh;
  background-color: white;
  display: flex;
  flex-direction: column;
`;

const Content = styled.div`
  padding: ${spacing[5]}px; /* 20px */
  flex: 1;
`;

export default UserInfoPage;
