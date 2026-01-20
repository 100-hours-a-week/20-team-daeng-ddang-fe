import { http } from './http';

interface UploadResponse {
    message: string;
    data: {
        url: string;
    };
    errorCode: string | null;
}

export const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await http.post<UploadResponse>('/files/images', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data.data.url;
};
