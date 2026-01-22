"use client";

import styled from '@emotion/styled';
import { useRouter } from 'next/navigation';
import { Header } from '@/widgets/Header/Header';
import { UserProfileSection } from '@/features/mypage/ui/UserProfileSection';
import { MyPageMenuList } from '@/features/mypage/ui/MyPageMenuList';
import { useToastStore } from '@/shared/stores/useToastStore';
import { useModalStore } from '@/shared/stores/useModalStore';
import { spacing } from '@/shared/styles/tokens';

export default function MyPage() {
  const router = useRouter();
  const { showToast } = useToastStore();
  const { openModal } = useModalStore();

  // Mock Data
  const mockUser = {
    dogName: "초코",
    profileImageUrl: undefined,
    totalWalkCount: 24,
    totalWalkDistance: 12.3,
  };

  const handleLogout = () => {
    openModal({
      title: "로그아웃 하시겠어요?",
      type: "confirm",
      confirmText: "확인",
      cancelText: "취소",
      onConfirm: () => {
        showToast({
          message: "로그아웃되었습니다!",
          type: "success",
        });
        router.replace('/login');
      },
    });
  };

  const menuItems = [
    {
      id: "user-info",
      label: "사용자 정보",
      onClick: () => router.push('/mypage/user'),
    },
    {
      id: "pet-info",
      label: "반려견 정보",
      onClick: () => router.push('/mypage/dog'),
    },
    {
      id: "logout",
      label: "로그아웃",
      isDestructive: true,
      onClick: handleLogout,
    },
  ];

  return (
    <PageContainer>
      <Header title="마이페이지" showBackButton={false} />

      <ContentWrapper>
        <UserProfileSection
          dogName={mockUser.dogName}
          profileImageUrl={mockUser.profileImageUrl}
          totalWalkCount={mockUser.totalWalkCount}
          totalWalkDistance={mockUser.totalWalkDistance}
        />

        <MenuSection>
          <MyPageMenuList items={menuItems} />
        </MenuSection>
      </ContentWrapper>


    </PageContainer>
  );
}

const PageContainer = styled.div`
  min-height: 100vh;
  background-color: white;
  padding-bottom: 80px; /* Space for BottomNav */
`;

const ContentWrapper = styled.main`
  display: flex;
  flex-direction: column;
`;

const MenuSection = styled.div`
  margin-top: ${spacing[2]}px;
`;
