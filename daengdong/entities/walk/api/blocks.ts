import { http } from "@/shared/api/http";
import { ApiResponse } from "@/shared/api/types";
import { BlockData } from "../model/types";

export interface BlocksResponse {
    blocks: BlockData[];
}

export interface NearbyBlocksParams {
    lat: number;
    lng: number;
    radius: number;
}

const BLOCK_SIZE_DEG = 0.00072;

const snapToBlock = (value: number) =>
    Math.floor(value / BLOCK_SIZE_DEG) * BLOCK_SIZE_DEG;

const buildBlockId = (lat: number, lng: number) =>
    `P_${lat.toFixed(6)}_${lng.toFixed(6)}`;

const generateMockBlocks = (lat: number, lng: number) => {
    const baseLat = snapToBlock(lat);
    const baseLng = snapToBlock(lng);
    const myDogId = 1;

    const lngStep = BLOCK_SIZE_DEG / Math.cos((baseLat * Math.PI) / 180);

    const points = [
        { lat: baseLat, lng: baseLng, dogId: myDogId, time: "14:00:00" },
        { lat: baseLat + BLOCK_SIZE_DEG, lng: baseLng, dogId: myDogId, time: "14:05:00" },
        { lat: baseLat, lng: baseLng + lngStep, dogId: myDogId, time: "14:10:00" },
        { lat: baseLat - BLOCK_SIZE_DEG, lng: baseLng, dogId: 9, time: "14:12:00" },
        { lat: baseLat, lng: baseLng - lngStep, dogId: 5, time: "14:15:00" },
    ];

    return points.map((point) => ({
        blockId: buildBlockId(point.lat, point.lng),
        dogId: point.dogId,
        occupiedAt: `2026-01-22T${point.time}+09:00`,
    }));
};

export const getNearbyBlocks = async (params: NearbyBlocksParams) => {
    // TODO: 실제 API 연동 시 주석 해제
    // const response = await http.get<ApiResponse<BlocksResponse>>("/api/v3/blocks", { params });
    // return response.data;

    // Mock response
    console.log("GET /api/v3/blocks", params);
    return {
        message: "주변 블록 조회에 성공했습니다.",
        data: {
            blocks: generateMockBlocks(params.lat, params.lng),
        },
        errorCode: null,
    };
};

export const getMyBlocks = async (lat: number, lng: number) => {
    // TODO: 실제 API 연동 시 주석 해제
    // const response = await http.get<ApiResponse<BlocksResponse>>(`/api/v3/walks/blocks`, {
    //     params: { lat, lng },
    // });
    // return response.data;

    // Mock response
    console.log("GET /api/v3/walks/blocks", { lat, lng });
    const blocks = generateMockBlocks(lat, lng).filter((block) => block.dogId === 1);
    return {
        message: "점유 블록 조회에 성공했습니다.",
        data: {
            blocks,
        },
        errorCode: null,
    };
};
