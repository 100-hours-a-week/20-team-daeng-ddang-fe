import { BlockData } from "@/entities/walk/model/types";
import { BlockPolygon } from "./BlockPolygon";

interface MyBlocksOverlayProps {
    map: any;
    myBlocks: BlockData[];
    blockSize?: number;
}

export const MyBlocksOverlay = ({ map, myBlocks, blockSize = 80 }: MyBlocksOverlayProps) => {
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
