import { redirect } from "next/navigation";
import { HealthcareDetailPage } from "@/views/footprints/HealthcareDetailPage";
import { getHealthcareDetailSsrData } from "@/server/footprintsSsr";

type Props = {
    params: Promise<{ healthcareId: string }>;
};

export default async function Page({ params }: Props) {
    const { healthcareId } = await params;
    const parsedHealthcareId = Number(healthcareId);
    if (Number.isNaN(parsedHealthcareId)) {
        redirect("/footprints");
    }

    const healthcare = await getHealthcareDetailSsrData(parsedHealthcareId);
    if (!healthcare) {
        redirect("/login");
    }

    return (
        <HealthcareDetailPage
            healthcare={healthcare}
        />
    );
}
