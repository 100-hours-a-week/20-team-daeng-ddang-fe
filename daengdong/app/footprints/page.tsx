import { FootprintsPage } from "@/views/footprints/FootprintsPage";

const normalizeDate = (rawDate: string | undefined) => {
    if (!rawDate) {
        return new Date().toISOString().slice(0, 10);
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
        return new Date().toISOString().slice(0, 10);
    }

    return rawDate;
};

type PageProps = {
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({ searchParams }: PageProps) {
    const params = (await searchParams) ?? {};
    const dateParam = Array.isArray(params.date) ? params.date[0] : params.date;
    const selectedDate = normalizeDate(dateParam);

    return <FootprintsPage initialSelectedDate={selectedDate} />;
}
