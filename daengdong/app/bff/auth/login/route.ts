import { NextRequest, NextResponse } from "next/server";
import { createBffSession, SESSION_TTL_SECONDS } from "@/server/bffSessionStore";
import { appendSetCookies } from "@/server/setCookie";

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!BACKEND_BASE_URL) {
  throw new Error("BACKEND_BASE_URL (NEXT_PUBLIC_API_BASE_URL) is not defined");
}

export async function POST(request: NextRequest) {
  const url = `${BACKEND_BASE_URL}/auth/login`;

  const body = await request.text();
  const backendResponse = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": request.headers.get("content-type") ?? "application/json",
    },
    body,
    redirect: "manual",
  });

  const cloned = backendResponse.clone();
  const data = await cloned.json().catch(() => null);

  const accessToken = data?.data?.accessToken as string | undefined;

  const responseData =
    data && typeof data === "object"
      ? {
          ...data,
          data:
            data.data && typeof data.data === "object"
              ? { ...data.data, accessToken: undefined }
              : data.data,
        }
      : data;

  const response = NextResponse.json(responseData, {
    status: backendResponse.status,
  });

  if (accessToken) {
    const isSecureCookie = request.nextUrl.protocol === "https:";
    const sid = await createBffSession({
      accessToken,
      createdAt: Date.now(),
    });

    response.cookies.set("dd_sid", sid, {
      httpOnly: true,
      secure: isSecureCookie,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_TTL_SECONDS,
    });
  }

  appendSetCookies(response.headers, backendResponse.headers);

  return response;
}
