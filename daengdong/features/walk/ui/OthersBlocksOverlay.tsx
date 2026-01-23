import { BlockData } from "@/entities/walk/model/types";
import { BlockPolygon } from "./BlockPolygon";

interface OthersBlocksOverlayProps {
    map: any;
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
