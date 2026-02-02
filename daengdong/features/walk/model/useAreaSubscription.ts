import { useRef, useEffect } from "react";
import { IWalkWebSocketClient } from "@/shared/lib/websocket/types";

import { BLOCK_SIZE_DEGREES, AREA_BLOCK_COUNT } from "@/entities/walk/model/constants";

export const useAreaSubscription = (
    currentPos: { lat: number; lng: number } | null,
    wsClient: IWalkWebSocketClient | null
) => {
    const subscribedAreaKeyRef = useRef<string | null>(null);

    useEffect(() => {
        if (!currentPos || !wsClient || !wsClient.getConnectionStatus()) return;

        const { lat, lng } = currentPos;

        // 좌표를 블록과 영역으로 변환
        const blockX = Math.floor(lat / BLOCK_SIZE_DEGREES);
        const blockY = Math.floor(lng / BLOCK_SIZE_DEGREES);
        const areaX = Math.floor(blockX / AREA_BLOCK_COUNT);
        const areaY = Math.floor(blockY / AREA_BLOCK_COUNT);

        const newAreaKey = `${areaX}_${areaY}`;

        if (subscribedAreaKeyRef.current !== newAreaKey) {
            // 영역 변경 감지: 구독 해제 -> 구독
            if (subscribedAreaKeyRef.current) {

                wsClient.unsubscribeFromArea();
            }

            wsClient.subscribeToArea(newAreaKey);
            subscribedAreaKeyRef.current = newAreaKey;
        }

    }, [currentPos, wsClient]);

    // 컴포넌트 언마운트 또는 연결 손실 시 구독 해제
    useEffect(() => {
        return () => {
            if (subscribedAreaKeyRef.current && wsClient) {

                wsClient.unsubscribeFromArea();
                subscribedAreaKeyRef.current = null;
            }
        };
    }, [wsClient]);
};
