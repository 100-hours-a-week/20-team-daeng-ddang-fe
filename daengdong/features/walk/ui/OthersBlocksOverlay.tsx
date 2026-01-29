import { BlockData } from "@/entities/walk/model/types";
import { BlockPolygon } from "./BlockPolygon";

import { NaverMap } from "@/types/naver-maps";

import { BLOCK_SIZE_DEGREES } from "@/entities/walk/model/constants";

interface OthersBlocksOverlayProps {
    map: NaverMap | null;
    othersBlocks: BlockData[];
    blockSize?: number;
}

export const OthersBlocksOverlay = ({ map, othersBlocks, blockSize = BLOCK_SIZE_DEGREES }: OthersBlocksOverlayProps) => {
    return (
        <>
            {othersBlocks.map((block) => (
                <BlockPolygon
                    key={block.blockId}
                    map={map}
                    block={block}
                    isMine={false}
                    blockSize={blockSize}
                />
            ))}
        </>
    );
};
