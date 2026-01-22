import { useQuery } from "@tanstack/react-query";
import { walkApi } from "../api";

export const useWalkMissionQuery = (walkId: number | undefined) => {
    return useQuery({
        queryKey: ["walkMissionAnalysis", walkId],
        queryFn: () => walkApi.getWalkMissionAnalysis(walkId!),
        enabled: !!walkId,
        retry: false,
    });
};
