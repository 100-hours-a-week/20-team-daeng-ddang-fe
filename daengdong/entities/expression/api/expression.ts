import { http } from "@/shared/api/http";
import { ApiResponse } from "@/shared/api/types";
import { ExpressionAnalysis } from "../model/types";

interface AnalyzeExpressionRequest {
  videoUrl: string;
}

export const expressionApi = {
  analyzeExpression: async (walkId: number, payload: AnalyzeExpressionRequest) => {
    const response = await http.post<ApiResponse<any>>(
      `/walks/${walkId}/expressions/analysis`,
      payload
    );
    const data = response.data.data;
    return {
      expressionId: data.analysis_id,
      predictEmotion: data.predicted_emotion?.toUpperCase(),
      emotionScores: data.emotion_probabilities,
      summary: data.summary,
      imageUrl: undefined, // API response doesn't include image URL
      createdAt: new Date().toISOString(),
      dogId: 0,
      walkId,
    } as ExpressionAnalysis;
  },
};
