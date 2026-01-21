export const calculateBlockCoordinates = (blockId: string, blockSize: number = 80) => {
    const parts = blockId.split("_");
    if (parts.length !== 3) return null;

    const tlLat = parseFloat(parts[1]);
    const tlLng = parseFloat(parts[2]);

    if (isNaN(tlLat) || isNaN(tlLng)) return null;

    const sizeKm = blockSize / 1000;
    const latDelta = sizeKm / 111;
    const lngDelta = sizeKm / (111 * Math.cos(tlLat * (Math.PI / 180)));

    const coordinates = [
        { lat: tlLat, lng: tlLng }, // Top-Left
        { lat: tlLat, lng: tlLng + lngDelta }, // Top-Right
        { lat: tlLat - latDelta, lng: tlLng + lngDelta }, // Bottom-Right
        { lat: tlLat - latDelta, lng: tlLng }, // Bottom-Left
    ];

    return coordinates;
};
