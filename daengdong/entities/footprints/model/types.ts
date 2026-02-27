export interface CalendarDayMeta {
    date: string; // YYYY-MM-DD
    walkIntensityLevel: 0 | 1 | 2 | 3;
    hasHealthCare: boolean;
}

export type RecordType = 'WALK' | 'HEALTH';

export interface DailyRecordItem {
    type: RecordType;
    id: number;
    title: string;
    imageUrl?: string;
    createdAt?: string;
}

export interface WalkDetail {
    walkDiaryId: number;
    createdAt: string;
    distance: number;
    duration: number;
    mapImageUrl: string | null;
    memo: string;
    region?: string;
}

export interface WalkExpressionAnalysis {
    analysisId: string;
    videoUrl: string;
    emotionProbabilities: {
        angry: number;
        happy: number;
        relaxed: number;
        sad: number;
    };
    predictedEmotion: 'angry' | 'happy' | 'relaxed' | 'sad';
    summary: string;
}

export interface HealthcareDetail {
    healthcareId: number;
    analyzedAt: string;
    overallRiskLevel: 'low' | 'medium' | 'high';
    summary: string;
    metrics: {
        patellaRiskSignal: { score: number; level: string; description: string };
        gaitBalance: { score: number; level: string; description: string };
        kneeMobility: { score: number; level: string; description: string };
        gaitStability: { score: number; level: string; description: string };
        gaitRhythm: { score: number; level: string; description: string };
    };
    artifacts?: {
        keypointOverlayVideoUrl?: string;
    };
}
