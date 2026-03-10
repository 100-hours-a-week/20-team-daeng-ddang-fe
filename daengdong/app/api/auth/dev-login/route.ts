import { NextRequest, NextResponse } from "next/server";
import { createBffSession } from "@/server/bffSessionStore";

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!BACKEND_BASE_URL) {
  throw new Error("BACKEND_BASE_URL (NEXT_PUBLIC_API_BASE_URL) is not defined");
}

export async function POST(request: NextRequest) {
  const url = `${BACKEND_BASE_URL}/auth/dev/login`;

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

  const response = NextResponse.json(data, {
    status: backendResponse.status,
  });

  const setCookie = backendResponse.headers.get("set-cookie");
  if (setCookie) {
    response.headers.append("set-cookie", setCookie);
  }

  if (accessToken) {
    const sid = createBffSession({
      accessToken,
      createdAt: Date.now(),
    });

    response.cookies.set("dd_sid", sid, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
    });
  }

  return response;
}