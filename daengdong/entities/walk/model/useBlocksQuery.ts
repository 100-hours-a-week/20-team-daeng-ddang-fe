import { useQuery } from "@tanstack/react-query";
import { walkApi } from "../api";

import { useAuthStore } from "@/entities/session/model/store";

export const useNearbyBlocksQuery = (
    lat: number | null,
    lng: number | null,
    radius: number = 1000
) => {
    const { isLoggedIn } = useAuthStore();
    const hasToken = typeof window !== 'undefined' ? !!localStorage.getItem('accessToken') : false;

    return useQuery({
        queryKey: ["nearbyBlocks", lat, lng, radius],
        queryFn: () => walkApi.getNearbyBlocks({ lat: lat!, lng: lng!, radius }),
        enabled: lat !== null && lng !== null && isLoggedIn && hasToken,
        staleTime: 30000,
        refetchOnWindowFocus: false,
    });
};
