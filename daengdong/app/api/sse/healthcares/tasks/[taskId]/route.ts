import { NextRequest } from "next/server";
import { proxySse } from "@/app/api/sse/_lib";

type Params = {
  params: Promise<{
    taskId: string;
  }>;
};

export async function GET(request: NextRequest, { params }: Params) {
  const { taskId } = await params;
  return proxySse(request, `healthcares/analysis/tasks/${taskId}/events`);
}
