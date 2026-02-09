"use client";

import styled from "@emotion/styled";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BlockData, LatLng } from "@/entities/walk/model/types";
import { calculateBlockCoordinates } from "@/entities/walk/lib/blockUtils";
import { BLOCK_SIZE_DEGREES } from "@/entities/walk/model/constants";
import { useWalkStore } from "@/entities/walk/model/walkStore";

const SNAPSHOT_SIZE = 600;
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
    const zoom = Math.floor(Math.min(zoomX, zoomY)) - 1;

    return Math.max(3, Math.min(19, zoom));
};

// Naver Maps 좌표 변환 
const latLngToPixel = (lat: number, lng: number, center: LatLng, zoom: number) => {
    // Naver Maps Static API 공식 스케일
    // Level 20: 1픽셀 = 0.0745m 
    // Level n: 1픽셀 = 0.0745 * 2^(20-n) 미터
    const METERS_PER_PIXEL_AT_LEVEL_20 = 0.0745;
    const metersPerPixel = METERS_PER_PIXEL_AT_LEVEL_20 * Math.pow(2, 20 - zoom);

    // 위도/경도를 미터로 변환
    // 위도 1도 ≈ 111,000m (지구 둘레 / 360)
    // 경도 1도 ≈ 111,000m * cos(latitude)
    const METERS_PER_DEGREE_LAT = 111000;
    const metersPerDegreeLng = METERS_PER_DEGREE_LAT * Math.cos((center.lat * Math.PI) / 180);

    // 중심점으로부터의 거리 (미터)
    const deltaLat = lat - center.lat;
    const deltaLng = lng - center.lng;
    const metersY = deltaLat * METERS_PER_DEGREE_LAT;
    const metersX = deltaLng * metersPerDegreeLng;

    // 미터를 픽셀로 변환
    const x = (metersX / metersPerPixel) + SNAPSHOT_SIZE / 2;
    const y = -(metersY / metersPerPixel) + SNAPSHOT_SIZE / 2;

    return { x, y };
};

declare global {
    interface Window {
        getWalkSnapshotBlob?: () => Promise<Blob | null>;
        isWalkSnapshotReady?: boolean;
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
    const { isEnding } = useWalkStore();

    const blocks = useMemo(() => [...myBlocks, ...othersBlocks], [myBlocks, othersBlocks]);
    const bounds = useMemo(() => getBounds(path, blocks, currentPos), [path, blocks, currentPos]);

    // 지도 흔들림 방지: 중심좌표 반올림 (약 10m 단위)
    const center = useMemo(
        () => ({
            lat: Math.round(((bounds.minLat + bounds.maxLat) / 2) * 10000) / 10000,
            lng: Math.round(((bounds.minLng + bounds.maxLng) / 2) * 10000) / 10000,
        }),
        [bounds]
    );
    const zoom = useMemo(() => getZoomLevel(bounds), [bounds]);

    const staticMapUrl = useMemo(() => {
        if (!isEnding) return "";

        const centerParam = `${center.lng},${center.lat}`;
        const params = new URLSearchParams({
            w: String(SNAPSHOT_SIZE),
            h: String(SNAPSHOT_SIZE),
            center: centerParam,
            level: String(zoom),
            format: "png",
        });

        return `/map-proxy/static-map?${params.toString()}`;
    }, [center, zoom, isEnding]);

    useEffect(() => {
        if (!containerRef.current) return;
        containerRef.current.setAttribute("data-ready", isReady ? "true" : "false");
        // Only set data-map-url if it exists
        if (staticMapUrl) {
            containerRef.current.setAttribute("data-map-url", staticMapUrl);
        }
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

        // 지도 배경 그리기
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
            // 에러 시 회색 배경
            ctx.fillStyle = "#f0f0f0";
            ctx.fillRect(0, 0, SNAPSHOT_SIZE, SNAPSHOT_SIZE);
            ctx.fillStyle = "#999";
            ctx.font = "24px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("지도 이미지를 불러올 수 없습니다", SNAPSHOT_SIZE / 2, SNAPSHOT_SIZE / 2);
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

    // URL 변경 시 이미지 로딩
    useEffect(() => {
        if (!staticMapUrl) return;

        // 타임아웃 타이머
        const timeoutId = setTimeout(() => {
            console.warn("[WalkSnapshotRenderer] 이미지 로드 타임아웃");
            setImageStatus("error");
        }, 8000); // 8초 타임아웃

        setTimeout(() => {
            setIsReady(false);
            setImageStatus("loading");
        }, 0);

        const img = new Image();
        img.crossOrigin = "anonymous"; // CORS 설정 추가
        img.onload = () => {
            clearTimeout(timeoutId);
            // 이미지가 현재 URL과 일치하는지 확인
            if (img.src.includes(staticMapUrl)) {
                imageRef.current = img;
                setImageStatus("loaded");
            }
        };
        img.onerror = () => {
            clearTimeout(timeoutId);
            setImageStatus("error");
        };
        img.src = staticMapUrl;

        return () => {
            clearTimeout(timeoutId);
            imageRef.current = null;
        };
    }, [staticMapUrl]);

    // 이미지 상태가 변경되거나, 경로/블록 데이터가 변경 시 캔버스 다시 그리기
    useEffect(() => {
        if (imageStatus === "loading") return;

        const success = drawSnapshot();

        setTimeout(() => {
            setIsReady(success);
        }, 0);
    }, [imageStatus, drawSnapshot]);

    useEffect(() => {
        // 준비 상태를 window에 노출하여 외부에서 폴링 가능하도록 함
        window.isWalkSnapshotReady = isReady;

        window.getWalkSnapshotBlob = async () => {
            // 준비되지 않았으면 즉시 null 반환 (외부에서 폴링으로 대기하므로)
            if (!canvasRef.current || !isReady) {
                return null;
            }

            return new Promise<Blob | null>((resolve) => {
                canvasRef.current?.toBlob((blob) => {
                    if (blob && blob.size > 0) {
                        resolve(blob);
                    } else {
                        resolve(null);
                    }
                }, "image/png");
            });
        };

        return () => {
            window.getWalkSnapshotBlob = undefined;
            window.isWalkSnapshotReady = false;
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
