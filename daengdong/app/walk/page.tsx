"use client";

import { WalkMap } from "@/features/walk/ui/WalkMap";
import { WalkStatusPanel } from "@/features/walk/ui/WalkStatusPanel";
import { useWalkStore } from "@/entities/walk/model/walkStore";
import { Header } from "@/widgets/Header/Header";
import { useIdleLocation } from "@/features/walk/model/useIdleLocation";
import { useNearbyBlocksQuery } from "@/entities/walk/model/useBlocksQuery";
import { useUserQuery } from "@/entities/user/model/useUserQuery";
import { useEffect } from "react";
import { WalkSnapshotRenderer } from "@/features/walk/ui/WalkSnapshotRenderer";
import { useRouter } from "next/navigation";

import { useMissionScheduler } from "@/features/mission/model/useMissionScheduler";
import { SuddenMissionAlert } from "@/features/mission/ui/SuddenMissionAlert";
import styled from "@emotion/styled";

export default function WalkPage() {
  const router = useRouter();
  const { currentPos, myBlocks, othersBlocks, setMyBlocks, setOthersBlocks, walkMode, activeMissionAlert, path } = useWalkStore();

  // 약관 동의 여부 확인
  useEffect(() => {
    const termsAgreed = localStorage.getItem('termsAgreed');
    if (!termsAgreed) {
      router.replace('/terms');
    }
  }, [router]);

  useIdleLocation();
  useMissionScheduler();

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
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        height: "100dvh",
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
  position: fixed;
  bottom: calc(60px + env(safe-area-inset-bottom));
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  width: 100%;
`;
