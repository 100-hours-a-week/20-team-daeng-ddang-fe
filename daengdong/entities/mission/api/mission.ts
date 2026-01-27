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

export const missionApi = {
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
