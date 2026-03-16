import { RankingPage } from "@/views/ranking/RankingPage";
import { format } from "date-fns";
import { ApiResponse } from "@/shared/api/types";
import { RankingList, RankingSummary } from "@/entities/ranking/model/types";
import { InfiniteData } from "@tanstack/react-query";
import { resolveS3Url } from "@/shared/utils/resolveS3Url";

export const dynamic = "force-dynamic";

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const getInitialRankingData = async (): Promise<{
    summary?: ApiResponse<RankingSummary>;
    list?: InfiniteData<ApiResponse<RankingList>, string | undefined>;
}> => {
    if (!BACKEND_BASE_URL) {
        return {};
    }

    const periodType = "WEEK";
    const periodValue = format(new Date(), "yyyy-'W'II");
    const params = new URLSearchParams({
        periodType,
        periodValue,
    });

    try {
        const [summaryRes, listRes] = await Promise.all([
            fetch(`${BACKEND_BASE_URL}/rankings/dogs/summary?${params.toString()}`, {
                cache: "no-store",
            }),
            fetch(`${BACKEND_BASE_URL}/rankings/dogs?${params.toString()}`, {
                cache: "no-store",
            }),
        ]);

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
