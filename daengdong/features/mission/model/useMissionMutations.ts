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
            const mockVideoUrl =
                "https://daeng-map.s3.ap-northeast-2.amazonaws.com/test_set2/HAPPY_02.mp4";

            // TODO: 실제 촬영 영상 업로드 로직 복구
            // const presignedData = await fileApi.getPresignedUrl(
            //     "VIDEO",
            //     "video/mp4",
            //     "MISSION"
            // );
            // await fileApi.uploadFile(presignedData.presignedUrl, file, "video/mp4");
            // const videoUrl = presignedData.presignedUrl.split("?")[0];

            const response = await missionApi.uploadMissionVideo({
                walkId,
                missionId,
                videoUrl: mockVideoUrl,
            });

            return response;
        },
    });
};
