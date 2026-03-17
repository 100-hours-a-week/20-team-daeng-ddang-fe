import { FootprintsPage } from "@/views/footprints/FootprintsPage";
import { headers } from "next/headers";
import { DailyRecordItem } from "@/entities/footprints/model/types";
import { ApiResponse } from "@/shared/api/types";

interface DailyRecordsResponse {
    date: string;
    records: {
        id: number;
        title: string;
        type: "WALK" | "HEALTH";
        imageUrl?: string;
        createdAt?: string;
    }[];
}

const resolveBaseUrl = async () => {
    const headerStore = await headers();
    const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
    const protocol = headerStore.get("x-forwarded-proto") ?? "http";

    if (!host) {
        return "http://localhost:3000";
    }

    return `${protocol}://${host}`;
};

const normalizeDate = (rawDate: string | undefined) => {
    if (!rawDate) {
        return new Date().toISOString().slice(0, 10);
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
        return new Date().toISOString().slice(0, 10);
    }

    return rawDate;
};

const getInitialRecords = async (selectedDate: string): Promise<DailyRecordItem[] | undefined> => {
    try {
        const headerStore = await headers();
        const cookie = headerStore.get("cookie");
        const baseUrl = await resolveBaseUrl();
        const response = await fetch(`${baseUrl}/bff/proxy/footprints/dates/${selectedDate}`, {
            method: "GET",
            cache: "no-store",
            credentials: "include",
            headers: cookie ? { cookie } : undefined,
        });

        if (!response.ok) {
            return undefined;
        }

        const body = (await response.json()) as ApiResponse<DailyRecordsResponse>;
        const records = body.data?.records;

        if (!Array.isArray(records)) {
            return undefined;
        }

        return records.map((item) => ({
            type: item.type,
            id: item.id,
            title: item.title,
            imageUrl: item.imageUrl,
            createdAt: item.createdAt,
        }));
    } catch {
        return undefined;
    }
};

type PageProps = {
    searchParams?:
        | Record<string, string | string[] | undefined>
        | Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({ searchParams }: PageProps) {
    const params = searchParams ? await Promise.resolve(searchParams) : {};
    const dateParam = Array.isArray(params.date) ? params.date[0] : params.date;
    const selectedDate = normalizeDate(dateParam);
    const initialRecords = await getInitialRecords(selectedDate);

    return <FootprintsPage initialSelectedDate={selectedDate} initialRecords={initialRecords} />;
}
