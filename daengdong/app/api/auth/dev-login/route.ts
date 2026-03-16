import { NextRequest, NextResponse } from "next/server";
import { createBffSession } from "@/server/bffSessionStore";

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const DEV_LOGIN_TIMEOUT_MS = Number(process.env.BFF_DEV_LOGIN_TIMEOUT_MS ?? 10000);

if (!BACKEND_BASE_URL) {
  throw new Error("BACKEND_BASE_URL (NEXT_PUBLIC_API_BASE_URL) is not defined");
}

export async function POST(request: NextRequest) {
  const url = `${BACKEND_BASE_URL}/auth/dev/login`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEV_LOGIN_TIMEOUT_MS);

  let backendResponse: Response;

  try {
    const body = await request.text();

    backendResponse = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": request.headers.get("content-type") ?? "application/json",
      },
      body: body || "{}",
      redirect: "manual",
      signal: controller.signal,
    });

  } catch (error) {
    const isTimeout = error instanceof Error && error.name === "AbortError";

    console.error("[BFF Auth] dev-login request failed", {
      url,
      timeoutMs: DEV_LOGIN_TIMEOUT_MS,
      isTimeout,
      error,
    });

    return NextResponse.json(
      {
        message: isTimeout
          ? "Dev login upstream request timed out."
          : "Dev login upstream request failed.",
        data: null,
        errorCode: "UPSTREAM_REQUEST_FAILED",
      },
      { status: isTimeout ? 504 : 502 }
    );
  } finally {
    clearTimeout(timeout);
  }

  const data = await backendResponse.json().catch(() => null);

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

  backendResponse.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") {
      response.headers.append("set-cookie", value);
    }
  });

  if (accessToken) {
    const isSecureCookie =
      process.env.NODE_ENV === "production" ||
      request.headers.get("x-forwarded-proto") === "https";

    const sid = await createBffSession({
      accessToken,
      createdAt: Date.now(),
    });

    response.cookies.set("dd_sid", sid, {
      httpOnly: true,
      secure: isSecureCookie,
      sameSite: "lax",
      path: "/",
    });
  }

  return response;
}