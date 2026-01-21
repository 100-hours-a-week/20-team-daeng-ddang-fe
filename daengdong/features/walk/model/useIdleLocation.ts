import { useEffect } from 'react';
import { useWalkStore } from '@/entities/walk/model/walkStore';

export const useIdleLocation = () => {
    const { walkMode, setCurrentPos } = useWalkStore();

    useEffect(() => {
        if (!('geolocation' in navigator)) {
            alert('이 브라우저에서는 위치 정보가 지원되지 않습니다.');
            return;
        }

        let watchId: number;

        // 산책 모드 아닌 경우에만 위치 추적 (지도의 현위치 표시용)
        if (walkMode === 'idle') {
            watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    const newPos = {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                    };
                    setCurrentPos(newPos);
                },
                (err) => console.error(err),
                { enableHighAccuracy: true }
            );
        }

        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
        };
    }, [walkMode, setCurrentPos]);
};
