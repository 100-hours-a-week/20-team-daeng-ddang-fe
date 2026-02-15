import { useExpressionStore } from "@/entities/expression/model/expressionStore";
import { useMemo } from "react";
import { useRouter } from "next/navigation";

export const useExpressionResult = () => {
    const router = useRouter();
    const { analysis, clearAnalysis } = useExpressionStore();

    const scores = useMemo(() => {
        return analysis?.emotionScores ?? {
            happy: 0,
            relaxed: 0,
            sad: 0,
            angry: 0,
        };
    }, [analysis]);

    const handleComplete = () => {
        clearAnalysis();
        if (analysis?.walkId) {
            router.replace(`/walk/complete/${analysis.walkId}`);
        } else {
            router.replace("/walk");
        }
    };

    return {
        analysis,
        scores,
        handleComplete,
    };
};