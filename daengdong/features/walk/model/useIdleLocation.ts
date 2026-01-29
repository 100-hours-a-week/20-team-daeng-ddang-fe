import { useEffect } from 'react';
import { useWalkStore } from '@/entities/walk/model/walkStore';

export const useIdleLocation = () => {
    const { walkMode, setCurrentPos } = useWalkStore();

    useEffect(() => {
        if (!('geolocation' in navigator)) {
            alert('이 브라우저에서는 위치 정보가 지원되지 않습니다.');
            return;
        }

        let watchId: number | undefined;

        // 산책 모드 아닌 경우에만 위치 추적 (지도의 현위치 표시용)
        if (walkMode === 'idle') {
            const applyPosition = (pos: GeolocationPosition) => {
                const newPos = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                };
                setCurrentPos(newPos);
            };

            const handleError = (err: GeolocationPositionError) => {
                console.error('위치 정보 오류:', err.code, err.message, err);

                // 위치 업데이트 불가(code 2)일 때는 저정확도/짧은 타임아웃으로 1회 재시도
                if (err.code === 2) {
                    navigator.geolocation.getCurrentPosition(
                        applyPosition,
                        (retryErr) => {
                            console.error(
                                '위치 재시도 실패:',
                                retryErr.code,
                                retryErr.message,
                                retryErr
                            );
                        },
                        {
                            enableHighAccuracy: false,
                            timeout: 5000,
                            maximumAge: 10000,
                        }
                    );
                }
            };

            watchId = navigator.geolocation.watchPosition(
                applyPosition,
                handleError,
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
            );
        }

        return () => {
            if (watchId !== undefined) {
                navigator.geolocation.clearWatch(watchId);
            }
        };
    }, [walkMode, setCurrentPos]);
};
