import { useQuery } from "@tanstack/react-query";
import { getUserInfo } from "../api/user";

export const useUserQuery = () => {
    return useQuery({
        queryKey: ["user", "info"],
        queryFn: getUserInfo,
        retry: 0,
    });
};
