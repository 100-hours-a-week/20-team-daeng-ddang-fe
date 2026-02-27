/**
 * 작업(표정/미션) 상태를 polling하는 유틸 함수
 */

import { http } from "@/shared/api/http";
import { ApiResponse } from "@/shared/api/types";

type TaskStatus = "PENDING" | "RUNNING" | "SUCCESS" | "FAIL";

interface TaskStatusResponse {
    taskId: string;
    walkId: number;
    status: TaskStatus;
    errorCode?: string | null;
    errorMessage?: string | null;
}

interface PollOptions {
    interval?: number;
    timeout?: number;
    onProgress?: (status: TaskStatus) => void;
    signal?: AbortSignal;
}

export const pollAnalysisTask = (
    walkId: number,
    taskId: string,
    options: PollOptions = {}
): Promise<void> => {
    const {
        interval = 2000,
        timeout = 30000,
        onProgress,
        signal,
    } = options;

    return new Promise((resolve, reject) => {
        let timer: ReturnType<typeof setTimeout> | null = null;
        const startTime = Date.now();
        let settled = false; // resolve/reject 중복 방지 

        const cleanup = () => {
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
        };

        const safeResolve = () => {
            if (settled) return;
            settled = true;
            cleanup();
            resolve();
        };

        const safeReject = (error: unknown) => {
            if (settled) return;
            settled = true;
            cleanup();
            reject(error);
        };

        const tick = async () => {
            if (signal?.aborted) {
                safeReject(new DOMException("작업이 중단되었습니다.", "AbortError"));
                return;
            }

            if (Date.now() - startTime > timeout) {
                safeReject(new Error("작업 시간이 초과되었습니다."));
                return;
            }

            try {
                const response = await http.get<ApiResponse<TaskStatusResponse>>(
                    `/walks/${walkId}/analysis/tasks/${taskId}`,
                    { signal }
                );

                const data = response.data.data;

                onProgress?.(data.status);

                if (data.status === "SUCCESS") {
                    safeResolve();
                    return;
                }

                if (data.status === "FAIL") {
                    safeReject(
                        new Error(
                            data.errorMessage ?? "분석에 실패했습니다."
                        )
                    );
                    return;
                }

                timer = setTimeout(tick, interval);

            } catch (err) {
                // axios는 AbortSignal로 요청 취소 시 ERR_CANCELED 던짐
                // → 실제 실패와 구분해 AbortError로 처리
                const isAxiosCanceled =
                    (err as { code?: string }).code === "ERR_CANCELED" ||
                    signal?.aborted;
                if (isAxiosCanceled) {
                    safeReject(new DOMException("작업이 중단되었습니다.", "AbortError"));
                } else {
                    safeReject(err);
                }
            }
        };

        tick();
    });
};