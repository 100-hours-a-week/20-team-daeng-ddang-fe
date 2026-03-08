import { useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToastStore } from '@/shared/stores/useToastStore';
import { useModalStore } from '@/shared/stores/useModalStore';
import { useWalkStore } from '@/entities/walk/model/walkStore';
import { useLoadingStore } from '@/shared/stores/useLoadingStore';
import fileApi from '@/shared/api/file';
import { expressionApi } from '@/entities/expression/api/expression';
import { connectWalkAnalysisSSE } from '@/shared/lib/sse/analysisSSE';

export const useExpressionAnalysis = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const walkIdFromStore = useWalkStore((s) => s.walkId);
    const { showToast } = useToastStore();
    const { openModal } = useModalStore();
    const { showLoading, hideLoading } = useLoadingStore();

    const [isIdle, setIsIdle] = useState(true);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const isSubmittingRef = useRef(false);

    const param = searchParams?.get("walkId");
    const walkId =
        param && !Number.isNaN(Number(param))
            ? Number(param)
            : walkIdFromStore ?? undefined;

    const handleCancel = () => {
        router.replace(walkId ? `/walk/complete/${walkId}` : "/walk");
    };

    const handleAnalyze = async (videoBlob: Blob) => {
        if (!walkId) {
            showToast({ message: "산책 정보가 없습니다.", type: "error" });
            return;
        }

        if (isSubmittingRef.current) return;
        isSubmittingRef.current = true;

        setIsAnalyzing(true);
        showLoading("영상을 업로드하는 중입니다...");

        try {
            const mimeType = videoBlob.type || "video/mp4";

            const { presignedUrl } = await fileApi.getPresignedUrl(
                "VIDEO",
                mimeType,
                "EXPRESSION"
            );
            await fileApi.uploadFile(presignedUrl, videoBlob, mimeType);
            const videoUrl = new URL(presignedUrl).origin + new URL(presignedUrl).pathname;

            showLoading("표정 분석 요청 중입니다...");
            const job = await expressionApi.createExpressionJob(walkId, { videoUrl });

            showLoading("표정 분석 중입니다...");
            await new Promise<void>((resolve, reject) => {
                connectWalkAnalysisSSE(
                    walkId,
                    job.taskId,
                    () => resolve(),
                    (err) => reject(err)
                );
            });

            router.replace(`/walk/expression/result?walkId=${walkId}&taskId=${job.taskId}`);


        } catch (e: unknown) {
            const err = e as { response?: { data?: { errorCode?: string } } };
            const errorCode = err?.response?.data?.errorCode;

            const promptRetry = (message: string) => {
                openModal({
                    title: "표정 분석 실패",
                    message: message + "\n재촬영할까요?",
                    type: "confirm",
                    confirmText: "다시 시도",
                    cancelText: "돌아가기",
                    onConfirm: () => {
                    },
                    onCancel: () => {
                        handleCancel();
                    }
                });
            };

            switch (errorCode) {
                case "UNAUTHORIZED":
                    showToast({ message: "로그인이 필요합니다.", type: "error" });
                    router.replace("/login");
                    break;
                case "FORBIDDEN":
                    showToast({ message: "접근 권한이 없습니다.", type: "error" });
                    handleCancel();
                    break;
                case "WALK_RECORD_NOT_FOUND":
                    showToast({ message: "산책 정보를 찾을 수 없습니다.", type: "error" });
                    router.replace("/walk");
                    break;
                case "DOG_FACE_NOT_RECOGNIZED":
                    promptRetry("강아지 얼굴을 인식할 수 없습니다.");
                    break;
                case "AI_SERVER_CONNECTION_FAILED":
                    promptRetry("AI 서버에 연결할 수 없습니다.");
                    break;
                default:
                    promptRetry("분석에 실패했어요.");
                    break;
            }
            throw e;
        } finally {
            isSubmittingRef.current = false;
            setIsAnalyzing(false);
            hideLoading();
        }
    };

    return {
        isIdle,
        setIsIdle,
        isAnalyzing,
        setIsAnalyzing,
        handleAnalyze,
        handleCancel,
        walkId,
    };
};