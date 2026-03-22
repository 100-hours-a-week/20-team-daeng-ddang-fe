"use client";

import { PropsWithChildren, useEffect, useState } from "react";

interface DeferredRenderProps extends PropsWithChildren {
    delayMs?: number;
}

export const DeferredRender = ({ children, delayMs = 100 }: DeferredRenderProps) => {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setReady(true);
        }, delayMs);

        return () => window.clearTimeout(timer);
    }, [delayMs]);

    if (!ready) return null;

    return <>{children}</>;
};
