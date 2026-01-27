import { useMutation } from "@tanstack/react-query";
import { fileApi } from "@/shared/api/file";
import { missionApi } from "@/entities/mission/api/mission";

interface UploadMissionVideoParams {
    walkId: number;
    missionId: number;
    file: Blob;
}

export const useUploadMissionVideo = () => {
    return useMutation({
        mutationFn: async ({ walkId, missionId, file }: UploadMissionVideoParams) => {
            const presignedData = await fileApi.getPresignedUrl(
                "VIDEO",
                "video/mp4",
                "MISSION"
            );

            await fileApi.uploadFile(presignedData.presignedUrl, file, "video/mp4");

            // Presigned URL에서 public URL 추출
            const videoUrl = presignedData.presignedUrl.split("?")[0];

            const response = await missionApi.uploadMissionVideo({
                walkId,
                missionId,
                videoUrl,
            });

            return response;
        },
    });
};
