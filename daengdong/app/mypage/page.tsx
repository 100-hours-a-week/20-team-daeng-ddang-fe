"use client";

import styled from '@emotion/styled';
import { useRouter } from 'next/navigation';
import { Header } from '@/widgets/Header/Header';
import { UserProfileSection } from '@/features/mypage/ui/UserProfileSection';
import { MyPageMenuList } from '@/features/mypage/ui/MyPageMenuList';
import { useToastStore } from '@/shared/stores/useToastStore';
import { useModalStore } from '@/shared/stores/useModalStore';
import { useMyPageSummaryQuery } from '@/features/mypage/api/useMyPageSummaryQuery';
import { spacing } from '@/shared/styles/tokens';
import { motion } from 'framer-motion';
import Image from 'next/image';
import PawPrintIcon from '@/shared/assets/icons/paw-print.svg';
import { useAuthStore } from '@/entities/session/model/store';

export default function MyPage() {
  const router = useRouter();
  const { showToast } = useToastStore();
  const { openModal } = useModalStore();
  const { data: summaryData, isLoading } = useMyPageSummaryQuery();

  const handleLogout = () => {
    openModal({
      title: "로그아웃 하시겠어요?",
      type: "confirm",
      confirmText: "확인",
      cancelText: "취소",
      onConfirm: () => {
        localStorage.removeItem('accessToken');
        document.cookie = 'isLoggedIn=; path=/; max-age=0'; // Clear middleware cookie
        useAuthStore.getState().setLoggedIn(false);

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

  if (isLoading) {
    return (
      <LoadingOverlay>
        <LoadingContainer>
          <PawContainer>
            {[0, 1, 2].map((index) => (
              <PawWrapper
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 1] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: index * 0.2,
                  ease: "easeInOut",
                  times: [0, 0.2, 0.8]
                }}
              >
                <Image
                  src={PawPrintIcon}
                  alt="Loading"
                  width={32}
                  height={32}
                  style={{ width: "100%", height: "100%" }}
                />
              </PawWrapper>
            ))}
          </PawContainer>
        </LoadingContainer>
      </LoadingOverlay>
    );
  }

  return (
    <PageContainer>
      <Header title="마이페이지" showBackButton={false} />

      <ContentWrapper>
        <UserProfileSection
          dogName={summaryData?.dogName || ""}
          profileImageUrl={undefined}
          totalWalkCount={summaryData?.totalWalkCount || 0}
          totalWalkDistance={summaryData?.totalWalkDistanceKm || 0}
        />

        <MenuSection>
          <MyPageMenuList items={menuItems} />
        </MenuSection>
      </ContentWrapper>
    </PageContainer>
  );
}

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const PawContainer = styled.div`
  display: flex;
  gap: 12px;
  height: 40px;
  align-items: center;
`;

const PawWrapper = styled(motion.div)`
  width: 32px;
  height: 32px;
  
  &:nth-of-type(odd) {
    transform: rotate(-10deg);
  }
  &:nth-of-type(even) {
    transform: rotate(10deg);
  }
`;

const PageContainer = styled.div`
  min-height: 100vh;
  background-color: white;
  padding-bottom: 80px;
`;

const ContentWrapper = styled.main`
  display: flex;
  flex-direction: column;
`;

const MenuSection = styled.div`
  margin-top: ${spacing[2]}px;
`;
