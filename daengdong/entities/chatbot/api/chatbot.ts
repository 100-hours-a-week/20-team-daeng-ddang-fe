import { http } from "@/shared/api/http";
import { ApiResponse } from "@/shared/api/types";

export interface ChatSessionResponse {
    conversationId: string;
    createdAt: string;
    expiresAt: string;
}

export interface ChatMessageRequest {
    conversationId: string;
    message: string;
    imageUrl?: string | null;
}

export interface ChatMessageResponse {
    conversationId: string;
    answer: string;
    answeredAt: string;
    disclaimer?: string;
    followups?: string[];
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
            payload,
            { timeout: 120000 }
        );
        return response.data.data;
    },
};

export default chatbotApi;
