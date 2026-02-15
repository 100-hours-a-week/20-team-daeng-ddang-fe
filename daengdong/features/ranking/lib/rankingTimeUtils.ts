export const getTimeUntilMidnight = () => {
    const now = new Date();
    const midnight = new Date();
    midnight.setDate(now.getDate() + 1);
    midnight.setHours(0, 0, 0, 0);
    return midnight.getTime() - now.getTime();
};

export const getRankingStaleTime = () => {
    const now = new Date();
    const isJustAfterMidnight = now.getHours() === 0 && now.getMinutes() < 5;

    // 00:00 ~ 00:05 1분 캐싱
    if (isJustAfterMidnight) {
        return 60_000;
    }

    return getTimeUntilMidnight();
};
