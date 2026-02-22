import { http } from "@/shared/api/http";
import { ApiResponse } from "@/shared/api/types";

export interface ChatSessionResponse {
    sessionId: string;
    createdAt: string;
    expiresAt: string;
}

export interface ChatMessageRequest {
    sessionId: string;
    message: string;
    imageUrl?: string;
}

export interface ChatMessageResponse {
    answer: string;
    disclaimer: string;
    followups: string[];
    answeredAt: string;
}

export const chatbotApi = {
    createChatSession: async (): Promise<ChatSessionResponse> => {
        const response = await http.post<ApiResponse<ChatSessionResponse>>(
            "/healthcares/chat/sessions"
        );
        return response.data.data;
    },

    sendChatMessage: async (payload: ChatMessageRequest): Promise<ChatMessageResponse> => {
        const response = await http.post<ApiResponse<ChatMessageResponse>>(
            "/healthcares/chat",
            payload
        );
        return response.data.data;
    },
};

export default chatbotApi;
