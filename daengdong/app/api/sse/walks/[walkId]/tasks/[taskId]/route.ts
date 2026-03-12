import { NextRequest } from "next/server";
import { proxySse } from "@/app/api/sse/_lib";

type Params = {
  params: Promise<{
    walkId: string;
    taskId: string;
  }>;
};

export async function GET(request: NextRequest, { params }: Params) {
  const { walkId, taskId } = await params;
  return proxySse(request, `walks/${walkId}/analysis/tasks/${taskId}/events`);
}
