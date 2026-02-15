"use client";

import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/widgets/Header";
import { MissionHeader } from "@/features/mission/ui/MissionHeader";
import { MissionCamera } from "@/features/mission/ui/MissionCamera";
import { useMissionStore } from "@/entities/mission/model/missionStore";
import { useWalkStore } from "@/entities/walk/model/walkStore";
import { spacing } from "@/shared/styles/tokens";
import { useUploadMissionVideo } from "@/features/mission/model/useMissionMutations";
import { useConfirmPageLeave } from "@/shared/hooks/useConfirmPageLeave";
import { useToastStore } from "@/shared/stores/useToastStore";


const MissionPage = () => {
    const router = useRouter();
    const { currentMission, clearCurrentMission, addCompletedMissionId } = useMissionStore();
    const { walkId } = useWalkStore();
    const { showToast } = useToastStore();

    const [isIdle, setIsIdle] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    const { mutateAsync: uploadMission } = useUploadMissionVideo();

    useConfirmPageLeave(
        !isIdle || isUploading,
        "페이지를 새로고침하면 촬영이 취소됩니다."
    );

    useEffect(() => {
        if (!currentMission) {
            router.replace("/walk");
        }
    }, [currentMission, router]);

    if (!currentMission) return null;

    const handleCancel = () => {
        if (isUploading) return;

        clearCurrentMission();
        router.replace("/walk");
    };

    const handleMissionComplete = async (videoBlob: Blob) => {
        if (isUploading) return;

        if (!walkId) {
            showToast({ message: "산책 정보 없음", type: "error" });
            router.replace("/walk");
            return;
        }

        try {
            setIsUploading(true);

            await uploadMission({
                walkId,
                missionId: currentMission.missionId,
                file: videoBlob,
            });

            addCompletedMissionId(currentMission.missionId);
            router.replace("/walk");

        } catch {
            showToast({ message: "업로드 실패", type: "error" });
        } finally {
            setIsUploading(false);
        }
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

export default MissionPage;
