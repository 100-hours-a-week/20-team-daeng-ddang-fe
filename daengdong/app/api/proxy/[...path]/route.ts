import { NextRequest, NextResponse } from "next/server";
import { deleteBffSession, getBffSession, updateBffSession } from "@/server/bffSessionStore";

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!BACKEND_BASE_URL) {
  throw new Error("BACKEND_BASE_URL (NEXT_PUBLIC_API_BASE_URL) is not defined");
}

const hopByHopHeaders = [
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
];

const sanitizeProxyHeaders = (headers: Headers): Headers => {
  const sanitized = new Headers(headers);
  hopByHopHeaders.forEach((h) => sanitized.delete(h));
  return sanitized;
};

async function refreshAccessTokenFromBackend(request: NextRequest): Promise<{ accessToken?: string; setCookie?: string | null }> {
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
  const newAccessToken = refreshData?.data?.accessToken as string | undefined;

  return {
    accessToken: refreshResponse.ok ? newAccessToken : undefined,
    setCookie: refreshResponse.headers.get("set-cookie"),
  };
}

async function handleProxy(request: NextRequest, path: string[]) {
  const targetPath = path.join("/");

  const url = new URL(request.url);
  const search = url.search || "";

  const targetUrl = `${BACKEND_BASE_URL}/${targetPath}${search}`;
  const sid = request.cookies.get("dd_sid")?.value;
  const isSecureCookie = request.nextUrl.protocol === "https:";
  const session = await getBffSession(sid);
  let refreshSetCookie: string | null = null;
  let accessToken = session?.accessToken;

  // 메모리 세션 유실 시 refresh 쿠키 기반 복구
  if (!accessToken && sid) {
    const refreshed = await refreshAccessTokenFromBackend(request);
    refreshSetCookie = refreshed.setCookie ?? null;
    if (refreshed.accessToken) {
      await updateBffSession(sid, {
        accessToken: refreshed.accessToken,
        createdAt: Date.now(),
      });
      accessToken = refreshed.accessToken;
    }
  }

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");
  if (accessToken) {
    headers.set("authorization", `Bearer ${accessToken}`);
  } else {
    headers.delete("authorization");
  }

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const requestBody = hasBody ? await request.arrayBuffer() : undefined;

  const init: RequestInit & { duplex?: "half" } = {
    method: request.method,
    headers,
    body: requestBody,
    redirect: "manual",
  };
  if (hasBody) {
    init.duplex = "half";
  }

  let backendResponse = await fetch(targetUrl, init);

  // 토큰 만료 시 토큰 갱신
  if (backendResponse.status === 401 && sid) {
    const refreshed = await refreshAccessTokenFromBackend(request);
    refreshSetCookie = refreshed.setCookie ?? refreshSetCookie;
    const newAccessToken = refreshed.accessToken;

    if (newAccessToken) {
      await updateBffSession(sid, {
        accessToken: newAccessToken,
        createdAt: Date.now(),
      });

      headers.set("authorization", `Bearer ${newAccessToken}`);
      backendResponse = await fetch(targetUrl, {
        ...init,
        headers,
      });
    } else {
      await deleteBffSession(sid);
      const unauthorizedHeaders = sanitizeProxyHeaders(backendResponse.headers);
      if (refreshSetCookie) {
        unauthorizedHeaders.append("set-cookie", refreshSetCookie);
      }
      const unauthorized = new NextResponse(backendResponse.body, {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        headers: unauthorizedHeaders,
      });
      unauthorized.cookies.set("dd_sid", "", {
        httpOnly: true,
        secure: isSecureCookie,
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });
      return unauthorized;
    }
  }

  const responseHeaders = sanitizeProxyHeaders(backendResponse.headers);
  if (refreshSetCookie) {
    responseHeaders.append("set-cookie", refreshSetCookie);
  }

  return new NextResponse(backendResponse.body, {
    status: backendResponse.status,
    statusText: backendResponse.statusText,
    headers: responseHeaders,
  });
}

type ProxyRouteParams = {
  params: Promise<{ path: string[] }>;
};

export async function GET(request: NextRequest, { params }: ProxyRouteParams) {
  const { path } = await params;
  return handleProxy(request, path);
}

export async function POST(request: NextRequest, { params }: ProxyRouteParams) {
  const { path } = await params;
  return handleProxy(request, path);
}

export async function PUT(request: NextRequest, { params }: ProxyRouteParams) {
  const { path } = await params;
  return handleProxy(request, path);
}

export async function PATCH(request: NextRequest, { params }: ProxyRouteParams) {
  const { path } = await params;
  return handleProxy(request, path);
}

export async function DELETE(request: NextRequest, { params }: ProxyRouteParams) {
  const { path } = await params;
  return handleProxy(request, path);
}

export async function OPTIONS(request: NextRequest, { params }: ProxyRouteParams) {
  const { path } = await params;
  return handleProxy(request, path);
}

