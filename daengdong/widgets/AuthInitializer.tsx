"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/entities/session/model/store";

export const AuthInitializer = () => {
    const { checkLoginStatus } = useAuthStore();

    useEffect(() => {
        checkLoginStatus();
    }, [checkLoginStatus]);

    return null;
};
