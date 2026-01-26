import { useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useWalkStore } from "@/entities/walk/model/walkStore";
import { BlockData } from "@/entities/walk/model/types";
import { useModalStore } from "@/shared/stores/useModalStore";
import { useLoadingStore } from "@/shared/stores/useLoadingStore";
import { useStartWalk, useEndWalk } from "@/features/walk/model/useWalkMutations";
import { fileApi } from "@/shared/api/file";
import { useUserQuery } from "@/entities/user/model/useUserQuery";
import { WalkWebSocketClient } from "@/shared/lib/websocket/WalkWebSocketClient";
import { MockWalkWebSocketClient } from "@/shared/lib/websocket/MockWalkWebSocketClient";
import { IWalkWebSocketClient, ServerMessage } from "@/shared/lib/websocket/types";
import { ENV } from "@/shared/config/env";

export const useWalkControl = () => {
    const {
        setCurrentPos,
        addPathPoint,
        addDistance,
        walkMode,
        elapsedTime,
        distance,
        currentPos,
        walkId,
        startWalk,
        endWalk,
        reset,
        path,
        myBlocks,
        othersBlocks,
        setWalkResult,
        setMyBlocks,
        setOthersBlocks,
        addMyBlock,
        removeOthersBlock,
        updateOthersBlock
    } = useWalkStore();

    const { openModal } = useModalStore();
    const { showLoading, hideLoading } = useLoadingStore();
    const { mutate: startWalkMutate } = useStartWalk();
    const { mutate: endWalkMutate } = useEndWalk();
    const router = useRouter();
    const { data: user, isError } = useUserQuery();

    const wsClientRef = useRef<IWalkWebSocketClient | null>(null);
    const userRef = useRef(user);
    const currentPosRef = useRef(currentPos);
    const lastLatRef = useRef<number | undefined>(undefined);
    const lastLngRef = useRef<number | undefined>(undefined);

    // user 상태가 변경될 때마다 ref 업데이트
    useEffect(() => {
        userRef.current = user;
    }, [user]);

    // currentPos ref 업데이트
    useEffect(() => {
        currentPosRef.current = currentPos;
    }, [currentPos]);

    const handleWebSocketMessage = useCallback((message: ServerMessage) => {
        const currentUser = userRef.current;

        switch (message.type) {
            case "BLOCK_OCCUPIED":
                // 점유 성공
                if (message.data.dogId === currentUser?.dogId) {
                    addMyBlock({
                        blockId: message.data.blockId,
                        dogId: message.data.dogId,
                        occupiedAt: message.data.occupiedAt
                    });
                    // 남의 땅이었다면 제거 
                    removeOthersBlock(message.data.blockId);
                } else {
                    // 남이 점유 
                    updateOthersBlock({
                        blockId: message.data.blockId,
                        dogId: message.data.dogId,
                        occupiedAt: message.data.occupiedAt
                    });
                }
                break;
            case "BLOCKS_SYNC":
                if (!currentUser?.dogId) break;

                const allBlocks = message.data.blocks;
                const mine: BlockData[] = [];
                const others: BlockData[] = [];

                allBlocks.forEach((block) => {
                    if (block.dogId === currentUser.dogId) {
                        mine.push({
                            blockId: block.blockId,
                            dogId: block.dogId,
                            occupiedAt: new Date().toISOString()
                        });
                    } else {
                        others.push({
                            blockId: block.blockId,
                            dogId: block.dogId,
                            occupiedAt: new Date().toISOString()
                        });
                    }
                });

                setMyBlocks(mine);
                setOthersBlocks(others);
                break;
            // 필요한 경우 추가 메시지 처리
        }
    }, [addMyBlock, removeOthersBlock, updateOthersBlock, setMyBlocks, setOthersBlocks]);

    // 거리 계산 함수 (Haversine formula)
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    // 산책 중 위치 추적 및 전송
    useEffect(() => {
        if (walkMode !== 'walking') return;

        let watchId: number;

        // Initialize last known position for distance calculation
        lastLatRef.current = currentPos?.lat || undefined;
        lastLngRef.current = currentPos?.lng || undefined;

        // 1. 위치 추적 (상태 업데이트용)
        if ('geolocation' in navigator) {
            watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;

                    // 위치 업데이트
                    setCurrentPos({ lat: latitude, lng: longitude });

                    // 경로 추가
                    addPathPoint({ lat: latitude, lng: longitude });

                    // 거리 계산 및 업데이트
                    const currentLastLat = lastLatRef.current;
                    const currentLastLng = lastLngRef.current;

                    if (currentLastLat && currentLastLng) {
                        const dist = calculateDistance(currentLastLat, currentLastLng, latitude, longitude);
                        if (dist > 0.0005) {
                            addDistance(dist);
                        }
                    }

                    lastLatRef.current = latitude;
                    lastLngRef.current = longitude;
                },
                (error) => console.error("Location tracking error:", error),
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        }

        // 2. 주기적 전송 (점유 판정용, 3초마다)
        const intervalId = setInterval(() => {
            const current = currentPosRef.current;
            if (current && wsClientRef.current?.getConnectionStatus()) {
                wsClientRef.current.sendLocation(current.lat, current.lng);
            }
        }, 3000);

        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
            clearInterval(intervalId);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [walkMode]); // Dependency에 함수들을 넣으면 무한루프 가능성 있으므로 최소화, handleWebSocketMessage는 제외

    // WebSocket 초기화
    useEffect(() => {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

        if (ENV.USE_MOCK) {
            wsClientRef.current = new MockWalkWebSocketClient(
                handleWebSocketMessage,
                (error) => console.error("Mock WebSocket Error:", error)
            );
        } else {
            wsClientRef.current = new WalkWebSocketClient(
                baseUrl,
                handleWebSocketMessage,
                (error) => console.error("WebSocket Error:", error)
            );
        }

        return () => {
            wsClientRef.current?.disconnect();
        };
    }, [handleWebSocketMessage]);

    const handleStart = () => {
        if (!user || isError) {
            router.push("/login");
            return;
        }

        if (!currentPos) {
            alert("위치 정보를 불러오는 중입니다. 잠시만 기다려주세요.");
            return;
        }

        startWalkMutate(
            { startLat: currentPos.lat, startLng: currentPos.lng },
            {
                onSuccess: async (res) => {
                    startWalk(res.walkId);

                    // WebSocket 연결
                    try {
                        const token = localStorage.getItem('accessToken') || undefined;
                        await wsClientRef.current?.connect(res.walkId, token);
                        console.log("WebSocket 연결 성공:", res.walkId);
                    } catch (e) {
                        console.error("WebSocket 연결 실패:", e);
                    }
                },
                onError: () => {
                    alert("산책 시작에 실패했습니다.");
                }
            }
        );
    };

    const handleCancel = () => {
        openModal({
            title: "산책 취소",
            message: "산책을 취소하시겠습니까? 기록은 저장되지 않습니다.",
            type: "confirm",
            confirmText: "취소하기",
            cancelText: "계속 산책하기",
            onConfirm: () => {
                wsClientRef.current?.disconnect();
                reset();
            },
        });
    };

    const handleEnd = () => {
        if (!currentPos || !walkId) {
            if (!walkId) {
                endWalk();
                return;
            }
            return;
        }

        openModal({
            title: "산책 종료",
            message: "산책을 종료하시겠습니까? 기록이 저장됩니다.",
            type: "confirm",
            confirmText: "종료하기",
            cancelText: "계속 산책하기",
            onConfirm: async () => {
                showLoading("산책을 종료하고 스냅샷을 저장 중입니다...");

                let storedImageUrl = "";

                try {
                    const snapshotResponse = await fetch(`/api/snapshot?walkId=${walkId}`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            data: {
                                path,
                                myBlocks,
                                othersBlocks,
                            },
                        }),
                    });

                    if (!snapshotResponse.ok) {
                        throw new Error("스냅샷 생성에 실패했습니다.");
                    }

                    const blob = await snapshotResponse.blob();

                    if (blob) {
                        if (ENV.USE_MOCK) {
                            storedImageUrl = URL.createObjectURL(blob);
                        } else {
                            const { presignedUrl, objectKey } = await fileApi.getPresignedUrl("IMAGE", "image/png", "WALK");
                            await fileApi.uploadFile(presignedUrl, blob, "image/png");
                            storedImageUrl = objectKey;
                        }
                    }
                } catch (error) {
                    console.error("Snapshot creation/upload failed:", error);
                }

                // 산책 종료 API 호출
                endWalkMutate(
                    {
                        walkId: walkId,
                        endLat: currentPos.lat,
                        endLng: currentPos.lng,
                        totalDistanceKm: Number(distance.toFixed(4)),
                        durationSeconds: elapsedTime,
                        status: "FINISHED",
                    },
                    {
                        onSuccess: () => {
                            wsClientRef.current?.disconnect();
                            setWalkResult({
                                time: elapsedTime,
                                distance: distance,
                                imageUrl: storedImageUrl,
                            });

                            router.push(`/walk/complete/${walkId}`);
                            endWalk();
                            hideLoading();
                        },
                        onError: () => {
                            hideLoading();
                            alert("산책 종료 저장에 실패했습니다.");
                        }
                    }
                );
            },
        });
    };

    const sendLocation = (lat: number, lng: number) => {
        if (wsClientRef.current?.getConnectionStatus()) {
            wsClientRef.current.sendLocation(lat, lng);
        }
    };

    return {
        walkMode,
        elapsedTime,
        distance,
        handleStart,
        handleEnd,
        handleCancel,
        sendLocation,
        wsClient: wsClientRef.current
    };
};
