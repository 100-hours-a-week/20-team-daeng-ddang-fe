import { http } from "./http";
import { ApiResponse } from "./types";

export interface HealthcareAnalysisRequest {
    videoUrl: string;
    backVideoUrl?: string;
}

// ... (existing interfaces)

export interface HealthcareMetrics {
    patellaRisk: {
        level: "SAFE" | "WARNING" | "DANGER";
        score: number;
        description: string;
    };
    gaitBalance: {
        score: number;
        description: string;
    };
    kneeMobility: {
        score: number;
        description: string;
    };
    gaitStability: {
        score: number;
        description: string;
    };
    gaitRhythm: {
        score: number;
        description: string;
    };
}

export interface HealthcareAnalysisResponse {
    overallRiskLevel: "LOW" | "MEDIUM" | "HIGH";
    summary: string;
    metrics: HealthcareMetrics;
    resultImages: {
        reportImageUrl: string;
        overlayVideoUrl: string;
    };
}

const healthcareApi = {
    analyzeHealthcare: async (videoUrl: string, backVideoUrl?: string): Promise<HealthcareAnalysisResponse> => {
        const response = await http.post<ApiResponse<HealthcareAnalysisResponse>>("/api/v3/healthcares", {
            videoUrl,
            backVideoUrl,
        });
        return response.data.data;
    },
};

export default healthcareApi;
