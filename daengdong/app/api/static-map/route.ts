import { NextResponse } from "next/server";

export const runtime = "nodejs";

const STATIC_MAP_BASE_URL = "https://maps.apigw.ntruss.com/map-static/v2/raster";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    // 1. 쿼리 파라미터 그대로 사용 (w, h, center, level 등)
    // format, crs 등은 클라이언트에서 안보내면 기본값 사용됨

    // 2. 환경변수 확인
    const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;
    const clientSecret = process.env.NAVER_MAP_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        return NextResponse.json(
            { error: "Sever Config Error: API Keys missing" },
            { status: 500 }
        );
    }

    try {
        // 3. 네이버 API 호출
        const apiUrl = `${STATIC_MAP_BASE_URL}?${searchParams.toString()}`;
        console.log("[API] Requesting:", apiUrl);

        const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
                "x-ncp-apigw-api-key-id": clientId,
                "x-ncp-apigw-api-key": clientSecret,
            },
        });

        // 4. 에러 처리
        if (!response.ok) {
            const errorText = await response.text();
            console.error("[API] Error:", response.status, errorText);
            return NextResponse.json(
                { error: "Static Map API Error", details: errorText },
                { status: response.status }
            );
        }

        // 5. 이미지 바이너리 반환 (기본 jpg)
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
