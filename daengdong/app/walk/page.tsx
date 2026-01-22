"use client";

import { WalkMap } from "@/features/walk/ui/WalkMap";
import { WalkStatusPanel } from "@/features/walk/ui/WalkStatusPanel";
import { useWalkStore } from "@/entities/walk/model/walkStore";
import { Header } from "@/widgets/Header/Header";
import { useIdleLocation } from "@/features/walk/model/useIdleLocation";
import { useNearbyBlocksQuery } from "@/entities/walk/model/useBlocksQuery";
import { useEffect } from "react";
import { walkApi } from "@/entities/walk/api";

export default function WalkPage() {
  const { currentPos, walkMode, myBlocks, othersBlocks, setMyBlocks, setOthersBlocks } = useWalkStore();

  useIdleLocation();

  const { data: nearbyBlocks } = useNearbyBlocksQuery(
    currentPos?.lat ?? null,
    currentPos?.lng ?? null,
    1000
  );

  useEffect(() => {
    if (currentPos) {
      walkApi.getMyBlocks(currentPos.lat, currentPos.lng).then((blocks) => {
        setMyBlocks(blocks);
      });
    }
  }, [currentPos, setMyBlocks]);

  useEffect(() => {
    if (nearbyBlocks) {
      const myDogId = 1;
      const others = nearbyBlocks.filter(b => b.dogId !== myDogId);
      setOthersBlocks(others);
    }
  }, [nearbyBlocks, setOthersBlocks]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "calc(100vh - 80px)",
      }}
    >
      <Header title="산책하기" showBackButton={false} />
      <WalkMap
        currentPos={currentPos}
        myBlocks={myBlocks}
        othersBlocks={othersBlocks}
      />
      <WalkStatusPanel />
    </div>
  );
}
