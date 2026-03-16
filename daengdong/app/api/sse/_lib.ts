import { NextRequest, NextResponse } from "next/server";
import { deleteBffSession, getBffSession, updateBffSession } from "@/server/bffSessionStore";

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!BACKEND_BASE_URL) {
  throw new Error("BACKEND_BASE_URL (NEXT_PUBLIC_API_BASE_URL) is not defined");
}

const stripHeaders = (headers: Headers): Headers => {
  const responseHeaders = new Headers(headers);
  [
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailer",
    "transfer-encoding",
    "upgrade",
    "content-encoding",
    "content-length",
  ].forEach((h) => responseHeaders.delete(h));
  return responseHeaders;
};

const refreshAccessToken = async (request: NextRequest): Promise<{ accessToken?: string; setCookie?: string | null }> => {
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
    setCookie: refreshResponse.headers.get("set-cookie"),
  };
};

export const proxySse = async (request: NextRequest, backendPath: string): Promise<NextResponse> => {
  const sid = request.cookies.get("dd_sid")?.value;
  const isSecureCookie = request.nextUrl.protocol === "https:";
  const session = await getBffSession(sid);
  let accessToken = session?.accessToken;
  let refreshSetCookie: string | null = null;

  if (!sid) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  if (!accessToken) {
    const refreshed = await refreshAccessToken(request);
    refreshSetCookie = refreshed.setCookie ?? null;
    if (!refreshed.accessToken) {
      const res = new NextResponse("Unauthorized", { status: 401 });
      res.cookies.set("dd_sid", "", {
        httpOnly: true,
        secure: isSecureCookie,
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });
      return res;
    }

    await updateBffSession(sid, {
      accessToken: refreshed.accessToken,
      createdAt: Date.now(),
    });
    accessToken = refreshed.accessToken;
  }

  const targetUrl = `${BACKEND_BASE_URL}/${backendPath}`;
  const upstream = await fetch(targetUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "text/event-stream",
      "Cache-Control": "no-cache",
    },
    redirect: "manual",
  });

  // 만료 시 refresh 후 1회 재연결
  if (upstream.status === 401) {
    const refreshed = await refreshAccessToken(request);
    refreshSetCookie = refreshed.setCookie ?? refreshSetCookie;
    if (!refreshed.accessToken) {
      await deleteBffSession(sid);
      const res = new NextResponse("Unauthorized", { status: 401 });
      res.cookies.set("dd_sid", "", {
        httpOnly: true,
        secure: isSecureCookie,
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });
      return res;
    }

    await updateBffSession(sid, {
      accessToken: refreshed.accessToken,
      createdAt: Date.now(),
    });

    const retry = await fetch(targetUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${refreshed.accessToken}`,
        Accept: "text/event-stream",
        "Cache-Control": "no-cache",
      },
      redirect: "manual",
    });

    const retryHeaders = stripHeaders(retry.headers);
    retryHeaders.set("Content-Type", "text/event-stream");
    retryHeaders.set("Cache-Control", "no-cache, no-transform");
    retryHeaders.set("Connection", "keep-alive");
    if (refreshSetCookie) {
      retryHeaders.append("set-cookie", refreshSetCookie);
    }

    return new NextResponse(retry.body, {
      status: retry.status,
      statusText: retry.statusText,
      headers: retryHeaders,
    });
  }

  const responseHeaders = stripHeaders(upstream.headers);
  responseHeaders.set("Content-Type", "text/event-stream");
  responseHeaders.set("Cache-Control", "no-cache, no-transform");
  responseHeaders.set("Connection", "keep-alive");
  if (refreshSetCookie) {
    responseHeaders.append("set-cookie", refreshSetCookie);
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
};
