import { useMutation } from "@tanstack/react-query";
import { startWalkApi, endWalkApi, postWalkDiary } from "@/entities/walk/api/walk";
import { StartWalkRequest, EndWalkRequest, WriteWalkDiaryRequest } from "@/entities/walk/model/types";
import { useToastStore } from "@/shared/stores/useToastStore";
import { useWalkStore } from "@/entities/walk/model/walkStore";
import { fileApi } from "@/shared/api/file";

export const useStartWalk = () => {
    return useMutation({
        mutationFn: (req: StartWalkRequest) => startWalkApi(req),
        onError: (error) => {
            console.error("산책 시작 실패", error);
            const { showToast } = useToastStore.getState();
            showToast({
                message: '산책 시작에 실패했습니다. 다시 시도해주세요.',
                type: 'error',
                duration: 3000,
            });
        },
    });
};

export const useEndWalk = () => {
    return useMutation({
        mutationFn: (req: EndWalkRequest) => endWalkApi(req),
        onSuccess: async (response) => {
            const { walkId } = response;
            const { setWalkResult, path, myBlocks, othersBlocks } = useWalkStore.getState();
            const blockCount = myBlocks.length;

            try {
                const snapshotRes = await fetch(`/api/snapshot?walkId=${walkId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        data: {
                            path: path,
                            myBlocks: myBlocks,
                            othersBlocks: othersBlocks,
                        }
                    })
                });

                if (snapshotRes.ok) {
                    const blob = await snapshotRes.blob();
                    const { presignedUrl, objectKey } = await fileApi.getPresignedUrl(
                        "IMAGE",
                        "image/png",
                        "WALK"
                    );
                    await fileApi.uploadFile(presignedUrl, blob, "image/png");
                    const imageUrl = `https://daeng-dong-map.s3.ap-northeast-2.amazonaws.com/${objectKey}`;

                    setWalkResult({
                        time: response.durationSeconds,
                        distance: response.totalDistanceKm,
                        imageUrl,
                        blockCount,
                    });
                } else {
                    console.error("지도 스냅샷 실패");
                    setWalkResult({
                        time: response.durationSeconds,
                        distance: response.totalDistanceKm,
                        imageUrl: undefined,
                        blockCount,
                    });
                }

            } catch (e) {
                console.error("지도 스냅샷 생성 실패", e);
                setWalkResult({
                    time: response.durationSeconds,
                    distance: response.totalDistanceKm,
                    imageUrl: undefined,
                    blockCount,
                });
            }
        },
        onError: (error) => {
            console.error("산책 종료 실패", error);
            const { showToast } = useToastStore.getState();
            showToast({
                message: '산책 종료에 실패했습니다. 다시 시도해주세요.',
                type: 'error',
                duration: 3000,
            });
        },
    });
};

export const useWriteWalkDiary = () => {
    return useMutation({
        mutationFn: (req: WriteWalkDiaryRequest) => postWalkDiary(req),
        onError: (error) => {
            console.error("산책 일지 작성 실패", error);
            const { showToast } = useToastStore.getState();
            showToast({
                message: '산책 일지 작성에 실패했습니다. 다시 시도해주세요.',
                type: 'error',
                duration: 3000,
            });
        },
    });
};
