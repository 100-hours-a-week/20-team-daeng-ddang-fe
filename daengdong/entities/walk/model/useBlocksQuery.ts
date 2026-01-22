import { useQuery } from "@tanstack/react-query";
import { walkApi } from "../api";

export const useNearbyBlocksQuery = (
    lat: number | null,
    lng: number | null,
    radius: number = 500
) => {
    return useQuery({
        queryKey: ["nearbyBlocks", lat, lng, radius],
        queryFn: () => walkApi.getNearbyBlocks({ lat: lat!, lng: lng!, radius }),
        enabled: lat !== null && lng !== null,
        staleTime: 30000,
        refetchOnWindowFocus: false,
    });
};
