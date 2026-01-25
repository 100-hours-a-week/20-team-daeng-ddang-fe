import { useRouter } from "next/navigation";
import { useWalkStore } from "@/entities/walk/model/walkStore";
import { useModalStore } from "@/shared/stores/useModalStore";
import { useLoadingStore } from "@/shared/stores/useLoadingStore";
import { useStartWalk, useEndWalk } from "@/features/walk/model/useWalkMutations";
import { fileApi } from "@/shared/api/file";
import { useUserQuery } from "@/entities/user/model/useUserQuery";

export const useWalkControl = () => {
    const {
        walkMode,
        elapsedTime,
        distance,
        currentPos,
        walkId,
        startWalk,
        endWalk,
        reset,
        path,
        myBlocks,
        othersBlocks,
        setWalkResult
    } = useWalkStore();

    const { openModal } = useModalStore();
    const { showLoading, hideLoading } = useLoadingStore();
    const { mutate: startWalkMutate } = useStartWalk();
    const { mutate: endWalkMutate } = useEndWalk();
    const router = useRouter();
    const { data: user, isError } = useUserQuery();

    const handleStart = () => {
        if (!user || isError) {
            router.push("/login");
            return;
        }

        if (!currentPos) {
            alert("위치 정보를 불러오는 중입니다. 잠시만 기다려주세요.");
            return;
        }

        startWalkMutate(
            { startLat: currentPos.lat, startLng: currentPos.lng },
            {
                onSuccess: (res) => {
                    startWalk(res.walkId);
                },
                onError: () => {
                    alert("산책 시작에 실패했습니다.");
                }
            }
        );
    };

    const handleCancel = () => {
        openModal({
            title: "산책 취소",
            message: "산책을 취소하시겠습니까? 기록은 저장되지 않습니다.",
            type: "confirm",
            confirmText: "취소하기",
            cancelText: "계속 산책하기",
            onConfirm: () => {
                reset();
            },
        });
    };

    const handleEnd = () => {
        if (!currentPos || !walkId) {
            if (!walkId) {
                endWalk();
                return;
            }
            return;
        }

        openModal({
            title: "산책 종료",
            message: "산책을 종료하시겠습니까? 기록이 저장됩니다.",
            type: "confirm",
            confirmText: "종료하기",
            cancelText: "계속 산책하기",
            onConfirm: async () => {
                showLoading("산책을 종료하고 스냅샷을 저장 중입니다...");

                try {
                    // 서버 사이드 스냅샷 생성 요청
                    const snapshotResponse = await fetch(`/api/snapshot?walkId=${walkId}`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            data: {
                                path,
                                myBlocks,
                                othersBlocks,
                            },
                        }),
                    });

                    if (!snapshotResponse.ok) {
                        throw new Error("스냅샷 생성에 실패했습니다.");
                    }

                    const blob = await snapshotResponse.blob();
                    let storedImageUrl = "";

                    if (blob) {
                        const { presignedUrl, objectKey } = await fileApi.getPresignedUrl("IMAGE", "image/png", "WALK");
                        await fileApi.uploadFile(presignedUrl, blob, "image/png");

                        storedImageUrl = objectKey;
                    }

                    endWalkMutate(
                        {
                            walkId: walkId,
                            endLat: currentPos.lat,
                            endLng: currentPos.lng,
                            totalDistanceKm: Number(distance.toFixed(4)),
                            durationSeconds: elapsedTime,
                            status: "FINISHED",
                        },
                        {
                            onSuccess: () => {
                                setWalkResult({
                                    time: elapsedTime,
                                    distance: distance,
                                    imageUrl: storedImageUrl,
                                });

                                router.push(`/walk/complete/${walkId}`);
                                endWalk();
                                hideLoading();
                            },
                            onError: () => {
                                hideLoading();
                                alert("산책 종료 저장에 실패했습니다.");
                            }
                        }
                    );
                } catch (error) {
                    console.error("Snapshot creation failed:", error);
                    hideLoading();
                    alert("스냅샷 생성 중 오류가 발생했습니다. 산책을 다시 종료해주세요.");
                }
            },
        });
    };

    return {
        walkMode,
        elapsedTime,
        distance,
        handleStart,
        handleEnd,
        handleCancel
    };
};
