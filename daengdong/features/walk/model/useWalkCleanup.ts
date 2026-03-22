import { useEffect } from 'react';
import { useWalkStore } from '@/entities/walk/model/walkStore';

export const useWalkCleanup = () => {
    const { walkMode, walkId, currentPos, elapsedTime, distance } = useWalkStore();

    useEffect(() => {
        if (walkMode !== 'walking' || !walkId || !currentPos) return;

        const handleBeforeUnload = () => {
            const finalDistance = Number(distance.toFixed(4));

            const data = JSON.stringify({
                walkId,
                endLat: currentPos.lat,
                endLng: currentPos.lng,
                totalDistanceKm: finalDistance,
                durationSeconds: elapsedTime,
                status: "FINISHED",
                isValidated: false,
            });

            fetch(`/bff/proxy/walks/${walkId}/end`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: data,
                credentials: 'include',
                keepalive: true, 
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
