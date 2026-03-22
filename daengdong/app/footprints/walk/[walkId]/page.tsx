import { redirect } from "next/navigation";
import { WalkDetailPage } from "@/views/footprints/WalkDetailPage";
import { getWalkDetailSsrData } from "@/server/footprintsSsr";

type Props = {
    params: Promise<{ walkId: string }>;
};

export default async function Page({ params }: Props) {
    const { walkId } = await params;
    const parsedWalkId = Number(walkId);
    if (Number.isNaN(parsedWalkId)) {
        redirect("/footprints");
    }

    const data = await getWalkDetailSsrData(parsedWalkId);
    if (!data) {
        redirect("/login");
    }

    return (
        <WalkDetailPage
            walk={data.walk}
            expression={data.expression}
        />
    );
}
