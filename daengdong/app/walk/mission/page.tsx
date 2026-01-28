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

    useEffect(() => {
        const isMock = searchParams.get("mock") === "1";
        if (!currentMission && isMock) {
            setCurrentMission({
                missionId: 101,
                title: "돌발 미션",
                description: "카메라를 바라보고 3초 동안 웃어주세요!",
            });
            return;
        }

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
