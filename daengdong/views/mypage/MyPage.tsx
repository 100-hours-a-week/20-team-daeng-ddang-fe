"use client";

import styled from '@emotion/styled';
import { useRouter } from 'next/navigation';
import { Header } from '@/widgets/Header';
import { UserProfileSection } from '@/features/mypage/ui/UserProfileSection';
import { MyPageMenuList } from '@/features/mypage/ui/MyPageMenuList';
import { useToastStore } from '@/shared/stores/useToastStore';
import { useModalStore } from '@/shared/stores/useModalStore';
import { MyPageSummary } from '@/entities/mypage/model/types';
import { spacing } from '@/shared/styles/tokens';
import { useAuthStore } from '@/entities/session/model/store';
import { useWalkStore } from '@/entities/walk/model/walkStore';
import { useEndWalk } from '@/features/walk/model/useWalkMutations';
import { isAbnormalSpeed } from '@/entities/walk/lib/validator';
import { clearLegacyAccessToken } from '@/shared/lib/auth/legacyToken';

interface MyPageProps {
    initialSummaryData: MyPageSummary;
}

export const MyPage = ({ initialSummaryData }: MyPageProps) => {
    const router = useRouter();
    const { showToast } = useToastStore();
    const { openModal } = useModalStore();
    const { mutateAsync: endWalkMutateAsync } = useEndWalk();

    const handleLogout = async () => {
        const clearSession = async () => {
            const useBffAuth = process.env.NEXT_PUBLIC_USE_BFF_AUTH === 'true';
            if (useBffAuth) {
            await fetch('/bff/auth/logout', {
                method: 'POST',
                credentials: 'include',
            }).catch(() => undefined);
            } else {
                clearLegacyAccessToken();
            }
            useAuthStore.getState().setLoggedIn(false);
        };

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
                    await clearSession();

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
            onConfirm: async () => {
                await clearSession();

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
                    dogName={initialSummaryData.dogName}
                    profileImageUrl={initialSummaryData.profileImageUrl ?? undefined}
                    totalWalkCount={initialSummaryData.totalWalkCount}
                    totalWalkDistance={initialSummaryData.totalWalkDistanceKm}
                />

                <MenuSection>
                    <MyPageMenuList items={menuItems} />
                </MenuSection>
            </ContentWrapper>
        </PageContainer>
    );
}

const PageContainer = styled.div`
  min-height: 100svh;
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

export default MyPage;
