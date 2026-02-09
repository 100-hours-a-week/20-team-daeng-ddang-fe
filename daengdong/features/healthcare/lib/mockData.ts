import { HealthcareAnalysisResponse } from "@/shared/api/healthcare";

/**
 * 헬스케어 결과 mock 데이터 : ?mock=1
 */
export const mockHealthcareResult: HealthcareAnalysisResponse = {
    overallRiskLevel: "MEDIUM",
    summary: "산책 시 오른쪽 다리의 사용이 불균형하며 슬개골 부담 신호가 감지되었습니다.",
    metrics: {
        patellaRisk: {
            level: "WARNING",
            score: 72,
            description: "오른쪽 뒷다리의 사용 빈도가 낮아 슬개골 부담이 의심됩니다."
        },
        gaitBalance: {
            score: 68,
            description: "좌우 보행 균형이 다소 불안정합니다."
        },
        kneeMobility: {
            score: 75,
            description: "관절 가동 범위는 정상 범위 내에 있습니다."
        },
        gaitStability: {
            score: 70,
            description: "보행 중 체중 이동이 일정하지 않습니다."
        },
        gaitRhythm: {
            score: 80,
            description: "보행 리듬은 비교적 안정적입니다."
        }
    },
    resultImages: {
        reportImageUrl: "https://cdn.example.com/health/report_27.png",
        overlayVideoUrl: "https://cdn.example.com/health/overlay_27.mp4"
    }
};
