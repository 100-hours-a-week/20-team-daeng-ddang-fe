import { BLOCK_SIZE_DEGREES } from "@/entities/walk/model/constants";

export const calculateBlockCoordinates = (blockId: string, blockSize: number = BLOCK_SIZE_DEGREES) => {
    const parts = blockId.split("_");
    if (parts.length !== 3) return null;

    const blLat = parseFloat(parts[1]);
    const blLng = parseFloat(parts[2]);

    if (isNaN(blLat) || isNaN(blLng)) return null;

    // Use degrees directly for perfect tiling
    const latDelta = blockSize;
    const lngDelta = blockSize;

    const coordinates = [
        { lat: blLat + latDelta, lng: blLng }, // Top-Left
        { lat: blLat + latDelta, lng: blLng + lngDelta }, // Top-Right
        { lat: blLat, lng: blLng + lngDelta }, // Bottom-Right
        { lat: blLat, lng: blLng }, // Bottom-Left
    ];

    return coordinates;
};
