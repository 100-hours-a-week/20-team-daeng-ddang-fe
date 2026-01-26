"use client";

import { WalkMap } from "@/features/walk/ui/WalkMap";
import { WalkStatusPanel } from "@/features/walk/ui/WalkStatusPanel";
import { useWalkStore } from "@/entities/walk/model/walkStore";
import { Header } from "@/widgets/Header/Header";
import { useIdleLocation } from "@/features/walk/model/useIdleLocation";
import { useNearbyBlocksQuery } from "@/entities/walk/model/useBlocksQuery";
import { useUserQuery } from "@/entities/user/model/useUserQuery";
import { useEffect } from "react";

export default function WalkPage() {
  const { currentPos, myBlocks, othersBlocks, setMyBlocks, setOthersBlocks, walkMode } = useWalkStore();

  useIdleLocation();

  // GPS 미세 떨림 방지: 소수점 4자리(약 10m)까지만 사용하여 쿼리 키 고정
  const roundCoord = (val: number | undefined) => (val ? Math.round(val * 10000) / 10000 : null);

  const { data: nearbyBlocks } = useNearbyBlocksQuery(
    roundCoord(currentPos?.lat),
    roundCoord(currentPos?.lng),
    1000
  );

  const { data: user } = useUserQuery();

  useEffect(() => {
    if (nearbyBlocks && user) {
      // 이제 useUserQuery가 실제 dogId를 가져오므로, 정확한 dogId 비교 사용
      const myDogId = user.dogId;

      const myBlocksData = nearbyBlocks.filter(b => b.dogId === myDogId);
      const othersBlocksData = nearbyBlocks.filter(b => b.dogId !== myDogId);

      setMyBlocks(myBlocksData);
      setOthersBlocks(othersBlocksData);
    }
  }, [nearbyBlocks, user, setMyBlocks, setOthersBlocks, walkMode]);

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
