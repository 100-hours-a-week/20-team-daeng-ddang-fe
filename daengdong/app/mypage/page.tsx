"use client";

import styled from '@emotion/styled';
import { useRouter } from 'next/navigation';
import { Header } from '@/widgets/Header';
import { UserProfileSection } from '@/app/mypage/ui/UserProfileSection';
import { MyPageMenuList } from '@/app/mypage/ui/MyPageMenuList';
import { useToastStore } from '@/shared/stores/useToastStore';
import { useModalStore } from '@/shared/stores/useModalStore';
import { useMyPageSummaryQuery } from '@/features/mypage/api/useMyPageSummaryQuery';
import { spacing } from '@/shared/styles/tokens';
import { motion } from 'framer-motion';
import Image from 'next/image';
import PawPrintIcon from '@/shared/assets/icons/paw-print.svg';
import { useAuthStore } from '@/entities/session/model/store';
import { useWalkStore } from '@/entities/walk/model/walkStore';
import { useEndWalk } from '@/features/walk/model/useWalkMutations';
import { isAbnormalSpeed } from '@/entities/walk/lib/validator';

export default function MyPage() {
  const router = useRouter();
  const { showToast } = useToastStore();
  const { openModal } = useModalStore();
  const { data: summaryData, isLoading } = useMyPageSummaryQuery();
  const { mutateAsync: endWalkMutateAsync } = useEndWalk();

  const handleLogout = async () => {
    const { walkMode, walkId, currentPos, elapsedTime, distance } = useWalkStore.getState();

    // 산책 중인지 확인
    if (walkMode === 'walking' && walkId) {
      openModal({
        title: "산책 중입니다",
        message: "로그아웃하면 현재 산책이 취소됩니다. 계속하시겠습니까?",
        type: "confirm",
        confirmText: "로그아웃",
        cancelText: "취소",
        onConfirm: async () => {
          // 산책 취소 처리 (handleCancel과 동일한 로직)
          const isAbnormal = isAbnormalSpeed(distance, elapsedTime);
          if (isAbnormal) {
            showToast({
              message: "비정상적인 이동 속도가 감지되어 이동 거리 및 점유 블록이 저장되지 않습니다.",
              type: "error"
            });
          }

          const finalDistance = isAbnormal ? 0 : Number(distance.toFixed(4));

          if (walkId && currentPos) {
            try {
              // 산책 종료 API 호출
              await endWalkMutateAsync(
                {
                  walkId: walkId,
                  endLat: currentPos.lat,
                  endLng: currentPos.lng,
                  totalDistanceKm: finalDistance,
                  durationSeconds: elapsedTime,
                  status: "FINISHED",
                  isValidated: isAbnormal,
                }
              );

              // 성공 시 상태 리셋
              useWalkStore.getState().reset();
            } catch (error) {
              console.error('Failed to end walk on logout:', error);
              showToast({
                message: "산책 취소 처리에 실패했습니다.",
                type: "error"
              });
              // 실패해도 로컬 상태 리셋
              useWalkStore.getState().reset();
            }
          } else {
            // walkId가 없으면 로컬 리셋만 수행
            useWalkStore.getState().reset();
          }

          // 로그아웃 처리
          localStorage.removeItem('accessToken');
          document.cookie = 'isLoggedIn=; path=/; max-age=0';
          useAuthStore.getState().setLoggedIn(false);

          showToast({
            message: "로그아웃되었습니다!",
            type: "success",
          });
          router.replace('/login');
        },
      });
      return;
    }

    // 일반 로그아웃
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
          profileImageUrl={summaryData?.profileImageUrl ?? undefined}
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
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
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
