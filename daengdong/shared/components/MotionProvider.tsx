"use client";

import { LazyMotion } from "framer-motion";
import React from "react";

const loadFeatures = () => import("./framer-features").then((res) => res.domAnimation);

export default function MotionProvider({ children }: { children: React.ReactNode }) {
    return (
        <LazyMotion features={loadFeatures} strict>
            {children}
        </LazyMotion>
    );
}
