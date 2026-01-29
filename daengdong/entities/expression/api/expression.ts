import { http } from "@/shared/api/http";
import { ApiResponse } from "@/shared/api/types";
import { EmotionScores, ExpressionAnalysis } from "../model/types";

interface AnalyzeExpressionRequest {
  videoUrl: string;
}

interface AnalyzeExpressionResponse {
  analysis_id: string;
  predicted_emotion: string;
  emotion_probabilities: EmotionScores;
  summary: string;
  imageUrl?: string;
  createdAt?: string;
  dogId?: number;
  walkId?: number;
}

export const expressionApi = {
  analyzeExpression: async (walkId: number, payload: AnalyzeExpressionRequest) => {
    const response = await http.post<ApiResponse<AnalyzeExpressionResponse>>(
      `/walks/${walkId}/expressions/analysis`,
      payload
    );
    const data = response.data.data;
    return {
      expressionId: data.analysis_id,
      predictEmotion: data.predicted_emotion?.toUpperCase(),
      emotionScores: data.emotion_probabilities,
      summary: data.summary,
      imageUrl: data.imageUrl,
      createdAt: data.createdAt,
      dogId: data.dogId,
      walkId: data.walkId ?? walkId,
    } as ExpressionAnalysis;
  },
};
