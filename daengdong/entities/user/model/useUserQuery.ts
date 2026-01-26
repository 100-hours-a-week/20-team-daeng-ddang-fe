import { useQuery } from "@tanstack/react-query";
import { getUserInfo } from "../api/user";

export const useUserQuery = () => {
    const isLogin = typeof window !== 'undefined' ? window.location.pathname === '/login' : false;
    const hasToken = typeof window !== 'undefined' ? !!localStorage.getItem('accessToken') : false;

    return useQuery({
        queryKey: ["user", "info"],
        queryFn: getUserInfo,
        retry: 0,
        enabled: !isLogin && hasToken, // 로그인 페이지거나 토큰 없으면 요청 안 함
    });
};
