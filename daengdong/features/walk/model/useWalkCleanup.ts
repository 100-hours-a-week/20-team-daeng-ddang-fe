import { useEffect } from 'react';
import { useWalkStore } from '@/entities/walk/model/walkStore';

/**
 * 산책 중 탭 닫기 시 자동으로 산책을 종료하는 훅
 * beforeunload 이벤트를 사용하여 브라우저가 닫힐 때 산책 종료 API를 호출합니다.
 */
export const useWalkCleanup = () => {
    const { walkMode, walkId, currentPos, elapsedTime, distance } = useWalkStore();

    useEffect(() => {
        if (walkMode !== 'walking' || !walkId || !currentPos) return;

        const handleBeforeUnload = () => {
            const finalDistance = Number(distance.toFixed(4));

            // sendBeacon을 사용하여 페이지가 닫혀도 요청이 전송되도록 보장
            const data = JSON.stringify({
                walkId,
                endLat: currentPos.lat,
                endLng: currentPos.lng,
                totalDistanceKm: finalDistance,
                durationSeconds: elapsedTime,
                status: "FINISHED",
                isValidated: false,
            });

            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
            const token = localStorage.getItem('accessToken');

            // sendBeacon은 헤더를 설정할 수 없으므로, 
            // 백엔드에서 쿠키 기반 인증을 지원하거나, URL에 토큰을 포함해야 할 수 있습니다.
            // 현재는 일반 fetch로 구현하되, keepalive 옵션 사용
            fetch(`${baseUrl}/api/walks/${walkId}/end`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                },
                body: data,
                keepalive: true, // 페이지가 닫혀도 요청 완료 보장
            }).catch(err => {
                console.error('[Walk Cleanup] Failed to end walk on unload:', err);
            });
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [walkMode, walkId, currentPos, elapsedTime, distance]);
};
