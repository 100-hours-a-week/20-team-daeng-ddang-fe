import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { expressionApi } from "@/entities/expression/api/expression";
import { ExpressionAnalysis, PredictEmotion } from "@/entities/expression/model/types";

export const useExpressionResult = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const walkIdParam = searchParams?.get("walkId");
    const walkId = walkIdParam ? parseInt(walkIdParam, 10) : null;

    const { data: fetchedData, isLoading, isError } = useQuery({
        queryKey: ['expressionResult', walkId],
        queryFn: () => walkId ? expressionApi.getExpressionResult(walkId) : null,
        enabled: !!walkId,
    });

    const analysis = useMemo<ExpressionAnalysis | null>(() => {
        if (!fetchedData) return null;

        return {
            expressionId: fetchedData.analysis_id,
            predictEmotion: String(fetchedData.predicted_emotion).toUpperCase() as PredictEmotion,
            emotionScores: fetchedData.emotion_probabilities,
            summary: fetchedData.summary,
            videoUrl: fetchedData.video_url,
            walkId: walkId ?? undefined,
        };
    }, [fetchedData, walkId]);

    const scores = useMemo(() => {
        return analysis?.emotionScores ?? {
            happy: 0,
            relaxed: 0,
            sad: 0,
            angry: 0,
        };
    }, [analysis]);

    const handleComplete = () => {
        if (walkId) {
            router.replace(`/walk/complete/${walkId}`);
        } else {
            router.replace("/walk");
        }
    };

    return {
        analysis,
        scores,
        isLoading,
        isError,
        handleComplete,
    };
};