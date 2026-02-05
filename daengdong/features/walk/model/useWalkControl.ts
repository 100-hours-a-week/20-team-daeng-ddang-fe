import { useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useWalkStore } from "@/entities/walk/model/walkStore";
import { BlockData } from "@/entities/walk/model/types";
import { useModalStore } from "@/shared/stores/useModalStore";
import { useLoadingStore } from "@/shared/stores/useLoadingStore";
import { useToastStore } from "@/shared/stores/useToastStore";
import { useStartWalk, useEndWalk } from "@/features/walk/model/useWalkMutations";
import fileApi from "@/shared/api/file";
import { useUserQuery } from "@/entities/user/model/useUserQuery";
import { WalkWebSocketClient } from "@/shared/lib/websocket/WalkWebSocketClient";
import { IWalkWebSocketClient, ServerMessage } from "@/shared/lib/websocket/types";


import { useAreaSubscription } from "@/features/walk/model/useAreaSubscription";
import { isAbnormalSpeed } from "@/shared/utils/walkMetricsValidator";

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
        removeMyBlock,
        updateOthersBlock,
        occupyBlock
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


        switch (message.type) {
            case "BLOCK_OCCUPIED":
                if (message.data.dogId === myDogId) {
                    occupyBlock({
                        blockId: message.data.blockId,
                        dogId: message.data.dogId,
                        occupiedAt: message.data.occupiedAt
                    });

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

                // 내 블록 병합 
                // 서버가 가진 건 무조건 추가하되, 이미 있는 건 유지 
                const { myBlocks: currentMyBlocks } = useWalkStore.getState();
                const mergedMyBlocks = [...currentMyBlocks];

                mine.forEach(serverBlock => {
                    if (!mergedMyBlocks.some(local => local.blockId === serverBlock.blockId)) {
                        mergedMyBlocks.push(serverBlock);
                    }
                });

                setMyBlocks(mergedMyBlocks);
                setOthersBlocks(others);
                break;
            case "BLOCK_TAKEN":
                const { blockId, previousDogId, newDogId, takenAt } = message.data;

                // 1. 내가 뺏은 경우
                if (newDogId === myDogId) {
                    occupyBlock({
                        blockId,
                        dogId: newDogId,
                        occupiedAt: takenAt
                    });

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
    }, [occupyBlock, updateOthersBlock, setMyBlocks, setOthersBlocks, removeMyBlock, showToast]);



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
        }, 5000);

        return () => {
            clearInterval(intervalId);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [walkMode]);

    // WebSocket 초기화
    useEffect(() => {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

        wsClientRef.current = new WalkWebSocketClient(
            baseUrl,
            handleWebSocketMessage,
            (error) => console.error("WebSocket Error:", error)
        );

        // 산책 중 새로고침/페이지 이동 후 복귀 시 자동 재연결
        const { walkMode, walkId } = useWalkStore.getState();
        if (walkMode === 'walking' && walkId) {
            const token = localStorage.getItem('accessToken') || undefined;
            wsClientRef.current.connect(walkId, token)
                .catch(err => console.error("[WebSocket] 자동 재연결 실패:", err));
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
                title: "반려견 등록이 필요해요",
                message: "반려견 정보를 등록하고 산책을 시작할까요?",
                type: "confirm",
                confirmText: "등록하기",
                cancelText: "나중에",
                onConfirm: () => {
                    router.push("/mypage/dog");
                },
            });
            return;
        }

        if (!currentPos) {
            openModal({
                title: "위치 정보 확인",
                message: "현재 위치를 확인할 수 없습니다.\n 위치 권한이 허용되어 있는지 확인하거나, \n 실외로 이동 후 다시 시도해주세요.",
                type: "alert",
                confirmText: "확인"
            });
            return;
        }

        // 중복 요청 방지
        if (isStarting) {
            console.warn('[산책 시작] 이미 요청 진행 중');
            return;
        }

        showLoading("산책을 시작하는 중입니다...");

        try {
            const res = await startWalkMutate({
                startLat: currentPos.lat,
                startLng: currentPos.lng
            });

            startWalk(res.walkId);

            // WebSocket 연결
            try {
                const token = localStorage.getItem('accessToken') || undefined;
                await wsClientRef.current?.connect(res.walkId, token);
            } catch (e) {
                console.error("[산책 시작] WebSocket 연결 실패:", e);
            }

            hideLoading();
        } catch (error) {
            console.error('[산책 시작] 실패:', error);
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

    // ... existing imports ...

    const handleCancel = () => {
        openModal({
            title: "산책 취소",
            message: "산책을 취소하시겠습니까?",
            type: "confirm",
            confirmText: "취소하기",
            cancelText: "계속 산책하기",
            onConfirm: () => {
                // 비정상 속도 체크
                const isAbnormal = isAbnormalSpeed(distance, elapsedTime);
                if (isAbnormal) {
                    showToast({
                        message: "비정상적인 이동 속도가 감지되어 이동 거리 및 점유 블록이 저장되지 않습니다.",
                        type: "error"
                    });
                }

                const finalDistance = isAbnormal ? 0 : Number(distance.toFixed(4));

                if (walkId && currentPos) {
                    endWalkMutate(
                        {
                            walkId: walkId,
                            endLat: currentPos.lat,
                            endLng: currentPos.lng,
                            totalDistanceKm: finalDistance,
                            durationSeconds: elapsedTime,
                            status: "FINISHED",
                            isValidated: isAbnormal,
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
                // 비정상 속도 체크
                const isAbnormal = isAbnormalSpeed(distance, elapsedTime);
                const finalDistance = isAbnormal ? 0 : Number(distance.toFixed(4));

                if (isAbnormal) {
                    showToast({
                        message: "비정상적인 이동 속도가 감지되어 이동 거리가 0으로 저장됩니다.",
                        type: "error"
                    });
                }

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

                    // 준비 상태 대기 (최대 10초)
                    const isReady = await waitForSnapshotReady(10000);

                    if (!isReady) {
                        console.warn("[Snapshot] 대기 후에도 스냅샷이 준비되지 않음");
                    } else if (!window.getWalkSnapshotBlob) {
                        console.error("[Snapshot] getWalkSnapshotBlob 함수가 정의되지 않음");
                    } else {
                        // 스냅샷 생성 시도
                        const blob = await window.getWalkSnapshotBlob();

                        if (blob && blob.size > 0) {
                            // 결과 페이지에서 이미지가 즉시 보이도록 Base64로 변환하여 저장
                            const base64Url = await new Promise<string>((resolve) => {
                                const reader = new FileReader();
                                reader.onloadend = () => resolve(reader.result as string);
                                reader.readAsDataURL(blob);
                            });
                            storedImageUrl = base64Url;

                            try {
                                const { presignedUrl } = await fileApi.getPresignedUrl("IMAGE", "image/png", "WALK");
                                await fileApi.uploadFile(presignedUrl, blob, "image/png");
                            } catch (e) {
                                console.error("[Snapshot] S3 업로드 실패:", e);
                            }
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
                        totalDistanceKm: finalDistance,

                        durationSeconds: elapsedTime,
                        status: "FINISHED",
                        isValidated: isAbnormal,
                    },
                    {
                        onSuccess: () => {
                            wsClientRef.current?.disconnect();
                            setWalkResult({
                                time: elapsedTime,
                                distance: finalDistance,
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

    const sendLocation = useCallback((lat: number, lng: number) => {
        if (wsClientRef.current?.getConnectionStatus()) {
            wsClientRef.current.sendLocation(lat, lng);
        }
    }, []);

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
