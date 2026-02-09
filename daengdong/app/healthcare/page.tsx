"use client";

import { Suspense } from "react";
import { HealthcareScreen } from "./ui/HealthcareScreen";

export default function HealthcarePage() {
    return (
        <Suspense fallback={null}>
            <HealthcareScreen />
        </Suspense>
    );
}
