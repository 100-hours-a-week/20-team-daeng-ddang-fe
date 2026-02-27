import { http } from "@/shared/api/http";
import { ApiResponse } from "@/shared/api/types";

export interface Mission {
    missionId: number;
    title: string;
    description: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    missionType: "SIT" | "WAIT" | "LOOK" | "TOUCH" | "ETC";
    createdAt: string;
}

export interface GetMissionsResponse {
    missions: Mission[];
}

export interface UploadMissionVideoResponse {
    missionUploadId: number;
    walkId: number;
    missionId: number;
    videoUrl: string;
    uploadedAt: string;
}

export interface CreateMissionTaskResponse {
    taskId: string;
    status: "PENDING" | "RUNNING" | "SUCCESS" | "FAIL";
}

export const missionApi = {
    getMissions: async () => {
        const response = await http.get<ApiResponse<GetMissionsResponse>>("/missions");
        return response.data.data;
    },

    uploadMissionVideo: async (
        walkId: number,
        payload: { missionId: number; videoUrl: string }
    ): Promise<UploadMissionVideoResponse> => {
        const response = await http.post<ApiResponse<UploadMissionVideoResponse>>(
            `/walks/${walkId}/missions`,
            payload
        );
        return response.data.data;
    },

    createMissionTask: async (walkId: number): Promise<CreateMissionTaskResponse> => {
        const response = await http.post<ApiResponse<CreateMissionTaskResponse>>(
            `/walks/${walkId}/missions/analysis/tasks`
        );
        return response.data.data;
    },
};
