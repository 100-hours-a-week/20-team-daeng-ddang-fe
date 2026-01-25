import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const walkId = searchParams.get("walkId");

    if (!walkId) {
        return NextResponse.json({ error: "산책 ID가 없습니다." }, { status: 400 });
    }

    try {
        const isLocal = process.env.NODE_ENV === "development";

        let executablePath = await chromium.executablePath();

        if (isLocal) {
            executablePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
        }

        const browser = await puppeteer.launch({
            args: isLocal ? puppeteer.defaultArgs() : chromium.args,
            executablePath: executablePath,
            headless: true,
        });

        const page = await browser.newPage();

        let snapshotData = null;
        try {
            const body = await req.json();
            snapshotData = body.data;
        } catch {
        }

        if (snapshotData) {
            await page.evaluateOnNewDocument((data) => {
                window.SNAPSHOT_DATA = data;
            }, snapshotData);
        }

        await page.setViewport({
            width: 1280,
            height: 1280,
            deviceScaleFactor: 2,
        });

        const protocol = req.nextUrl.protocol;
        const host = req.nextUrl.host;
        const snapshotUrl = `${protocol}//${host}/snapshot/${walkId}`;

        console.log(`스냅샷 생성 URL: ${snapshotUrl}`);

        await page.goto(snapshotUrl, {
            waitUntil: "domcontentloaded",
            timeout: 10000,
        });

        try {
            await page.waitForFunction("window.snapshotReady === true", {
                timeout: 5000,
            });
        } catch {
            console.warn("스냅샷 생성 타임아웃");
        }

        const buffer = await page.screenshot({
            type: "png",
            fullPage: false,
        });

        await browser.close();

        return new NextResponse(Buffer.from(buffer), {
            headers: {
                "Content-Type": "image/png",
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });

    } catch (error) {
        console.error("스냅샷 생성 실패:", error);
        return NextResponse.json(
            { error: "스냅샷 생성 실패", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
