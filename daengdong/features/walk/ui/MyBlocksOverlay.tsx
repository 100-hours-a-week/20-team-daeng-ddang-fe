import { BlockData } from "@/entities/walk/model/types";
import { BlockPolygon } from "./BlockPolygon";
import { NaverMap } from "@/types/naver-maps";

interface MyBlocksOverlayProps {
    map: NaverMap | null;
    myBlocks: BlockData[];
    blockSize?: number;
}

export const MyBlocksOverlay = ({ map, myBlocks, blockSize = 80 }: MyBlocksOverlayProps) => {
    if (!map) return null;

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
