import { http } from '@/shared/api/http';
import { ApiResponse } from '@/shared/api/types';
import { CalendarDayMeta, DailyRecordItem, WalkDetail, HealthcareDetail, WalkExpressionAnalysis } from '@/entities/footprints/model/types';

interface FootprintsResponse {
    days: (CalendarDayMeta & { walkDiaryCount: number; hasWalkDiary: boolean })[];
    month: number;
    year: number;
}

interface DailyRecordsResponse {
    date: string;
    records: {
        id: number;
        title: string;
        type: 'WALK' | 'HEALTH';
        imageUrl?: string;
        createdAt: string;
    }[];
}

export const footprintsApi = {
    // 캘린더 월 단위 조회
    getFootprints: async (year: number, month: number): Promise<CalendarDayMeta[]> => {
        const response = await http.get<ApiResponse<FootprintsResponse>>(`/footprints?year=${year}&month=${month}`);

        const days = response.data.data.days;
        if (Array.isArray(days)) {
            return days.map((day) => ({
                date: day.date,
                walkIntensityLevel: Math.min(day.walkDiaryCount, 3) as 0 | 1 | 2 | 3,
                hasHealthCare: day.hasHealthCare
            }));
        }
        return [];
    },

    // 날짜별 기록 목록 조회
    getDailyRecords: async (date: string): Promise<DailyRecordItem[]> => {
        const response = await http.get<ApiResponse<DailyRecordsResponse>>(`/footprints/dates/${date}`);
        const data = response.data.data;

        if (data && Array.isArray(data.records)) {
            return data.records.map((item) => ({
                type: item.type,
                id: item.id,
                title: item.title,
                imageUrl: item.imageUrl,
                createdAt: item.createdAt
            }));
        }

        return [];
    },

    // 산책일지 상세 조회
    getWalkDetail: async (walkId: number): Promise<WalkDetail> => {
        const response = await http.get<ApiResponse<WalkDetail>>(`/footprints/diaries/${walkId}`);
        return response.data.data;
    },

    // 산책일지 표정 분석 조회
    getWalkExpression: async (walkId: number): Promise<WalkExpressionAnalysis | null> => {
        try {
            interface RawExpressionResponse {
                analysis_id: string;
                expression_id?: number;
                video_url: string;
                emotion_probabilities: {
                    angry: number;
                    happy: number;
                    relaxed: number;
                    sad: number;
                };
                predicted_emotion: 'angry' | 'happy' | 'relaxed' | 'sad';
                summary: string;
                created_at: string;
            }

            const response = await http.get<ApiResponse<RawExpressionResponse>>(`/footprints/diaries/${walkId}/expressions`);
            const data = response.data.data;

            if (!data) return null;

            return {
                analysisId: String(data.expression_id || data.analysis_id),
                videoUrl: data.video_url,
                emotionProbabilities: data.emotion_probabilities,
                predictedEmotion: data.predicted_emotion,
                summary: data.summary
            };
        } catch (e) {
            console.error("Failed to fetch walk expression", e);
            return null;
        }
    },

    // 헬스케어 상세 조회
    getHealthcareDetail: async (healthcareId: number): Promise<HealthcareDetail> => {
        const response = await http.get<ApiResponse<HealthcareDetail>>(`/healthcares/${healthcareId}`);
        return response.data.data;
    }
};
