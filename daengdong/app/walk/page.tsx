"use client";

import { WalkMap } from "@/features/walk/ui/WalkMap";
import { WalkStatusPanel } from "@/features/walk/ui/WalkStatusPanel";
import { useWalkStore } from "@/entities/walk/model/walkStore";
import { Header } from "@/widgets/Header/Header";
import { useIdleLocation } from "@/features/walk/model/useIdleLocation";
import { useNearbyBlocksQuery } from "@/entities/walk/model/useBlocksQuery";
import { useEffect } from "react";

export default function WalkPage() {
  const { currentPos, myBlocks, othersBlocks, setMyBlocks, setOthersBlocks } = useWalkStore();

  useIdleLocation();

  const { data: nearbyBlocks } = useNearbyBlocksQuery(
    currentPos?.lat ?? null,
    currentPos?.lng ?? null,
    1000
  );

  // nearbyBlocks를 myBlocks와 othersBlocks로 분리
  useEffect(() => {
    if (nearbyBlocks) {
      const myDogId = 1;
      const myBlocksData = nearbyBlocks.filter(b => b.dogId === myDogId);
      const othersBlocksData = nearbyBlocks.filter(b => b.dogId !== myDogId);

      setMyBlocks(myBlocksData);
      setOthersBlocks(othersBlocksData);
    }
  }, [nearbyBlocks, setMyBlocks, setOthersBlocks]);

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
