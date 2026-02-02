import { useMutation } from "@tanstack/react-query";
import { missionApi } from "@/entities/mission/api/mission";
import { fileApi } from "@/shared/api/file";

interface UploadMissionVideoParams {
    walkId: number;
    missionId: number;
    file: Blob;
}

export const useUploadMissionVideo = () => {
    return useMutation({
        mutationFn: async ({ walkId, missionId, file }: UploadMissionVideoParams) => {
            const mimeType = file.type || "video/mp4";

            const presignedData = await fileApi.getPresignedUrl(
                "VIDEO",
                mimeType,
                "MISSION"
            );
            await fileApi.uploadFile(presignedData.presignedUrl, file, mimeType);
            const videoUrl = presignedData.presignedUrl.split("?")[0];

            const response = await missionApi.uploadMissionVideo({
                walkId,
                missionId,
                videoUrl: videoUrl,
            });

            return response;
        },
    });
};
