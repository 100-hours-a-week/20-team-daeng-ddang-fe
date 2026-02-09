export type HealthcareStep = 'intro' | 'record' | 'upload' | 'analyzing' | 'result';

export interface HealthAnalysisResult {
    analysisId: string;
    healthScore: number; // 0-100
    summary: string;
    analyzedAt: string;
    details: HealthDetail[];
}

export interface HealthDetail {
    category: string;
    score: number; // 0-100
    status: 'good' | 'warning' | 'danger';
    description: string;
}

export interface UploadVideoRequest {
    video: Blob;
}

export interface UploadVideoResponse {
    analysisId: string;
    message: string;
}

export interface GetAnalysisResponse {
    data: HealthAnalysisResult;
    status: 'processing' | 'completed' | 'failed';
}
