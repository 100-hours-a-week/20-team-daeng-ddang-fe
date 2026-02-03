import { WalkRepository } from "./types";

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

export const walkRepositoryMock: WalkRepository = {
    getNearbyBlocks: async (params) => {
        console.log("[MOCK] getNearbyBlocks", params);
        await new Promise(resolve => setTimeout(resolve, 500));

        return generateMockBlocks(params.lat, params.lng);
    },
    getMyBlocks: async (lat, lng) => {
        console.log("[MOCK] getMyBlocks", { lat, lng });
        await new Promise(resolve => setTimeout(resolve, 300));

        return generateMockBlocks(lat, lng).filter(b => b.dogId === 1);
    },
    judgeWalkMissions: async (walkId) => {
        console.log("[MOCK] judgeWalkMissions", { walkId });
        await new Promise((resolve) => setTimeout(resolve, 1000));

        return {
            analysisId: "mock-analysis-123",
            walkId,
            analyzedAt: new Date().toISOString(),
            missions: [
                { missionId: 1, missionTitle: "돌아 수행 영상", success: true },
                { missionId: 2, missionTitle: "앉아 수행 영상", success: false },
            ],
        };
    },
    startWalk: async (req) => {
        console.log("[MOCK] startWalk", req);
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
            walkId: Math.floor(Math.random() * 1000),
            startedAt: new Date().toISOString(),
        };
    },
    endWalk: async (req) => {
        console.log("[MOCK] endWalk", req);
        await new Promise(resolve => setTimeout(resolve, 800));
        return {
            walkId: req.walkId,
            startedAt: new Date().toISOString(),
            endedAt: new Date().toISOString(),
            totalDistanceKm: req.totalDistanceKm,
            durationSeconds: req.durationSeconds,
            occupiedBlockCount: 0,
            status: "FINISHED",
        };
    },
    postWalkDiary: async (req) => {
        console.log("[MOCK] postWalkDiary", req);
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
            message: "산책일지가 작성되었습니다.",
            data: {
                walkDiaryId: 10,
                walkId: req.walkId,
                createdAt: new Date().toISOString(),
            },
            errorCode: null,
        };
    },
};
