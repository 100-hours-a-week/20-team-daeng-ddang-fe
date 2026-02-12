const DEFAULT_S3_BASE_URL =
    process.env.NEXT_PUBLIC_S3_BASE_URL ??
    "https://daeng-map.s3.ap-northeast-2.amazonaws.com";

export const resolveS3Url = (url?: string | null): string | undefined => {
    if (!url) return undefined;

    // Treat legacy/test domains as missing profile to show DefaultDogImage
    if (url.includes("cdn.example.com")) {
        return undefined;
    }

    if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
    }

    const base = DEFAULT_S3_BASE_URL.replace(/\/$/, "");
    const path = url.replace(/^\/+/, "");
    return `${base}/${path}`;
};
