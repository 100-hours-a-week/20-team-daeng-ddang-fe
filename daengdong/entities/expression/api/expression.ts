import { http } from "@/shared/api/http";
import { ApiResponse } from "@/shared/api/types";
import { ExpressionAnalysis } from "../model/types";

interface AnalyzeExpressionRequest {
  videoUrl: string;
}

export const expressionApi = {
  analyzeExpression: async (walkId: number, payload: AnalyzeExpressionRequest) => {
    const response = await http.post<ApiResponse<ExpressionAnalysis>>(
      `/walks/${walkId}/expressions`,
      payload
    );
    return response.data.data;
  },
};
