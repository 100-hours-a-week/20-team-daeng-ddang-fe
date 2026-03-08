import { useHealthcareStore } from "@/entities/healthcare/model/healthcareStore";
import { useToastStore } from "@/shared/stores/useToastStore";
import { useLoadingStore } from "@/shared/stores/useLoadingStore";
import healthcareApi from "@/entities/healthcare/api/healthcare";
import { uploadVideo } from "../lib/uploadVideo";
import { connectHealthcareSSE } from "@/shared/lib/sse/analysisSSE";

export const useHealthcareMutations = () => {
    const { setResult, setStep } = useHealthcareStore();
    const { showToast } = useToastStore();
    const { showLoading, hideLoading } = useLoadingStore();

    const uploadAndAnalyze = async (videoBlob: Blob, backVideoBlob?: Blob): Promise<void> => {
        showLoading("영상을 업로드하는 중입니다...");

        try {
            // 영상 S3 업로드
            const videoUrl = await uploadVideo(videoBlob);
            let backVideoUrl: string | undefined;
            if (backVideoBlob) {
                backVideoUrl = await uploadVideo(backVideoBlob);
            }

            // Task 생성
            showLoading("헬스케어 분석을 요청하는 중입니다...");
            const task = await healthcareApi.createHealthcareTask(videoUrl, backVideoUrl);
            showLoading("헬스케어 분석 중입니다...");
            const healthcareId = await new Promise<number>((resolve, reject) => {
                connectHealthcareSSE(
                    task.taskId,
                    (data) => {
                        const id = data.resultId ? Number(data.resultId) : null;
                        if (!id) { reject(new Error("결과 ID를 받지 못했습니다.")); return; }
                        resolve(id);
                    },
                    (err) => reject(err)
                );
            });

            // 결과 조회
            const result = await healthcareApi.getHealthcareResult(healthcareId);

            setResult(result);
            setStep('result');
            showToast({ message: "분석이 완료되었습니다!", type: "success" });

        } catch (error) {
            console.error('Healthcare analysis failed:', error);
            const message = error instanceof Error ? error.message : "분석에 실패했습니다. 다시 시도해주세요.";
            showToast({ message, type: "error" });
            throw error;
        } finally {
            hideLoading();
        }
    };

    return {
        uploadAndAnalyze,
    };
};
