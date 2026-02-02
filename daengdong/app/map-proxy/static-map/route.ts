import { NextResponse } from "next/server";

export const runtime = "nodejs";

const STATIC_MAP_BASE_URL = "https://maps.apigw.ntruss.com/map-static/v2/raster";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;
    const clientSecret = process.env.NAVER_MAP_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        return NextResponse.json(
            { error: "Sever Config Error: API Keys missing" },
            { status: 500 }
        );
    }

    try {
        const apiUrl = `${STATIC_MAP_BASE_URL}?${searchParams.toString()}`;


        const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
                "x-ncp-apigw-api-key-id": clientId,
                "x-ncp-apigw-api-key": clientSecret,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("[API] Error:", response.status, errorText);
            return NextResponse.json(
                { error: "Static Map API Error", details: errorText },
                { status: response.status }
            );
        }

        // 이미지 바이너리 반환 (기본 jpg)
        const buffer = await response.arrayBuffer();
        const headers = new Headers();
        headers.set("Content-Type", "image/jpeg");
        headers.set("Cache-Control", "public, max-age=3600");

        return new NextResponse(buffer, {
            status: 200,
            headers,
        });

    } catch (error) {
        console.error("[API] Server Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
