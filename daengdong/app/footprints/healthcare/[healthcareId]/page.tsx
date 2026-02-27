"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { HealthcareDetailPage } from "@/views/footprints/HealthcareDetailPage";

type Props = {
    params: Promise<{ healthcareId: string }>;
};

export default function Page({ params }: Props) {
    const { healthcareId } = use(params);
    const router = useRouter();

    return (
        <HealthcareDetailPage
            healthcareId={Number(healthcareId)}
            onBack={() => router.back()}
        />
    );
}
