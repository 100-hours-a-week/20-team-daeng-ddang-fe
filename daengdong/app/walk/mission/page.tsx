"use client";

import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MissionHeader } from "@/features/mission/ui/MissionHeader";
import { MissionCamera } from "@/features/mission/ui/MissionCamera";
import { useMissionStore } from "@/entities/mission/model/missionStore";
import { useWalkStore } from "@/entities/walk/model/walkStore";
import { useToastStore } from "@/shared/stores/useToastStore";
import { http } from "@/shared/api/http";
import { colors, radius, spacing } from "@/shared/styles/tokens";

export default function WalkMissionPage() {
    const router = useRouter();
    const { currentMission, clearCurrentMission, addCompletedMissionId, setCurrentMission } = useMissionStore();
    const { walkId } = useWalkStore();
    const { showToast } = useToastStore();
    const [isUploading, setIsUploading] = useState(false);
    const searchParams = useSearchParams();

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

    const handleUpload = async (videoBlob: Blob) => {
        if (!walkId) {
            showToast({ message: "산책 정보를 찾을 수 없습니다.", type: "error" });
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("video", videoBlob, `mission-${currentMission.missionId}.webm`);
            formData.append("missionId", String(currentMission.missionId));

            // TODO: 백엔드 walkId 소스 확정 시 조정
            await http.post(`/walks/${walkId}/missions`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            addCompletedMissionId(currentMission.missionId);
            clearCurrentMission();
            showToast({ message: "미션 참여 완료", type: "success" });
            router.replace("/walk");
        } catch (error) {
            console.error("미션 업로드 실패:", error);
            showToast({ message: "업로드 실패. 네트워크 확인 후 다시 시도", type: "error" });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <PageContainer>
            <MissionHeader
                title={currentMission.title}
                description={currentMission.description}
            />
            <MissionCamera
                missionId={currentMission.missionId}
                onComplete={handleUpload}
            />

            {isUploading && (
                <LoadingOverlay>
                    <Spinner />
                    <LoadingText>업로드 중...</LoadingText>
                </LoadingOverlay>
            )}
        </PageContainer>
    );
}

const PageContainer = styled.div`
    min-height: 100vh;
    background: white;
    display: flex;
    flex-direction: column;
    padding-bottom: ${spacing[6]}px;
`;

const LoadingOverlay = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${spacing[3]}px;
    z-index: 9999;
`;

const Spinner = styled.div`
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: 4px solid rgba(255, 255, 255, 0.4);
    border-top-color: white;
    animation: spin 0.8s linear infinite;

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
`;

const LoadingText = styled.p`
    margin: 0;
    color: white;
    font-size: 16px;
    font-weight: 600;
`;
