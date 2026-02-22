import { http } from "@/shared/api/http";
import { ApiResponse } from "@/shared/api/types";

export interface CreateHealthcareTaskResponse {
    taskId: string;
    status: "PENDING" | "RUNNING" | "SUCCESS" | "FAIL";
}

export type HealthcareTaskStatus = "PENDING" | "RUNNING" | "SUCCESS" | "FAIL";

export interface HealthcareTaskStatusResponse {
    taskId: string;
    walkId: null;
    type: "HEALTHCARE";
    status: HealthcareTaskStatus;
    requestedAt: string;
    startedAt?: string;
    finishedAt?: string;
    errorCode?: string | null;
    errorMessage?: string | null;
    resultType?: string | null;
    resultId?: string | null;
}

export interface HealthcareMetric {
    score: number;
    level: string;
    description: string;
}

export interface HealthcareMetrics {
    gaitBalance: HealthcareMetric;
    gaitRhythm: HealthcareMetric;
    gaitStability: HealthcareMetric;
    kneeMobility: HealthcareMetric;
    patellaRiskSignal: HealthcareMetric;
}

export interface HealthcareAnalysisResponse {
    healthcareId: number;
    analyzedAt: string;
    overallRiskLevel: string;
    summary: string;
    metrics: HealthcareMetrics;
    artifacts: {
        keypointOverlayVideoUrl?: string;
    };
}

export const healthcareApi = {
    createHealthcareTask: async (videoUrl: string, backVideoUrl?: string): Promise<CreateHealthcareTaskResponse> => {
        const response = await http.post<ApiResponse<CreateHealthcareTaskResponse>>(
            "/healthcares/analysis/tasks",
            { videoUrl, ...(backVideoUrl && { backVideoUrl }) }
        );
        return response.data.data;
    },

    getHealthcareTaskStatus: async (taskId: string): Promise<HealthcareTaskStatusResponse> => {
        const response = await http.get<ApiResponse<HealthcareTaskStatusResponse>>(
            `/healthcares/analysis/tasks/${taskId}`
        );
        return response.data.data;
    },

    getHealthcareResult: async (healthcareId: number): Promise<HealthcareAnalysisResponse> => {
        const response = await http.get<ApiResponse<HealthcareAnalysisResponse>>(
            `/healthcares/${healthcareId}`
        );
        return response.data.data;
    },
};

export default healthcareApi;
