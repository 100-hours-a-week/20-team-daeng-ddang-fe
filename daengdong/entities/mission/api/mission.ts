import { http } from "@/shared/api/http";
import { ApiResponse } from "@/shared/api/types";

export interface UploadMissionVideoParams {
    walkId: number;
    missionId: number;
    videoUrl: string;
}

export interface UploadMissionVideoResponse {
    missionUploadId: number;
    walkId: number;
    missionId: number;
    videoUrl: string;
    uploadedAt: string;
}

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

export const missionApi = {
    getMissions: async () => {
        const response = await http.get<ApiResponse<GetMissionsResponse>>("/missions");
        return response.data.data;
    },

    uploadMissionVideo: async ({ walkId, missionId, videoUrl }: UploadMissionVideoParams) => {
        const response = await http.post<ApiResponse<UploadMissionVideoResponse>>(
            `/walks/${walkId}/missions/uploads`,
            {
                missionId,
                videoUrl,
            }
        );
        return response.data.data;
    },
};
