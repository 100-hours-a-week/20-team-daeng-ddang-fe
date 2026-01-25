import { BlockData } from "@/entities/walk/model/types";
import { BlockPolygon } from "./BlockPolygon";

import { NaverMap } from "@/types/naver-maps";

interface OthersBlocksOverlayProps {
    map: NaverMap | null;
    othersBlocks: BlockData[];
    blockSize?: number;
}

export const OthersBlocksOverlay = ({ map, othersBlocks, blockSize = 80 }: OthersBlocksOverlayProps) => {
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
