"use client";

import { WalkMap } from "@/features/walk/ui/WalkMap";
import { WalkStatusPanel } from "@/features/walk/ui/WalkStatusPanel";
import { useWalkStore } from "@/features/walk/store/walkStore";
import { Header } from "@/widgets/Header/Header";
import { useIdleLocation } from "@/features/walk/model/useIdleLocation";

export default function WalkPage() {
  const { currentPos } = useWalkStore();

  useIdleLocation();

  return (
    <div style={{ position: "relative", width: "100%", height: "calc(100vh - 80px)" }}>
      <Header title="산책하기" showBackButton={false} />
      <WalkMap currentPos={currentPos} />
      <WalkStatusPanel />
    </div>
  );
}
