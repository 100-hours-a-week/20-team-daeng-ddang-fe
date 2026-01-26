import { BLOCK_SIZE_METERS } from "@/entities/walk/model/constants";

export const calculateBlockCoordinates = (blockId: string, blockSize: number = BLOCK_SIZE_METERS) => {
    const parts = blockId.split("_");
    if (parts.length !== 3) return null;

    const blLat = parseFloat(parts[1]);
    const blLng = parseFloat(parts[2]);

    if (isNaN(blLat) || isNaN(blLng)) return null;

    const sizeKm = blockSize / 1000;
    const latDelta = sizeKm / 111;
    const lngDelta = sizeKm / (111 * Math.cos(blLat * (Math.PI / 180)));

    const coordinates = [
        { lat: blLat + latDelta, lng: blLng }, // Top-Left
        { lat: blLat + latDelta, lng: blLng + lngDelta }, // Top-Right
        { lat: blLat, lng: blLng + lngDelta }, // Bottom-Right
        { lat: blLat, lng: blLng }, // Bottom-Left
    ];

    return coordinates;
};
