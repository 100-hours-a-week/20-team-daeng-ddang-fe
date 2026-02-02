export const MAX_SPEED_KMH = 30;

/**
 * 총 거리와 시간을 기반으로 속도를 계산하여 비정상 여부를 감지
 * @param totalDistanceKm 총 거리 (km)
 * @param durationSeconds 총 시간 (초)
 * @returns 속도가 MAX_SPEED_KMH를 초과하면 true, 그렇지 않으면 false
 */
export const isAbnormalSpeed = (
    totalDistanceKm: number,
    durationSeconds: number
): boolean => {
    if (totalDistanceKm <= 0) return false;
    if (durationSeconds <= 0) return true;

    const hours = durationSeconds / 3600;
    const speedKmh = totalDistanceKm / hours;

    return speedKmh > MAX_SPEED_KMH;
};
