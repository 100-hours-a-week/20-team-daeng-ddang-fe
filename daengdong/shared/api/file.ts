import { http } from "./http";
import { ApiResponse } from "./types";
import { ENV } from "@/shared/config/env";

export type FileType = "IMAGE";
export type UploadContext = "WALK" | "DOG_PROFILE";

export interface GetPresignedUrlRequest {
    fileType: FileType;
    contentType: string;
    uploadContext: UploadContext;
}

export interface GetPresignedUrlResponse {
    presignedUrl: string;
    objectKey: string;
    expiresIn: number;
}

const realFileApi = {
    // Presigned URL 발급 요청
    getPresignedUrl: async (fileType: FileType, contentType: string, uploadContext: UploadContext) => {
        const response = await http.post<ApiResponse<GetPresignedUrlResponse>>("/files/presigned-url", {
            fileType,
            contentType,
            uploadContext,
        });
        return response.data.data;
    },

    uploadFile: async (url: string, file: Blob, contentType: string) => {
        const response = await fetch(url, {
            method: "PUT",
            body: file,
            headers: {
                "Content-Type": contentType,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to upload file to S3: ${response.status} ${response.statusText}`);
        }
    },
};

const mockFileApi = {
    getPresignedUrl: async (fileType: FileType, contentType: string, uploadContext: UploadContext) => {
        console.log("[MockAPI] getPresignedUrl called", { fileType, contentType, uploadContext });

        // 가짜 응답 반환
        return new Promise<GetPresignedUrlResponse>((resolve) => {
            setTimeout(() => {
                resolve({
                    presignedUrl: "https://mock-s3-bucket.com/upload/mock-image.png",
                    objectKey: "mock/images/walk-snapshot.png",
                    expiresIn: 3600
                });
            }, 500);
        });
    },

    uploadFile: async (url: string, file: Blob, contentType: string) => {
        console.log("[MockAPI] uploadFile called", { url, contentType });

        // 가짜 업로드 성공
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                resolve();
            }, 1000);
        });
    }
};

export const fileApi = ENV.USE_MOCK ? mockFileApi : realFileApi;
