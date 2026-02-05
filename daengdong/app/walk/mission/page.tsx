"use client";

import styled from "@emotion/styled";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/widgets/Header/Header";
import { MissionHeader } from "@/features/mission/ui/MissionHeader";
import { MissionCamera } from "@/features/mission/ui/MissionCamera";
import { useMissionStore } from "@/entities/mission/model/missionStore";
import { useWalkStore } from "@/entities/walk/model/walkStore";
import { spacing } from "@/shared/styles/tokens";
import { useUploadMissionVideo } from "@/features/mission/model/useMissionMutations";
import { useConfirmPageLeave } from "@/shared/hooks/useConfirmPageLeave";

export default function WalkMissionPage() {
    return (
        <Suspense fallback={null}>
            <WalkMissionContent />
        </Suspense>
    );
}

const WalkMissionContent = () => {
    const router = useRouter();
    const { currentMission, clearCurrentMission, addCompletedMissionId, setCurrentMission } = useMissionStore();
    const { walkId } = useWalkStore();
    const searchParams = useSearchParams();
    const [isIdle, setIsIdle] = useState(true);

    const { mutateAsync: uploadMission } = useUploadMissionVideo();

    // 페이지 이탈 방지
    useConfirmPageLeave(
        true,
        "페이지를 새로고침하면 촬영이 취소됩니다."
    );

    useEffect(() => {


        if (!currentMission) {
            router.replace("/walk");
        }
    }, [currentMission, router, searchParams, setCurrentMission]);

    if (!currentMission) {
        return null;
    }

    const handleCancel = () => {
        clearCurrentMission();
        router.replace("/walk");
    };

    const handleMissionComplete = async (videoBlob: Blob) => {
        if (!walkId) {
            throw new Error("산책 정보 없음");
        }

        await uploadMission({
            walkId,
            missionId: currentMission.missionId,
            file: videoBlob,
        });

        addCompletedMissionId(currentMission.missionId);
    };

    return (
        <PageContainer>
            <Header
                title="돌발 미션"
                showBackButton={isIdle}
                onBack={handleCancel}
            />

            <ContentWrapper>
                <MissionHeader
                    title={currentMission.title}
                    description={currentMission.description}
                />

                <MissionCamera
                    onComplete={handleMissionComplete}
                    onIdleChange={setIsIdle}
                />

                <GuideTextWrapper>
                    <GuideText>
                        * 돌발 미션 결과는 산책 종료 후 분석되어 한 번에 확인할 수 있어요.
                    </GuideText>
                    <GuideText>
                        * 촬영하기 버튼을 누르면 3초 카운트 다운 후에 자동으로 5초간 촬영됩니다.
                    </GuideText>
                </GuideTextWrapper>
            </ContentWrapper>

        </PageContainer>
    );
};

const PageContainer = styled.div`
    min-height: 100vh;
    background: white;
    display: flex;
    flex-direction: column;
`;

const ContentWrapper = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 0 ${spacing[4]}px ${spacing[6]}px;
`;

const GuideTextWrapper = styled.div`
    margin-top: ${spacing[4]}px;
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const GuideText = styled.p`
    font-size: 13px;
    color: #888;
    line-height: 1.5;
    text-align: center;
`;
