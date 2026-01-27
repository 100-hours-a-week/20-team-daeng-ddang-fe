import { http } from "./http";
import { ApiResponse } from "./types";


export type FileType = "IMAGE";
export type UploadContext = "WALK" | "PROFILE";

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
        const response = await http.post<ApiResponse<GetPresignedUrlResponse>>("/presigned-url", {
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

// MOCK 모드여도 파일 업로드는 실제 S3를 사용하도록 강제함
export const fileApi = realFileApi;
