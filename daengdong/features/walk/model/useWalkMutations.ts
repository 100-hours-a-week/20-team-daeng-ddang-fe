import { useMutation } from "@tanstack/react-query";
import { startWalkApi, endWalkApi, postWalkDiary } from "@/entities/walk/api/walk";
import { StartWalkRequest, EndWalkRequest, WriteWalkDiaryRequest } from "@/entities/walk/model/types";
import { useToastStore } from "@/shared/stores/useToastStore";
import { useWalkStore } from "@/entities/walk/model/walkStore";

export const useStartWalk = () => {
    return useMutation({
        mutationFn: (req: StartWalkRequest) => startWalkApi(req),
        onError: (error) => {
            console.error("Failed to start walk", error);
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
            const { walkId } = response.data;
            const { setWalkResult, path, myBlocks, othersBlocks } = useWalkStore.getState();
            const blockCount = myBlocks.length;

            try {
                // Snapshot generation
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
                    const imageUrl = URL.createObjectURL(blob);

                    // Update store with image
                    // Note: In a real app, you might upload this blob to S3/Cloudinary and get a URL
                    // Here we use a local ObjectURL for immediate display
                    setWalkResult({
                        time: response.data.durationSeconds,
                        distance: response.data.totalDistanceKm, // using km directly from response
                        imageUrl: imageUrl,
                        blockCount,
                    });
                } else {
                    console.error("Snapshot failed");
                    // Still set result without image
                    setWalkResult({
                        time: response.data.durationSeconds,
                        distance: response.data.totalDistanceKm,
                        imageUrl: undefined,
                        blockCount,
                    });
                }

            } catch (e) {
                console.error("Snapshot error", e);
                setWalkResult({
                    time: response.data.durationSeconds,
                    distance: response.data.totalDistanceKm,
                    imageUrl: undefined,
                    blockCount,
                });
            }
        },
        onError: (error) => {
            console.error("Failed to end walk", error);
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
            console.error("Failed to write walk diary", error);
            const { showToast } = useToastStore.getState();
            showToast({
                message: '산책 일지 작성에 실패했습니다. 다시 시도해주세요.',
                type: 'error',
                duration: 3000,
            });
        },
    });
};
