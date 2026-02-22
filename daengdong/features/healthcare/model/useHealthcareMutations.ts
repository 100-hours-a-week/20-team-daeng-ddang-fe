import { useHealthcareStore } from "@/entities/healthcare/model/healthcareStore";
import { useToastStore } from "@/shared/stores/useToastStore";
import { useLoadingStore } from "@/shared/stores/useLoadingStore";
import healthcareApi from "@/entities/healthcare/api/healthcare";
import { uploadVideo } from "../lib/uploadVideo";

/**
 * 헬스케어 Task 상태를 polling하는 내부 유틸
 * 성공 시 healthcareId 반환, 실패 시 throw
 */
const pollHealthcareTask = (
    taskId: string,
    signal?: AbortSignal
): Promise<number> => {
    return new Promise((resolve, reject) => {
        let timer: ReturnType<typeof setTimeout> | null = null;
        let settled = false;

        const cleanup = () => { if (timer) { clearTimeout(timer); timer = null; } };
        const safeResolve = (id: number) => { if (settled) return; settled = true; cleanup(); resolve(id); };
        const safeReject = (err: unknown) => { if (settled) return; settled = true; cleanup(); reject(err); };

        const tick = async () => {
            if (signal?.aborted) { safeReject(new DOMException("헬스케어 분석이 취소되었습니다.", "AbortError")); return; }
            try {
                const data = await healthcareApi.getHealthcareTaskStatus(taskId);

                if (data.status === "SUCCESS") {
                    const healthcareId = data.resultId ? Number(data.resultId) : null;
                    if (!healthcareId) { safeReject(new Error("결과 ID를 받지 못했습니다.")); return; }
                    safeResolve(healthcareId);
                    return;
                }
                if (data.status === "FAIL") {
                    safeReject(new Error(data.errorMessage ?? "헬스케어 분석에 실패했습니다."));
                    return;
                }
                timer = setTimeout(tick, 2000);
            } catch (err) {
                safeReject(err);
            }
        };

        tick();
    });
};

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

            // Task 완료까지 polling
            showLoading("헬스케어 분석 중입니다...");
            const healthcareId = await pollHealthcareTask(task.taskId);

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
