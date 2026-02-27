"use client";

import { Suspense } from "react";
import ExpressionPage from "@/views/walk/expression/ExpressionPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ExpressionPage />
    </Suspense>
  );
}
