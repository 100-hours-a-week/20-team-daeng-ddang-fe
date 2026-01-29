const DEFAULT_S3_BASE_URL =
    process.env.NEXT_PUBLIC_S3_BASE_URL ??
    "https://daeng-dong-map.s3.ap-northeast-2.amazonaws.com";

export const resolveS3Url = (url?: string | null): string | undefined => {
    if (!url) return undefined;
    if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
    }

    const base = DEFAULT_S3_BASE_URL.replace(/\/$/, "");
    const path = url.replace(/^\/+/, "");
    return `${base}/${path}`;
};
