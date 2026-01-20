"use client";

import { useEffect, useRef } from "react";
import { useWalkStore } from "@/features/walk/store/walkStore";
import { calculateDistance } from "@/shared/utils/geo";

export const WalkManager = () => {
    const { walkMode, incrementTime, addDistance, addPathPoint, setCurrentPos } = useWalkStore();
    const prevPosRef = useRef<{ lat: number; lng: number } | null>(null);

    // 1. Timer Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (walkMode === "walking") {
            // Update time immediately on mount/resume
            incrementTime();

            interval = setInterval(() => {
                incrementTime();
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [walkMode, incrementTime]);

    // 2. Geolocation Tracking Logic
    useEffect(() => {
        if (!("geolocation" in navigator)) {
            return;
        }

        let watchId: number;

        if (walkMode === "walking") {
            watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    const newPos = {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                    };

                    // Update current position in store
                    setCurrentPos(newPos);

                    // Add to path
                    addPathPoint(newPos);

                    // Calculate distance
                    if (prevPosRef.current) {
                        const dist = calculateDistance(
                            prevPosRef.current.lat,
                            prevPosRef.current.lng,
                            newPos.lat,
                            newPos.lng
                        );
                        // Minimum movement threshold (5m)
                        if (dist > 0.005) {
                            addDistance(dist);
                            prevPosRef.current = newPos;
                        }
                    } else {
                        prevPosRef.current = newPos;
                    }
                },
                (err) => console.error(err),
                { enableHighAccuracy: true }
            );
        } else {
            // Reset prevPos when idle
            prevPosRef.current = null;
        }

        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
        };
    }, [walkMode, addPathPoint, addDistance, setCurrentPos]);

    return null; // This component handles logic only, no UI
};
