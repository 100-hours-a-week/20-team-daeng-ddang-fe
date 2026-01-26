import { useRef, useEffect } from "react";
import { IWalkWebSocketClient } from "@/shared/lib/websocket/types";

const BLOCK_SIZE = 0.00072;
const AREA_SIZE = 7;

export const useAreaSubscription = (
    currentPos: { lat: number; lng: number } | null,
    wsClient: IWalkWebSocketClient | null
) => {
    const subscribedAreaKeyRef = useRef<string | null>(null);

    useEffect(() => {
        if (!currentPos || !wsClient || !wsClient.getConnectionStatus()) return;

        const { lat, lng } = currentPos;

        // Block & Area Calculation
        const blockX = Math.floor(lat / BLOCK_SIZE);
        const blockY = Math.floor(lng / BLOCK_SIZE);
        const areaX = Math.floor(blockX / AREA_SIZE);
        const areaY = Math.floor(blockY / AREA_SIZE);

        const newAreaKey = `${areaX}_${areaY}`;

        if (subscribedAreaKeyRef.current !== newAreaKey) {
            // Area Changed: Unsubscribe old -> Subscribe new
            if (subscribedAreaKeyRef.current) {
                console.log(`🔄 Area 변경 감지: ${subscribedAreaKeyRef.current} -> ${newAreaKey}`);
                wsClient.unsubscribeFromArea();
            }

            wsClient.subscribeToArea(newAreaKey);
            subscribedAreaKeyRef.current = newAreaKey;
        }

    }, [currentPos, wsClient]);

    // Cleanup on unmount or connection loss
    useEffect(() => {
        return () => {
            if (subscribedAreaKeyRef.current && wsClient) {
                console.log('🧹 컴포넌트 언마운트로 인한 Area 구독 해제');
                wsClient.unsubscribeFromArea();
                subscribedAreaKeyRef.current = null;
            }
        };
    }, [wsClient]);
};
