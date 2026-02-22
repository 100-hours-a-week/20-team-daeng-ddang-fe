import { http } from "@/shared/api/http";
import { ApiResponse } from "@/shared/api/types";

// ─── 표정 분석 Task 생성 ─────────────────────────────────────
export interface CreateExpressionTaskResponse {
  taskId: string;
  status: "PENDING" | "RUNNING" | "SUCCESS" | "FAIL";
}

// ─── 작업 상태 조회 (미션/표정 공통) ────────────────────────────
export type TaskStatus = "PENDING" | "RUNNING" | "SUCCESS" | "FAIL";

export interface AnalysisTaskStatusResponse {
  taskId: string;
  walkId: number;
  type: "MISSION" | "EXPRESSION";
  status: TaskStatus;
  requestedAt: string;
  startedAt?: string;
  finishedAt?: string;
  errorCode?: string | null;
  errorMessage?: string | null;
}

export const expressionApi = {
  /** 표정 분석 Task 생성*/
  createExpressionTask: async (
    walkId: number,
    payload: { videoUrl: string }
  ): Promise<CreateExpressionTaskResponse> => {
    const response = await http.post<ApiResponse<CreateExpressionTaskResponse>>(
      `/walks/${walkId}/expressions/analysis/tasks`,
      payload
    );
    return response.data.data;
  },

  /** 작업 상태 조회 (미션/표정 공통)*/
  getAnalysisTaskStatus: async (
    walkId: number,
    taskId: string
  ): Promise<AnalysisTaskStatusResponse> => {
    const response = await http.get<ApiResponse<AnalysisTaskStatusResponse>>(
      `/walks/${walkId}/analysis/tasks/${taskId}`
    );
    return response.data.data;
  },
};
