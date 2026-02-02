import { useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useWalkStore } from "@/entities/walk/model/walkStore";
import { BlockData } from "@/entities/walk/model/types";
import { useModalStore } from "@/shared/stores/useModalStore";
import { useLoadingStore } from "@/shared/stores/useLoadingStore";
import { useToastStore } from "@/shared/stores/useToastStore";
import { useStartWalk, useEndWalk } from "@/features/walk/model/useWalkMutations";
import { fileApi } from "@/shared/api/file";
import { useUserQuery } from "@/entities/user/model/useUserQuery";
import { WalkWebSocketClient } from "@/shared/lib/websocket/WalkWebSocketClient";
import { MockWalkWebSocketClient } from "@/shared/lib/websocket/MockWalkWebSocketClient";
import { IWalkWebSocketClient, ServerMessage } from "@/shared/lib/websocket/types";
import { ENV } from "@/shared/config/env";

import { useAreaSubscription } from "@/features/walk/model/useAreaSubscription";

export const useWalkControl = () => {
    const {
        walkMode,
        elapsedTime,
        distance,
        currentPos,
        walkId,
        startWalk,
        endWalk,
        reset,
        myBlocks,
        setWalkResult,
        setMyBlocks,
        setOthersBlocks,
        addMyBlock,
        removeMyBlock,
        removeOthersBlock,
        updateOthersBlock
    } = useWalkStore();

    const { openModal } = useModalStore();
    const { showLoading, hideLoading } = useLoadingStore();
    const { showToast } = useToastStore();
    const { mutateAsync: startWalkMutate, isPending: isStarting } = useStartWalk();
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
        const myDogId = currentUser?.dogId;

        console.log("DEBUG: handleWebSocketMessage received", message.type, message);

        switch (message.type) {
            case "BLOCK_OCCUPIED":
                if (message.data.dogId === myDogId) {
                    addMyBlock({
                        blockId: message.data.blockId,
                        dogId: message.data.dogId,
                        occupiedAt: message.data.occupiedAt
                    });
                    // 남의 땅이었다면 제거 
                    removeOthersBlock(message.data.blockId);

                    showToast({ message: "새로운 영역을 획득했어요! 🚩", type: "success" });
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
                if (!myDogId) break;

                const allBlocks = message.data.blocks;
                const mine: BlockData[] = [];
                const others: BlockData[] = [];

                allBlocks.forEach((block) => {
                    if (block.dogId === myDogId) {
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
            case "BLOCK_TAKEN":
                const { blockId, previousDogId, newDogId, takenAt } = message.data;

                // 1. 내가 뺏은 경우
                if (newDogId === myDogId) {
                    addMyBlock({
                        blockId,
                        dogId: newDogId,
                        occupiedAt: takenAt
                    });
                    removeOthersBlock(blockId);

                    showToast({ message: "다른 강아지의 블록을 점령했어요! ⚔️", type: "success" });
                }
                // 2. 내가 뺏긴 경우
                else if (previousDogId === myDogId) {
                    removeMyBlock(blockId);
                    // 뺏어간 사람 정보로 others에 추가
                    updateOthersBlock({
                        blockId,
                        dogId: newDogId,
                        occupiedAt: takenAt
                    });

                    showToast({ message: "내 영역을 빼앗겼어요... 🥲", type: "error" });
                }
                // 3. 남끼리 뺏고 뺏긴 경우
                else {
                    updateOthersBlock({
                        blockId,
                        dogId: newDogId,
                        occupiedAt: takenAt
                    });
                }
                break;
        }
    }, [addMyBlock, removeOthersBlock, updateOthersBlock, setMyBlocks, setOthersBlocks, removeMyBlock, showToast]);



    // 산책 중 위치 추적 및 전송
    useEffect(() => {
        if (walkMode !== 'walking') return;

        // 마지막 위치 저장
        lastLatRef.current = currentPos?.lat || undefined;
        lastLngRef.current = currentPos?.lng || undefined;


        // 주기적 전송
        const intervalId = setInterval(() => {
            const current = currentPosRef.current;
            if (current && wsClientRef.current?.getConnectionStatus()) {
                wsClientRef.current.sendLocation(current.lat, current.lng);
            }
        }, 7000);

        return () => {
            clearInterval(intervalId);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [walkMode]);

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

    const handleStart = async () => {
        if (!user || isError) {
            router.push("/login");
            return;
        }

        // 반려견 정보 미등록 체크
        if (!user.dogId) {
            openModal({
                title: "반려견 정보 필요",
                message: "산책을 시작하려면 반려견 정보를 먼저 등록해주세요.",
                type: "confirm",
                confirmText: "등록하러 가기",
                cancelText: "취소",
                onConfirm: () => {
                    router.push("/mypage/dog");
                },
            });
            return;
        }

        if (!currentPos) {
            showToast({
                message: "위치 정보를 불러오는 중입니다. 잠시만 기다려주세요.",
                type: "error"
            });
            return;
        }

        // 중복 요청 방지
        if (isStarting) {
            console.warn('[StartWalk] 이미 요청 진행 중');
            return;
        }

        showLoading("산책을 시작하는 중입니다...");
        console.log('[StartWalk] 요청 시작:', { lat: currentPos.lat, lng: currentPos.lng });

        try {
            const res = await startWalkMutate({
                startLat: currentPos.lat,
                startLng: currentPos.lng
            });

            console.log('[StartWalk] 성공:', res);
            startWalk(res.walkId);

            // WebSocket 연결
            try {
                const token = localStorage.getItem('accessToken') || undefined;
                await wsClientRef.current?.connect(res.walkId, token);
                console.log("[StartWalk] WebSocket 연결 성공:", res.walkId);
            } catch (e) {
                console.error("[StartWalk] WebSocket 연결 실패:", e);
            }

            hideLoading();
        } catch (error) {
            console.error('[StartWalk] 실패:', error);
            hideLoading();

            // Axios 에러 타입 체크
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 400) {
                    showToast({
                        message: '이미 진행 중인 산책이 있습니다.',
                        type: 'error'
                    });
                } else {
                    showToast({
                        message: '산책 시작에 실패했습니다. 다시 시도해주세요.',
                        type: 'error'
                    });
                }
            } else {
                showToast({
                    message: '산책 시작에 실패했습니다. 다시 시도해주세요.',
                    type: 'error'
                });
            }
        }
    };

    const handleCancel = () => {
        openModal({
            title: "산책 취소",
            message: "산책을 취소하시겠습니까?",
            type: "confirm",
            confirmText: "취소하기",
            cancelText: "계속 산책하기",
            onConfirm: () => {
                if (walkId && currentPos) {
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
                                reset();
                            },
                            onError: () => {
                                alert("산책 취소 처리에 실패했습니다.");
                                wsClientRef.current?.disconnect();
                                reset();
                            }
                        }
                    );
                } else {
                    // walkId가 없으면 로컬 리셋만 수행
                    wsClientRef.current?.disconnect();
                    reset();
                }
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

                useWalkStore.getState().setIsEnding(true);

                await new Promise(resolve => setTimeout(resolve, 1500));

                let storedImageUrl = "";

                try {
                    // 준비 상태 폴링 함수 (최대 5초 대기)
                    const waitForSnapshotReady = async (maxWaitMs: number = 5000): Promise<boolean> => {
                        const startTime = Date.now();

                        return new Promise((resolve) => {
                            const checkReady = () => {
                                if (window.isWalkSnapshotReady) {
                                    console.log(`[Snapshot] Ready after ${Date.now() - startTime}ms`);
                                    resolve(true);
                                    return;
                                }

                                if (Date.now() - startTime > maxWaitMs) {
                                    console.warn(`[Snapshot] Timeout after ${maxWaitMs}ms, ready state: ${window.isWalkSnapshotReady}`);
                                    resolve(false);
                                    return;
                                }

                                requestAnimationFrame(checkReady);
                            };

                            checkReady();
                        });
                    };

                    // 준비 상태 대기
                    const isReady = await waitForSnapshotReady(5000);

                    if (!isReady) {
                        console.warn("[Snapshot] 대기 후에도 스냅샷이 준비되지 않음");
                    } else if (!window.getWalkSnapshotBlob) {
                        console.error("[Snapshot] getWalkSnapshotBlob 함수가 정의되지 않음");
                    } else {
                        // 스냅샷 생성 시도
                        const blob = await window.getWalkSnapshotBlob();

                        if (blob && blob.size > 0) {
                            console.log("[Snapshot] 생성 성공, 크기:", blob.size);

                            // 결과 페이지에서 이미지가 즉시 보이도록 Base64로 변환하여 저장
                            const base64Url = await new Promise<string>((resolve) => {
                                const reader = new FileReader();
                                reader.onloadend = () => resolve(reader.result as string);
                                reader.readAsDataURL(blob);
                            });
                            storedImageUrl = base64Url;

                            try {
                                const { presignedUrl, objectKey } = await fileApi.getPresignedUrl("IMAGE", "image/png", "WALK");
                                await fileApi.uploadFile(presignedUrl, blob, "image/png");
                                console.log("[Snapshot] S3 업로드 성공:", objectKey);
                            } catch (e) {
                                console.error("[Snapshot] S3 업로드 실패:", e);
                            }
                        } else {
                            console.warn("[Snapshot] Blob이 null이거나 비어있음, blob:", blob);
                        }
                    }
                } catch (error) {
                    console.error("[Snapshot] 생성/업로드 실패:", error);
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
                                blockCount: myBlocks.length,
                            });
                            hideLoading();
                            openModal({
                                title: "반려견 표정 분석",
                                message: "산책 종료 시 반려견 표정 분석을 진행할까요?",
                                type: "confirm",
                                confirmText: "분석하기",
                                cancelText: "건너뛰기",
                                onConfirm: () => {
                                    router.push(`/walk/expression?walkId=${walkId}`);
                                    endWalk();
                                },
                                onCancel: () => {
                                    router.push(`/walk/complete/${walkId}`);
                                    endWalk();
                                },
                            });
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

    // Area 구독 관리 Hook
    useAreaSubscription(currentPos, wsClientRef.current);

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
