import { useEffect, useRef } from "react";
import { useWalkStore } from "@/entities/walk/model/walkStore";
import { calculateDistance } from "@/shared/utils/geo";

export const WalkManager = () => {
    const { walkMode, incrementTime, addDistance, addPathPoint, setCurrentPos, currentPos } = useWalkStore();
    const prevPosRef = useRef<{ lat: number; lng: number } | null>(null);

    // 산책 복구 시 위치 추적 이어가기
    useEffect(() => {
        if (walkMode === "walking" && currentPos && !prevPosRef.current) {
            prevPosRef.current = currentPos;
        }
    }, [walkMode, currentPos]); // 마운트 또는 모드변경

    // 시간 추적
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (walkMode === "walking") {
            incrementTime();

            interval = setInterval(() => {
                incrementTime();
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [walkMode, incrementTime]);

    // 위치 추적
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

                    // 현재 위치 업데이트
                    setCurrentPos(newPos);

                    // 경로에 추가
                    addPathPoint(newPos);

                    // 거리 계산
                    if (prevPosRef.current) {
                        const dist = calculateDistance(
                            prevPosRef.current.lat,
                            prevPosRef.current.lng,
                            newPos.lat,
                            newPos.lng
                        );
                        // 5m 이상 움직였을 때만 거리 추가
                        if (dist > 0.005) {
                            // addDistance(dist / 3);
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
            prevPosRef.current = null;
        }

        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
        };
    }, [walkMode, addPathPoint, addDistance, setCurrentPos]);

    return null;
};
