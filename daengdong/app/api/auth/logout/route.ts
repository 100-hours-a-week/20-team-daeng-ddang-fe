import { NextRequest, NextResponse } from "next/server";
import { deleteBffSession } from "@/server/bffSessionStore";

export async function POST(request: NextRequest) {
  const sid = request.cookies.get("dd_sid")?.value;
  const isSecureCookie = request.nextUrl.protocol === "https:";

  if (sid) {
    await deleteBffSession(sid);
  }

  const response = NextResponse.json({ message: "logged out" });

  response.cookies.set("dd_sid", "", {
    httpOnly: true,
    secure: isSecureCookie,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  response.cookies.set("isLoggedIn", "", {
    path: "/",
    maxAge: 0,
  });

  return response;
}

