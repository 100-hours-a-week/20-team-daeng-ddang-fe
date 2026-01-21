export interface ApiResponse<T> {
    message: string;
    data: T;
    errorCode: string | null;
}
