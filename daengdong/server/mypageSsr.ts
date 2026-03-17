import { cookies, headers } from "next/headers";
import { getBffSession, updateBffSession } from "@/server/bffSessionStore";
import { ApiResponse } from "@/shared/api/types";
import { MyPageSummary, MyPageSummaryResponse } from "@/entities/mypage/model/types";
import { resolveS3Url } from "@/shared/utils/resolveS3Url";

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!BACKEND_BASE_URL) {
  throw new Error("BACKEND_BASE_URL is not defined");
}

const getAccessTokenFromSession = async (): Promise<string | null> => {
  const cookieStore = await cookies();
  const sid = cookieStore.get("dd_sid")?.value;
  if (!sid) return null;

  const session = await getBffSession(sid);
  if (session?.accessToken) return session.accessToken;

  const requestHeaders = await headers();
  const cookieHeader = requestHeaders.get("cookie");
  if (!cookieHeader) return null;

  const refreshResponse = await fetch(`${BACKEND_BASE_URL}/auth/token`, {
    method: "POST",
    headers: { cookie: cookieHeader },
    redirect: "manual",
    cache: "no-store",
  });

  const refreshData = await refreshResponse.clone().json().catch(() => null);
  const refreshedToken = refreshData?.data?.accessToken as string | undefined;

  if (!refreshResponse.ok || !refreshedToken) return null;

  await updateBffSession(sid, {
    accessToken: refreshedToken,
    createdAt: Date.now(),
  });

  return refreshedToken;
};

export const getMyPageSummarySsrData = async (): Promise<MyPageSummary | null> => {
  const accessToken = await getAccessTokenFromSession();
  if (!accessToken) return null;

  const response = await fetch(`${BACKEND_BASE_URL}/users`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch /users: ${response.status}`);
  }

  const body = (await response.json()) as ApiResponse<MyPageSummaryResponse>;
  const data = body.data;

  return {
    dogId: data.dogId,
    dogName: data.name,
    point: data.point,
    totalWalkCount: data.totalWalkCount,
    totalWalkDistanceKm: data.totalWalkDistanceKm,
    profileImageUrl: resolveS3Url(data.profileImageUrl),
  };
};
