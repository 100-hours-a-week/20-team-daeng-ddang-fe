"use client";

import { Suspense } from "react";
import ExpressionResultPage from "@/views/walk/expression/result/ExpressionResultPage";
import { LoadingView } from "@/widgets/GlobalLoading";

export default function Page() {
  return (
    <Suspense fallback={<LoadingView message="결과를 불러오는 중입니다..." />}>
      <ExpressionResultPage />
    </Suspense>
  );
}
