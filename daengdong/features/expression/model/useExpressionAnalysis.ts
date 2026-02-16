import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useExpressionStore } from '@/entities/expression/model/expressionStore';
import { useToastStore } from '@/shared/stores/useToastStore';
import { useWalkStore } from '@/entities/walk/model/walkStore';
import { useLoadingStore } from '@/shared/stores/useLoadingStore';
import fileApi from '@/shared/api/file';
import { expressionApi } from '@/entities/expression/api/expression';

export const useExpressionAnalysis = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const walkIdFromStore = useWalkStore((s) => s.walkId);
    const { setAnalysis } = useExpressionStore();
    const { showToast } = useToastStore();
    const { showLoading, hideLoading } = useLoadingStore();

    const [isIdle, setIsIdle] = useState(true);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

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

        setIsAnalyzing(true);
        showLoading("표정 분석 중입니다...");

        try {
            const mimeType = videoBlob.type || "video/mp4";

            const { presignedUrl } = await fileApi.getPresignedUrl(
                "VIDEO",
                mimeType,
                "EXPRESSION"
            );

            await fileApi.uploadFile(presignedUrl, videoBlob, mimeType);

            const videoUrl = presignedUrl.split("?")[0];

            const analysis = await expressionApi.analyzeExpression(walkId, {
                videoUrl,
            });

            setAnalysis(analysis);
            router.replace("/walk/expression/result");

        } catch (e) {
            console.error(e);
            showToast({ message: "표정 분석에 실패했습니다.", type: "error" });
        } finally {
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