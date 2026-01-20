"use client";

import { useEffect } from "react";
import { WalkMap } from "@/widgets/WalkMap/ui/WalkMap";
import { WalkStatusPanel } from "@/widgets/WalkStatusPanel/ui/WalkStatusPanel";
import { useWalkStore } from "@/features/walk/store/walkStore";
import { Header } from "@/widgets/Header/Header";

export default function WalkPage() {
  const { walkMode, currentPos, setCurrentPos } = useWalkStore();

  // Geolocation Tracking for "Idle" mode
  // When "walking", WalkManager (global) handles tracking.
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      alert("이 브라우저에서는 위치 정보가 지원되지 않습니다.");
      return;
    }

    let watchId: number;

    if (walkMode === "idle") {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const newPos = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setCurrentPos(newPos);
        },
        (err) => console.error(err),
        { enableHighAccuracy: true }
      );
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [walkMode, setCurrentPos]);

  return (
    <div style={{ position: "relative", width: "100%", height: "calc(100vh - 80px)" }}>
      <Header title="산책하기" showBackButton={false} />
      <WalkMap currentPos={currentPos} />
      <WalkStatusPanel />
    </div>
  );
}
