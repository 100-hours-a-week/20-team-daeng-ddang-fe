import { NextRequest, NextResponse } from "next/server";
import { getBffSession, updateBffSession } from "@/server/bffSessionStore";

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!BACKEND_BASE_URL) {
  throw new Error("BACKEND_BASE_URL (NEXT_PUBLIC_API_BASE_URL) is not defined");
}

export async function GET(request: NextRequest) {
  const sid = request.cookies.get("dd_sid")?.value;
  let session = await getBffSession(sid);
  const isSecureCookie = request.nextUrl.protocol === "https:";

  let refreshSetCookie: string | null = null;

  if (sid && !session) {
    const refreshHeaders = new Headers();
    const cookieHeader = request.headers.get("cookie");
    if (cookieHeader) {
      refreshHeaders.set("cookie", cookieHeader);
    }

    const refreshResponse = await fetch(`${BACKEND_BASE_URL}/auth/token`, {
      method: "POST",
      headers: refreshHeaders,
      redirect: "manual",
    });
    refreshSetCookie = refreshResponse.headers.get("set-cookie");

    const refreshData = await refreshResponse.clone().json().catch(() => null);
    const newAccessToken = refreshData?.data?.accessToken as string | undefined;

    if (refreshResponse.ok && newAccessToken) {
      await updateBffSession(sid, {
        accessToken: newAccessToken,
        createdAt: Date.now(),
      });
      session = await getBffSession(sid);
    }
  }

  const response = NextResponse.json({
    authenticated: !!session,
  });

  if (refreshSetCookie) {
    response.headers.append("set-cookie", refreshSetCookie);
  }

  if (sid && !session) {
    response.cookies.set("dd_sid", "", {
      httpOnly: true,
      secure: isSecureCookie,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
  }

  return response;
}
