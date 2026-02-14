"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { WalkDetailPage } from "@/views/footprints/WalkDetailPage";

type Props = {
    params: Promise<{ walkId: string }>;
};

export default function Page({ params }: Props) {
    const { walkId } = use(params);
    const router = useRouter();

    return (
        <WalkDetailPage
            walkId={Number(walkId)}
            onBack={() => router.back()}
        />
    );
}
