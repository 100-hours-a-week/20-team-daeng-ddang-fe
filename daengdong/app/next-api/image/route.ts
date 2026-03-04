import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

const ALLOWED_HOSTS = [
    "daeng-map.s3.ap-northeast-2.amazonaws.com",
    "k.kakaocdn.net",
    "via.placeholder.com",
    "placedog.net",
];

const MAX_WIDTH = 2000;
const MIN_QUALITY = 10;
const MAX_QUALITY = 80;
const DEFAULT_QUALITY = 40;

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get("url");
    const width = searchParams.get("w");
    const quality = searchParams.get("q");

    if (!url) {
        return new NextResponse("Missing url parameter", { status: 400 });
    }

    let parsedUrl: URL;

    try {
        parsedUrl = new URL(url);
    } catch {
        return new NextResponse("Invalid URL", { status: 400 });
    }

    // SSRF 방지
    if (!ALLOWED_HOSTS.includes(parsedUrl.hostname)) {
        return new NextResponse("Forbidden", { status: 403 });
    }

    try {
        // fetch timeout 설정
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(parsedUrl.toString(), {
            signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
            return new NextResponse("Failed to fetch image", {
                status: response.status,
            });
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Sharp 입력 픽셀 제한 (OOM 방지)
        let image = sharp(buffer, {
            limitInputPixels: 4096 * 4096,
        });

        // width 제한
        if (width) {
            const w = parseInt(width, 10);
            if (!isNaN(w) && w > 0 && w <= MAX_WIDTH) {
                image = image.resize(w, null, { withoutEnlargement: true });
            }
        }

        // quality 범위 제한
        const parsedQuality = parseInt(quality || "", 10);
        const q = !isNaN(parsedQuality)
            ? Math.min(Math.max(parsedQuality, MIN_QUALITY), MAX_QUALITY)
            : DEFAULT_QUALITY;

        const processedImage = await image.webp({ quality: q }).toBuffer();

        const headers = new Headers();
        headers.set("Content-Type", "image/webp");

        headers.set(
            "Cache-Control",
            "public, max-age=31536000, immutable"
        );

        return new NextResponse(new Uint8Array(processedImage), {
            status: 200,
            headers,
        });
    } catch (error) {
        console.error("Image processing error:", error);

        if ((error as Error).name === "AbortError") {
            return new NextResponse("Image fetch timeout", { status: 504 });
        }

        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
