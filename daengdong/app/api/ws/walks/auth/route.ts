import { NextRequest, NextResponse } from "next/server";
import { getBffSession, updateBffSession } from "@/server/bffSessionStore";
import { appendSetCookies } from "@/server/setCookie";

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!BACKEND_BASE_URL) {
  throw new Error("BACKEND_BASE_URL (NEXT_PUBLIC_API_BASE_URL) is not defined");
}

type RefreshResult = {
  accessToken?: string;
  headers: Headers;
};

const refreshAccessTokenFromBackend = async (request: NextRequest): Promise<RefreshResult> => {
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

  const refreshData = await refreshResponse.clone().json().catch(() => null);
  const accessToken = refreshData?.data?.accessToken as string | undefined;

  return {
    accessToken: refreshResponse.ok ? accessToken : undefined,
    headers: refreshResponse.headers,
  };
};

export async function GET(request: NextRequest) {
  const sid = request.cookies.get("dd_sid")?.value;
  if (!sid) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let session = getBffSession(sid);
  let refreshResponseHeaders: Headers | null = null;

  if (!session) {
    const refreshed = await refreshAccessTokenFromBackend(request);
    refreshResponseHeaders = refreshed.headers;

    if (refreshed.accessToken) {
      updateBffSession(sid, {
        accessToken: refreshed.accessToken,
        createdAt: Date.now(),
      });
      session = getBffSession(sid);
    }
  }

  if (!session?.accessToken) {
    const unauthorized = NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (refreshResponseHeaders) {
      appendSetCookies(unauthorized.headers, refreshResponseHeaders);
    }
    return unauthorized;
  }

  const response = NextResponse.json({
    accessToken: session.accessToken,
  });

  if (refreshResponseHeaders) {
    appendSetCookies(response.headers, refreshResponseHeaders);
  }

  return response;
}
