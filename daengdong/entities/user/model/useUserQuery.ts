import { useAuthStore } from "@/entities/session/model/store";
import { useQuery } from "@tanstack/react-query";
import { getUserInfo } from "../api/user";
import { dogRepositoryReal } from "@/entities/dog/api/dog.real";

export const useUserQuery = () => {
    const { isLoggedIn } = useAuthStore();
    const hasToken = typeof window !== 'undefined' ? !!localStorage.getItem('accessToken') : false;

    return useQuery({
        queryKey: ["user", "info"],
        queryFn: async () => {
            const [userInfo, dogInfo] = await Promise.all([
                getUserInfo(),
                dogRepositoryReal.getDogInfo()
            ]);

            if (!userInfo) return null;

            return {
                ...userInfo,
                dogId: dogInfo?.id,
                dogName: dogInfo?.name
            };
        },
        retry: 0,
        enabled: isLoggedIn && hasToken,
        staleTime: 1000 * 60 * 5,
    });
};
