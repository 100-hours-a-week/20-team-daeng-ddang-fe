import { useEffect, useRef, memo } from "react";
import { BlockData } from "@/entities/walk/model/types";
import { calculateBlockCoordinates } from "@/entities/walk/lib/blockUtils";

import { NaverMap, NaverPolygon } from "@/types/naver-maps";

import { BLOCK_SIZE_DEGREES } from "@/entities/walk/model/constants";

interface BlockPolygonProps {
    map: NaverMap | null;
    block: BlockData;
    isMine?: boolean;
    blockSize?: number;
}

export const BlockPolygon = memo(({ map, block, isMine = false, blockSize = BLOCK_SIZE_DEGREES }: BlockPolygonProps) => {
    const polygonRef = useRef<NaverPolygon | null>(null);

    useEffect(() => {
        if (!map || !window.naver) return;

        const { naver } = window;

        const coordinates = calculateBlockCoordinates(block.blockId, blockSize);
        if (!coordinates) return;

        const path = coordinates.map(coord => new naver.maps.LatLng(coord.lat, coord.lng));

        const fillColor = isMine ? "rgba(0, 200, 0, 0.45)" : "rgba(255, 0, 0, 0.45)";
        const strokeColor = isMine ? "rgba(0, 150, 0, 0.8)" : "rgba(200, 0, 0, 0.8)";

        if (!polygonRef.current) {
            polygonRef.current = new naver.maps.Polygon({
                map: map,
                paths: path,
                fillColor: fillColor,
                fillOpacity: 0.45,
                strokeColor: strokeColor,
                strokeOpacity: 0.8,
                strokeWeight: 1,
                clickable: false,
            });
        } else {
            polygonRef.current.setPaths(path);
            polygonRef.current.setOptions({
                fillColor: fillColor,
                strokeColor: strokeColor,
            });
        }

        return () => {
            if (polygonRef.current) {
                polygonRef.current.setMap(null);
                polygonRef.current = null;
            }
        };
    }, [map, block.blockId, isMine, blockSize]);

    return null;
});

BlockPolygon.displayName = "BlockPolygon";
