import { RankingPage } from "@/views/ranking/RankingPage";
import { format } from "date-fns";
import { headers } from "next/headers";
import { ApiResponse } from "@/shared/api/types";
import { RankingList, RankingSummary } from "@/entities/ranking/model/types";
import { InfiniteData } from "@tanstack/react-query";
import { resolveS3Url } from "@/shared/utils/resolveS3Url";

export const dynamic = "force-dynamic";

const getInitialRankingData = async (): Promise<{
    summary?: ApiResponse<RankingSummary>;
    list?: InfiniteData<ApiResponse<RankingList>, string | undefined>;
}> => {
    const useBffAuth = process.env.NEXT_PUBLIC_USE_BFF_AUTH === "true";
    const backendBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    if (!backendBaseUrl) {
        return {};
    }

    const periodType = "WEEK";
    const periodValue = format(new Date(), "yyyy-'W'II");
    const params = new URLSearchParams({
        periodType,
        periodValue,
    });

    try {
        let summaryRes: Response;
        let listRes: Response;

        if (useBffAuth) {
            const headersList = await headers();
            const cookie = headersList.get("cookie") ?? "";
            const port = process.env.PORT ?? 3000;
            const baseUrl = `http://127.0.0.1:${port}`;

            [summaryRes, listRes] = await Promise.all([
                fetch(`${baseUrl}/bff/proxy/rankings/dogs/summary?${params.toString()}`, {
                    cache: "no-store",
                    headers: { cookie },
                }),
                fetch(`${baseUrl}/bff/proxy/rankings/dogs?${params.toString()}`, {
                    cache: "no-store",
                    headers: { cookie },
                }),
            ]);
        } else {
            [summaryRes, listRes] = await Promise.all([
                fetch(`${backendBaseUrl}/rankings/dogs/summary?${params.toString()}`, {
                    cache: "no-store",
                }),
                fetch(`${backendBaseUrl}/rankings/dogs?${params.toString()}`, {
                    cache: "no-store",
                }),
            ]);
        }

        if (!summaryRes.ok || !listRes.ok) {
            return {};
        }

        const [summary, firstPage] = (await Promise.all([
            summaryRes.json(),
            listRes.json(),
        ])) as [ApiResponse<RankingSummary>, ApiResponse<RankingList>];

        const list: InfiniteData<ApiResponse<RankingList>, string | undefined> = {
            pages: [firstPage],
            pageParams: [undefined],
        };

        return {
            summary,
            list,
        };
    } catch {
        return {};
    }
};

export default async function Page() {
    const initialData = await getInitialRankingData();
    const topRankImage = initialData.summary?.data.topRanks?.[0]?.profileImageUrl;
    const resolvedTopRankImage = resolveS3Url(topRankImage);
    const lcpPreloadHref = resolvedTopRankImage
        ? `/next-api/image?url=${encodeURIComponent(resolvedTopRankImage)}&w=144&q=40`
        : null;

    return (
        <>
            {lcpPreloadHref && (
                <link
                    rel="preload"
                    as="image"
                    href={lcpPreloadHref}
                    fetchPriority="high"
                />
            )}
            <RankingPage
                initialSummaryData={initialData.summary}
                initialListData={initialData.list}
            />
        </>
    );
}
