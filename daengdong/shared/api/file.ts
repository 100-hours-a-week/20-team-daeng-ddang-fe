import { http } from "./http";
import { ApiResponse } from "./types";

export type FileType = "IMAGE" | "VIDEO";
export type UploadContext = "WALK" | "EXPRESSION" | "HEALTHCARE" | "CHATBOT" | "MISSION" | "PROFILE";

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

const fileApi = {
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

export default fileApi;
