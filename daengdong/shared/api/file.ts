import { http } from "./http";
import { ApiResponse } from "./types";

export interface PresignedUrlResponse {
    url: string;
    key: string;
}

export const fileApi = {
    getPresignedUrl: async (filename: string, contentType: string) => {
        const response = await http.post<ApiResponse<PresignedUrlResponse>>("/files/presigned-url", {
            filename,
            contentType,
        });
        return response.data.data;
    },

    uploadFile: async (url: string, file: Blob, contentType: string) => {
        await fetch(url, {
            method: "PUT",
            body: file,
            headers: {
                "Content-Type": contentType,
            },
        });
    },
};
