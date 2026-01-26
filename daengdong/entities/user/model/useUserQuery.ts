import { useAuthStore } from "@/entities/session/model/store";
import { useQuery } from "@tanstack/react-query";
import { getUserInfo } from "../api/user";

export const useUserQuery = () => {
    const { isLoggedIn } = useAuthStore();
    const hasToken = typeof window !== 'undefined' ? !!localStorage.getItem('accessToken') : false;

    return useQuery({
        queryKey: ["user", "info"],
        queryFn: getUserInfo,
        retry: 0,
        enabled: isLoggedIn && hasToken, // 전역 로그인 상태와 토큰이 모두 있을 때만 요청
        staleTime: 1000 * 60 * 5, // 5분간 캐시 유지 (불필요한 재요청 방지)
    });
};
