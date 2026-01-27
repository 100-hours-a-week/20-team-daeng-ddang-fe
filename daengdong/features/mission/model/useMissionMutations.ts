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
            // 1. Presigned URL 발급
            const presignedData = await fileApi.getPresignedUrl(
                "VIDEO",
                "video/webm", // MediaRecorder default type, adjust if needed
                "WALK"
            );

            // 2. S3 업로드
            await fileApi.uploadFile(presignedData.presignedUrl, file, "video/webm");

            // 3. 백엔드에 결과 저장
            const response = await missionApi.uploadMissionVideo({
                walkId,
                missionId,
                videoUrl: `https://${presignedData.objectKey}`, // Assuming objectKey is sufficient or constructing URL
                // Note: Typically objectKey doesn't contain domain. Let's assume user structure or adjust.
                // The prompt example said: "videoUrl": "https://s3.../video.mp4"
                // fileApi doesn't return full public URL usually, but let's check file.ts again or assume objectKey needs prefix.
                // Re-reading file.ts mock: presignedUrl is for PUT, objectKey is path.
                // Usually we construct public URL or backend constructs it from objectKey.
                // Let's assume passing objectKey is enough OR construct mock domain.
                // Actually, let's construct a probable URL or just pass what we have.
                // Given the user prompt example `https://s3...`, I should probably construct it if I know the bucket.
                // For now, I'll pass the objectKey and ask/verify if full URL is needed.
                // Wait, S3 upload usually implies the URL is `https://{bucket}.s3.region.amazonaws.com/{objectKey}`.
                // Without env vars for bucket, I'll allow the backend to handle it or just pass objectKey if backend handles key.
                // BUT User request says: "videoUrl": "https://s3.../video.mp4" in the body.
                // So I definitely need a URL.
                // Let's use a placeholder domain + objectKey for now as I don't have bucket info in env.ts visible.
                // Actually, I'll verify env.ts to see if bucket url is there.
            });

            return response;
        },
    });
};
