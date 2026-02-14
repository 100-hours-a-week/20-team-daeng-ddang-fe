import { useHealthcareStore } from "@/entities/healthcare/model/healthcareStore";
import { useToastStore } from "@/shared/stores/useToastStore";
import { useLoadingStore } from "@/shared/stores/useLoadingStore";
import healthcareApi, { HealthcareAnalysisResponse } from "@/shared/api/healthcare";
import { uploadVideo } from "../lib/uploadVideo";

export const useHealthcareMutations = () => {
    const { setResult, setStep } = useHealthcareStore();
    const { showToast } = useToastStore();
    const { showLoading, hideLoading } = useLoadingStore();

    const uploadAndAnalyze = async (videoBlob: Blob, backVideoBlob?: Blob): Promise<HealthcareAnalysisResponse> => {
        showLoading("영상을 업로드하고 분석 중입니다...");

        try {
            const videoUrl = await uploadVideo(videoBlob);

            let backVideoUrl: string | undefined;
            if (backVideoBlob) {
                backVideoUrl = await uploadVideo(backVideoBlob);
            }

            const analysisResult = await healthcareApi.analyzeHealthcare(videoUrl, backVideoUrl);

            setResult(analysisResult);
            setStep('result');

            showToast({ message: "분석이 완료되었습니다!", type: "success" });

            return analysisResult;
        } catch (error) {
            console.error('Healthcare analysis failed:', error);
            showToast({ message: "분석에 실패했습니다. 다시 시도해주세요.", type: "error" });
            throw error;
        } finally {
            hideLoading();
        }
    };

    return {
        uploadAndAnalyze,
    };
};
