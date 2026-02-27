import fileApi from "@/shared/api/file";

export const uploadVideo = async (videoBlob: Blob): Promise<string> => {
    const contentType = videoBlob.type || 'video/mp4';

    const presignedData = await fileApi.getPresignedUrl('VIDEO', contentType, 'HEALTHCARE');

    await fileApi.uploadFile(presignedData.presignedUrl, videoBlob, contentType);

    const cdnBaseUrl = process.env.NEXT_PUBLIC_CDN_URL || 'https://daeng-map.s3.ap-northeast-2.amazonaws.com';
    return `${cdnBaseUrl}/${presignedData.objectKey}`;
};
