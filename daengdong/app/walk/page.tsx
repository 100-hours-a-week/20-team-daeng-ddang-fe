"use client";

import { useEffect, useRef, useState } from "react";
import { WalkMap } from "@/widgets/WalkMap/ui/WalkMap";
import { WalkStatusPanel } from "@/widgets/WalkStatusPanel/ui/WalkStatusPanel";
import { useWalkStore } from "@/features/walk/store/walkStore";
import { calculateDistance } from "@/shared/utils/geo";
import { Header } from "@/widgets/Header/Header";

export default function WalkPage() {
  const { walkMode, incrementTime, addDistance, addPathPoint } = useWalkStore();
  const [currentPos, setCurrentPos] = useState<{ lat: number; lng: number } | null>(null);
  const prevPosRef = useRef<{ lat: number; lng: number } | null>(null);

  // 1. Geolocation Tracking
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      alert("이 브라우저에서는 위치 정보가 지원되지 않습니다.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const newPos = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        setCurrentPos(newPos);

        // If walking, track distance and path
        if (walkMode === "walking") {
          addPathPoint(newPos);

          if (prevPosRef.current) {
            const dist = calculateDistance(
              prevPosRef.current.lat,
              prevPosRef.current.lng,
              newPos.lat,
              newPos.lng
            );
            // Minimum movement threshold to avoid GPS jitter (e.g., 5 meters)
            if (dist > 0.005) {
              addDistance(dist);
              prevPosRef.current = newPos;
            }
          } else {
            prevPosRef.current = newPos;
          }
        }
      },
      (err) => console.error(err),
      { enableHighAccuracy: true }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [walkMode, addPathPoint, addDistance]);

  // 2. Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (walkMode === "walking") {
      interval = setInterval(() => {
        incrementTime();
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [walkMode, incrementTime]);

  // Reset prevPos when walk starts (managed by store reset mainly, but here for safety)
  useEffect(() => {
    if (walkMode === "idle") {
      prevPosRef.current = null;
    } else if (walkMode === "walking" && currentPos && !prevPosRef.current) {
      // Initialize prevPos when starting walk if we already have location
      prevPosRef.current = currentPos;
    }
  }, [walkMode, currentPos]);


  return (
    <div style={{ position: "relative", width: "100%", height: "calc(100vh - 80px)" }}>
      <Header title="산책하기" showBackButton={false} />
      <WalkMap currentPos={currentPos} />
      <WalkStatusPanel />
    </div>
  );
}
