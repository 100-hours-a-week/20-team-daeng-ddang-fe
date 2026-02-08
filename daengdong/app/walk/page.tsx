"use client";

import { WalkMap } from "@/features/walk/ui/WalkMap";
import { WalkStatusPanel } from "@/features/walk/ui/WalkStatusPanel";
import { useWalkStore } from "@/entities/walk/model/walkStore";
import { Header } from "@/widgets/Header";
import { useIdleLocation } from "@/features/walk/model/useIdleLocation";
import { useNearbyBlocksQuery } from "@/entities/walk/model/useBlocksQuery";
import { useDogInfoQuery } from "@/features/dog/api/useDogInfoQuery";
import { WalkSnapshotRenderer } from "@/features/walk/ui/WalkSnapshotRenderer";
import { useMissionScheduler } from "@/features/mission/model/useMissionScheduler";
import { SuddenMissionAlert } from "@/features/mission/ui/SuddenMissionAlert";
import styled from "@emotion/styled";
import { useBlockSynchronization } from "@/features/walk/model/useBlockSynchronization";

export default function WalkPage() {
  const { currentPos, myBlocks, othersBlocks, activeMissionAlert, path } = useWalkStore();

  useIdleLocation();
  useMissionScheduler();

  // GPS 미세 떨림 방지: 소수점 4자리(약 10m)까지만 사용하여 쿼리 키 고정
  const roundCoord = (val: number | undefined) => (val ? Math.round(val * 10000) / 10000 : null);

  const { data: nearbyBlocks } = useNearbyBlocksQuery(
    roundCoord(currentPos?.lat),
    roundCoord(currentPos?.lng),
    1000
  );

  const { data: dog } = useDogInfoQuery();

  useBlockSynchronization(nearbyBlocks, dog?.id);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ zIndex: 10 }}>
        <Header title="댕동여지도" showBackButton={false} />
      </div>

      <div style={{ flex: 1, position: "relative" }}>
        <WalkMap
          currentPos={currentPos}
          myBlocks={myBlocks}
          othersBlocks={othersBlocks}
          path={path}
        />
      </div>

      <WalkSnapshotRenderer path={path} myBlocks={myBlocks} othersBlocks={othersBlocks} currentPos={currentPos} />

      <BottomLayout>
        {activeMissionAlert && <SuddenMissionAlert mission={activeMissionAlert} />}
        <WalkStatusPanel />
      </BottomLayout>
    </div>
  );
}

const BottomLayout = styled.div`
  position: absolute;
  bottom: calc(60px + env(safe-area-inset-bottom));
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  width: 100%;
`;
