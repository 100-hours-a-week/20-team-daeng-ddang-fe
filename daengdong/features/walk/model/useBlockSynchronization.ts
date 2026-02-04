import { useEffect } from "react";
import { useWalkStore } from "@/entities/walk/model/walkStore";
import { BlockData } from "@/entities/walk/model/types";
import { UserInfo } from "@/entities/user/model/types";

export const useBlockSynchronization = (
    nearbyBlocks: BlockData[] | undefined,
    user: UserInfo | undefined
) => {
    const { walkMode } = useWalkStore();

    useEffect(() => {
        if (nearbyBlocks && user) {
            const myDogId = user.dogId;
            if (!myDogId) return;

            const { myBlocks: currentMyBlocks, setMyBlocks, setOthersBlocks } = useWalkStore.getState();

            const apiMyBlocks = nearbyBlocks.filter(b => b.dogId === myDogId);
            const apiOthersBlocks = nearbyBlocks.filter(b => b.dogId !== myDogId);

            /**
             * 내 블록 병합
             * - API는 지연될 수 있으므로 로컬 상태를 우선 보존
             * - API에 존재하지만 로컬에 없는 블록만 추가
             * - API에 없다고 해서 로컬 블록을 삭제하지 않음
             */
            const mergedMyBlocks = [...currentMyBlocks];
            let hasChanges = false;

            apiMyBlocks.forEach((apiBlock) => {
                if (!mergedMyBlocks.some((local) => local.blockId === apiBlock.blockId)) {
                    mergedMyBlocks.push(apiBlock);
                    hasChanges = true;
                }
            });

            if (hasChanges) {
                setMyBlocks(mergedMyBlocks);
            } else if (currentMyBlocks.length === 0 && apiMyBlocks.length > 0) {
                setMyBlocks(apiMyBlocks);
            }

            // 남의 블록 API 최신 데이터로 갱신
            const myBlockIds = new Set(mergedMyBlocks.map(b => b.blockId));
            const filteredOthersBlocks = apiOthersBlocks.filter(b => !myBlockIds.has(b.blockId));

            setOthersBlocks(filteredOthersBlocks);
        }
    }, [nearbyBlocks, user, walkMode]);
};
