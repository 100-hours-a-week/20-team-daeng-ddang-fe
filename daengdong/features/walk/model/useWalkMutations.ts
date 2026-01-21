import { useMutation } from "@tanstack/react-query";
import { startWalkApi, endWalkApi, postWalkDiary } from "@/entities/walk/api/walk";
import { StartWalkRequest, EndWalkRequest, WriteWalkDiaryRequest } from "@/entities/walk/model/types";
import { useToastStore } from "@/shared/store/useToastStore";

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
