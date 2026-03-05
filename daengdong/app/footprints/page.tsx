import { FootprintsPage } from "@/views/footprints/FootprintsPage";
import { Suspense } from "react";

export default function Page() {
    return (
        <Suspense fallback={null}>
            <FootprintsPage />
        </Suspense>
    );
}
