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
             * 동기화 전략:
             * - idle 모드: 서버 데이터 신뢰
             * - walking 모드: 낙관적 업데이트 (병합 전략)
             */
            if (walkMode === 'idle') {
                setMyBlocks(apiMyBlocks);
                setOthersBlocks(apiOthersBlocks);
            } else {
                const currentBlockIds = new Set(currentMyBlocks.map(b => b.blockId));
                const newBlocks = apiMyBlocks.filter(apiBlock => !currentBlockIds.has(apiBlock.blockId));

                if (newBlocks.length > 0) {
                    setMyBlocks([...currentMyBlocks, ...newBlocks]);
                } else if (currentMyBlocks.length === 0 && apiMyBlocks.length > 0) {
                    // 초기화 케이스
                    setMyBlocks(apiMyBlocks);
                }

                const updatedStatement = useWalkStore.getState();
                const finalMyBlockIds = new Set(updatedStatement.myBlocks.map(b => b.blockId));

                const filteredOthersBlocks = apiOthersBlocks.filter(b => !finalMyBlockIds.has(b.blockId));
                setOthersBlocks(filteredOthersBlocks);
            }
        }
    }, [nearbyBlocks, dogId, walkMode]);
};
