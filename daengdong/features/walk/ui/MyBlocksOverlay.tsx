import { BlockData } from "@/entities/walk/model/types";
import { BlockPolygon } from "./BlockPolygon";

import { NaverMap } from "@/types/naver-maps";

import { BLOCK_SIZE_METERS } from "@/entities/walk/model/constants";

interface MyBlocksOverlayProps {
    map: NaverMap | null;
    myBlocks: BlockData[];
    blockSize?: number;
}

export const MyBlocksOverlay = ({ map, myBlocks, blockSize = BLOCK_SIZE_METERS }: MyBlocksOverlayProps) => {
    return (
        <>
            {myBlocks.map((block) => (
                <BlockPolygon
                    key={block.blockId}
                    map={map}
                    block={block}
                    isMine={true}
                    blockSize={blockSize}
                />
            ))}
        </>
    );
};
