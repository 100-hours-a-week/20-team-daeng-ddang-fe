"use client";

import styled from "@emotion/styled";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BlockData, LatLng } from "@/entities/walk/model/types";
import { calculateBlockCoordinates } from "@/entities/walk/lib/blockUtils";
import { BLOCK_SIZE_DEGREES } from "@/entities/walk/model/constants";

const SNAPSHOT_SIZE = 1024;
const SNAPSHOT_PADDING = 40;
const DEFAULT_CENTER = { lat: 37.5665, lng: 126.9780 };

const projectLatLng = (lat: number, lng: number) => {
    const sinLat = Math.sin((lat * Math.PI) / 180);
    const x = (lng + 180) / 360;
    const y = 0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI);
    return { x, y };
};

const getBounds = (path: LatLng[], blocks: BlockData[], currentPos?: LatLng | null) => {
    const points: LatLng[] = [...path];

    // 현재 위치포함 (경로가 없더라도 내 위치 기준)
    if (currentPos) {
        points.push(currentPos);
    }

    blocks.forEach((block) => {
        const coords = calculateBlockCoordinates(block.blockId, BLOCK_SIZE_DEGREES);
        if (coords) {
            points.push(...coords);
        }
    });

    if (points.length === 0) {
        return {
            minLat: DEFAULT_CENTER.lat,
            maxLat: DEFAULT_CENTER.lat,
            minLng: DEFAULT_CENTER.lng,
            maxLng: DEFAULT_CENTER.lng,
        };
    }

    return points.reduce(
        (acc, point) => ({
            minLat: Math.min(acc.minLat, point.lat),
            maxLat: Math.max(acc.maxLat, point.lat),
            minLng: Math.min(acc.minLng, point.lng),
            maxLng: Math.max(acc.maxLng, point.lng),
        }),
        {
            minLat: points[0].lat,
            maxLat: points[0].lat,
            minLng: points[0].lng,
            maxLng: points[0].lng,
        }
    );
};

const getZoomLevel = (bounds: ReturnType<typeof getBounds>) => {
    const { minLat, maxLat, minLng, maxLng } = bounds;

    const minPoint = projectLatLng(minLat, minLng);
    const maxPoint = projectLatLng(maxLat, maxLng);
    const dx = Math.max(Math.abs(maxPoint.x - minPoint.x), 0.000001);
    const dy = Math.max(Math.abs(maxPoint.y - minPoint.y), 0.000001);
    const availableSize = SNAPSHOT_SIZE - SNAPSHOT_PADDING * 2;

    const zoomX = Math.log2(availableSize / (dx * 256));
    const zoomY = Math.log2(availableSize / (dy * 256));
    const zoom = Math.floor(Math.min(zoomX, zoomY)) - 3;

    return Math.max(3, Math.min(19, zoom));
};

const latLngToPixel = (lat: number, lng: number, center: LatLng, zoom: number) => {
    const worldSize = 256 * Math.pow(2, zoom);
    const point = projectLatLng(lat, lng);
    const centerPoint = projectLatLng(center.lat, center.lng);
    const x = (point.x - centerPoint.x) * worldSize + SNAPSHOT_SIZE / 2;
    const y = (point.y - centerPoint.y) * worldSize + SNAPSHOT_SIZE / 2;
    return { x, y };
};

declare global {
    interface Window {
        getWalkSnapshotBlob?: () => Promise<Blob | null>;
    }
}

interface WalkSnapshotRendererProps {
    path: LatLng[];
    myBlocks: BlockData[];
    othersBlocks: BlockData[];
    currentPos?: LatLng | null;
    id?: string;
}

export const WalkSnapshotRenderer = ({
    path,
    myBlocks,
    othersBlocks,
    currentPos,
    id = "walk-snapshot-capture",
}: WalkSnapshotRendererProps) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [imageStatus, setImageStatus] = useState<"loading" | "loaded" | "error">("loading");
    const [isReady, setIsReady] = useState(false);
    const imageRef = useRef<HTMLImageElement | null>(null);

    const blocks = useMemo(() => [...myBlocks, ...othersBlocks], [myBlocks, othersBlocks]);
    const bounds = useMemo(() => getBounds(path, blocks, currentPos), [path, blocks, currentPos]);
    const center = useMemo(
        () => ({
            lat: (bounds.minLat + bounds.maxLat) / 2,
            lng: (bounds.minLng + bounds.maxLng) / 2,
        }),
        [bounds]
    );
    const zoom = useMemo(() => getZoomLevel(bounds), [bounds]);

    const staticMapUrl = useMemo(() => {
        const centerParam = `${center.lng},${center.lat}`;
        const params = new URLSearchParams({
            w: String(SNAPSHOT_SIZE),
            h: String(SNAPSHOT_SIZE),
            center: centerParam,
            level: String(zoom),
            format: "png",
        });

        return `/api/static-map?${params.toString()}`;
    }, [center, zoom]);

    useEffect(() => {
        if (!containerRef.current) return;
        containerRef.current.setAttribute("data-ready", isReady ? "true" : "false");
        containerRef.current.setAttribute("data-map-url", staticMapUrl);
    }, [isReady, staticMapUrl]);

    const drawSnapshot = useCallback(() => {
        if (!canvasRef.current) return false;

        const canvas = canvasRef.current;
        canvas.width = SNAPSHOT_SIZE;
        canvas.height = SNAPSHOT_SIZE;

        const ctx = canvas.getContext("2d");
        if (!ctx) return false;

        ctx.clearRect(0, 0, SNAPSHOT_SIZE, SNAPSHOT_SIZE);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, SNAPSHOT_SIZE, SNAPSHOT_SIZE);
        if (
            imageStatus === "loaded" &&
            imageRef.current &&
            imageRef.current.complete &&
            imageRef.current.naturalWidth > 0
        ) {
            try {
                ctx.drawImage(imageRef.current, 0, 0, SNAPSHOT_SIZE, SNAPSHOT_SIZE);
            } catch (e) {
                console.error("Failed to draw map image", e);
            }
        } else if (imageStatus === "error") {
            // 지도 로드 실패 시 대체 텍스트/배경
            ctx.fillStyle = "#f5f5f5";
            ctx.fillRect(0, 0, SNAPSHOT_SIZE, SNAPSHOT_SIZE);
            ctx.fillStyle = "#ccc";
            ctx.font = "24px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("Map Image Unavailable", SNAPSHOT_SIZE / 2, SNAPSHOT_SIZE / 2);
        }

        const drawBlocks = (targetBlocks: BlockData[], fillStyle: string, strokeStyle: string) => {
            targetBlocks.forEach((block) => {
                const coords = calculateBlockCoordinates(block.blockId, BLOCK_SIZE_DEGREES);
                if (!coords) return;
                const pixels = coords.map((coord) => latLngToPixel(coord.lat, coord.lng, center, zoom));

                ctx.beginPath();
                pixels.forEach((pixel, index) => {
                    if (index === 0) ctx.moveTo(pixel.x, pixel.y);
                    else ctx.lineTo(pixel.x, pixel.y);
                });
                ctx.closePath();
                ctx.fillStyle = fillStyle;
                ctx.strokeStyle = strokeStyle;
                ctx.lineWidth = 1;
                ctx.fill();
                ctx.stroke();
            });
        };

        drawBlocks(myBlocks, "rgba(0, 200, 0, 0.45)", "rgba(0, 150, 0, 0.8)");
        drawBlocks(othersBlocks, "rgba(255, 0, 0, 0.45)", "rgba(200, 0, 0, 0.8)");

        if (path.length > 1) {
            ctx.beginPath();
            path.forEach((point, index) => {
                const pixel = latLngToPixel(point.lat, point.lng, center, zoom);
                if (index === 0) ctx.moveTo(pixel.x, pixel.y);
                else ctx.lineTo(pixel.x, pixel.y);
            });
            ctx.strokeStyle = "#FFB74D";
            ctx.lineWidth = 6;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.stroke();
        }

        if (path.length > 0) {
            const lastPoint = path[path.length - 1];
            const pixel = latLngToPixel(lastPoint.lat, lastPoint.lng, center, zoom);
            ctx.beginPath();
            ctx.arc(pixel.x, pixel.y, 14, 0, 2 * Math.PI);
            ctx.fillStyle = "#FFB74D";
            ctx.fill();
            ctx.lineWidth = 4;
            ctx.strokeStyle = "#ffffff";
            ctx.stroke();
        }

        return true;
    }, [path, myBlocks, othersBlocks, center, zoom, imageStatus]);

    useEffect(() => {
        const img = new Image();
        img.onload = () => {
            imageRef.current = img;
            setImageStatus("loaded");
        };
        img.onerror = () => {
            imageRef.current = img;
            setImageStatus("error");
        };
        img.src = staticMapUrl;

        return () => {
            imageRef.current = null;
        };
    }, [staticMapUrl]);

    useEffect(() => {
        if (imageStatus === "loading") return;
        // error 상태여도 그리기는 시도 (경로만이라도 그림)
        const success = drawSnapshot();

        // setTimeout을 사용하여 렌더링 사이클 이후에 상태 업데이트 (cascading render 방지)
        setTimeout(() => {
            setIsReady(success);
        }, 0);
    }, [imageStatus, drawSnapshot]);

    useEffect(() => {

        setTimeout(() => {
            setIsReady(false);
            setImageStatus("loading");
        }, 0);
    }, [path, myBlocks, othersBlocks, center, zoom]);

    useEffect(() => {
        window.getWalkSnapshotBlob = async () => {
            const start = Date.now();
            while (!isReady && Date.now() - start < 7000) {
                await new Promise((resolve) => setTimeout(resolve, 100));
            }
            if (!canvasRef.current || !isReady) return null;
            return new Promise<Blob | null>((resolve) => {
                canvasRef.current?.toBlob((blob) => resolve(blob), "image/png");
            });
        };

        return () => {
            window.getWalkSnapshotBlob = undefined;
        };
    }, [isReady]);

    return (
        <HiddenContainer ref={containerRef} id={id} aria-hidden="true">
            <OverlayCanvas ref={canvasRef} />
        </HiddenContainer>
    );
};

const HiddenContainer = styled.div`
    position: fixed;
    top: -10000px;
    left: -10000px;
    width: ${SNAPSHOT_SIZE}px;
    height: ${SNAPSHOT_SIZE}px;
    background: #ffffff;
    overflow: hidden;
`;

const OverlayCanvas = styled.canvas`
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
`;
