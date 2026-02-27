export const formatDistance = (meters: number, decimals: number = 1): string => {
    const km = meters / 1000;
    return km.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
};
