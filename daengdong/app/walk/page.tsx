"use client";

import { WalkMap } from "@/features/walk/ui/WalkMap";
import { WalkStatusPanel } from "@/features/walk/ui/WalkStatusPanel";
import { useWalkStore } from "@/entities/walk/model/walkStore";
import { Header } from "@/widgets/Header/Header";
import { useIdleLocation } from "@/features/walk/model/useIdleLocation";
import { useNearbyBlocksQuery } from "@/entities/walk/model/useBlocksQuery";
import { useEffect } from "react";
import { getMyBlocks } from "@/entities/walk/api/blocks";

export default function WalkPage() {
  const { currentPos, walkMode, myBlocks, othersBlocks, setMyBlocks, setOthersBlocks } = useWalkStore();

  useIdleLocation();

  const { data: nearbyBlocksData } = useNearbyBlocksQuery(
    currentPos?.lat ?? null,
    currentPos?.lng ?? null,
    500
  );

  useEffect(() => {
    if (walkMode === "idle") {
      setMyBlocks([]);
      setOthersBlocks([]);
    }
  }, [walkMode, setMyBlocks, setOthersBlocks]);

  useEffect(() => {
    if (walkMode === "walking" && myBlocks.length === 0 && currentPos) {
      getMyBlocks(currentPos.lat, currentPos.lng).then((response) => {
        setMyBlocks(response.data.blocks);
      });
    }
  }, [walkMode, myBlocks.length, currentPos, setMyBlocks]);

  useEffect(() => {
    if (nearbyBlocksData?.data?.blocks) {
      const myDogId = 1;
      const blocks = nearbyBlocksData.data.blocks;

      if (walkMode === "idle") {
        const mine = blocks.filter(b => b.dogId === myDogId);
        const others = blocks.filter(b => b.dogId !== myDogId);

        setMyBlocks(mine);
        setOthersBlocks(others);
      } else {
        const others = blocks.filter(b => b.dogId !== myDogId);
        setOthersBlocks(others);
      }
    }
  }, [walkMode, nearbyBlocksData, setMyBlocks, setOthersBlocks]);

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
