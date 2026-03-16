import { headers, cookies } from "next/headers";
import { getBffSession, updateBffSession } from "@/server/bffSessionStore";
import { ApiResponse } from "@/shared/api/types";
import { HealthcareDetail, WalkDetail, WalkExpressionAnalysis } from "@/entities/footprints/model/types";

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!BACKEND_BASE_URL) {
  throw new Error("BACKEND_BASE_URL is not defined");
}

const getAccessTokenFromSession = async (): Promise<string | null> => {
  const cookieStore = await cookies();
  const sid = cookieStore.get("dd_sid")?.value;
  if (!sid) return null;

  const session = await getBffSession(sid);
  if (session?.accessToken) {
    return session.accessToken;
  }

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
  if (!refreshResponse.ok || !refreshedToken) {
    return null;
  }

  await updateBffSession(sid, {
    accessToken: refreshedToken,
    createdAt: Date.now(),
  });

  return refreshedToken;
};

const fetchWithToken = async <T>(path: string, accessToken: string): Promise<T | null> => {
  const response = await fetch(`${BACKEND_BASE_URL}${path}`, {
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
    throw new Error(`Failed to fetch ${path}: ${response.status}`);
  }

  const body = (await response.json()) as ApiResponse<T>;
  return body.data;
};

export const getWalkDetailSsrData = async (
  walkId: number
): Promise<{ walk: WalkDetail; expression: WalkExpressionAnalysis | null } | null> => {
  const accessToken = await getAccessTokenFromSession();
  if (!accessToken) return null;

  const walk = await fetchWithToken<WalkDetail>(`/footprints/diaries/${walkId}`, accessToken);
  if (!walk) return null;

  let expression: WalkExpressionAnalysis | null = null;
  try {
    type RawExpressionResponse = {
      analysis_id: string;
      expression_id?: number;
      video_url: string;
      emotion_probabilities: {
        angry: number;
        happy: number;
        relaxed: number;
        sad: number;
      };
      predicted_emotion: "angry" | "happy" | "relaxed" | "sad";
      summary: string;
    };

    const expressionRaw = await fetchWithToken<RawExpressionResponse>(
      `/footprints/diaries/${walkId}/expressions`,
      accessToken
    );

    if (expressionRaw) {
      expression = {
        analysisId: String(expressionRaw.expression_id || expressionRaw.analysis_id),
        videoUrl: expressionRaw.video_url,
        emotionProbabilities: expressionRaw.emotion_probabilities,
        predictedEmotion: expressionRaw.predicted_emotion,
        summary: expressionRaw.summary,
      };
    }
  } catch {
    expression = null;
  }

  return { walk, expression };
};

export const getHealthcareDetailSsrData = async (healthcareId: number): Promise<HealthcareDetail | null> => {
  const accessToken = await getAccessTokenFromSession();
  if (!accessToken) return null;

  return fetchWithToken<HealthcareDetail>(`/healthcares/${healthcareId}`, accessToken);
};
