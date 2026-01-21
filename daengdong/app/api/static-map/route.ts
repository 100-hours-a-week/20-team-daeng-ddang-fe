import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    // Optional parameters with defaults
    const w = searchParams.get("w") || "300";
    const h = searchParams.get("h") || "300";
    const level = searchParams.get("level") || "16";
    const scale = searchParams.get("scale") || "2";

    if (!lat || !lng) {
        return new NextResponse("Missing lat or lng", { status: 400 });
    }

    // Use keys from environment variables
    const clientId = process.env.NAVER_MAP_CLIENT_ID;
    const clientSecret = process.env.NAVER_MAP_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        return new NextResponse("Server configuration error: Missing API keys", { status: 500 });
    }

    const url = `https://maps.apigw.ntruss.com/map-static/v2/raster?w=${w}&h=${h}&center=${lng},${lat}&level=${level}&scale=${scale}&markers=type:d|size:mid|pos:${lng} ${lat}`;

    try {
        const res = await fetch(url, {
            headers: {
                "x-ncp-apigw-api-key-id": clientId,
                "x-ncp-apigw-api-key": clientSecret,
            },
        });

        if (!res.ok) {
            return new NextResponse(`Upstream API Error: ${res.status} ${res.statusText}`, { status: res.status });
        }

        const arrayBuffer = await res.arrayBuffer();

        return new NextResponse(arrayBuffer, {
            headers: {
                "Content-Type": "image/png",
                "Cache-Control": "public, max-age=3600, s-maxage=3600",
            },
        });
    } catch (error) {
        console.error("Static map proxy error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
