import { useEffect } from "react";
import { useWalkStore } from "@/entities/walk/model/walkStore";
import { BlockData } from "@/entities/walk/model/types";

export const useBlockSynchronization = (
    nearbyBlocks: BlockData[] | undefined,
    dogId: number | undefined
) => {
    const { walkMode } = useWalkStore();

    useEffect(() => {
        if (nearbyBlocks && dogId) {
            const myDogId = dogId;
            if (!myDogId) return;

            const { myBlocks: currentMyBlocks, setMyBlocks, setOthersBlocks } = useWalkStore.getState();

            const apiMyBlocks = nearbyBlocks.filter(b => b.dogId === myDogId);
            const apiOthersBlocks = nearbyBlocks.filter(b => b.dogId !== myDogId);

            /**
             * 내 블록 병합
             * - API는 지연될 수 있으므로 로컬 상태를 우선 보존
             * - API에 존재하지만 로컬에 없는 블록만 추가 (중복 제거 강화)
             */
            const currentBlockIds = new Set(currentMyBlocks.map(b => b.blockId));
            const newBlocks = apiMyBlocks.filter(apiBlock => !currentBlockIds.has(apiBlock.blockId));

            if (newBlocks.length > 0) {
                setMyBlocks([...currentMyBlocks, ...newBlocks]);
            } else if (currentMyBlocks.length === 0 && apiMyBlocks.length > 0) {
                // 초기화 케이스
                setMyBlocks(apiMyBlocks);
            }

            // 남의 블록 API 최신 데이터로 갱신
            // 내 블록과 겹치지 않게 필터링 (최신 mergedMyBlocks 기준)
            const updatedStatement = useWalkStore.getState();
            const finalMyBlockIds = new Set(updatedStatement.myBlocks.map(b => b.blockId));

            const filteredOthersBlocks = apiOthersBlocks.filter(b => !finalMyBlockIds.has(b.blockId));
            setOthersBlocks(filteredOthersBlocks);
        }
    }, [nearbyBlocks, dogId, walkMode]);
};
