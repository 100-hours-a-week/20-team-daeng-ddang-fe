import { SnapshotMap } from "./SnapshotMap";

const generateMockData = () => {
    const centerLat = 37.3868;
    const centerLng = 127.1247;

    const path = [
        { lat: centerLat, lng: centerLng },
        { lat: centerLat + 0.001, lng: centerLng },
        { lat: centerLat + 0.001, lng: centerLng + 0.001 },
        { lat: centerLat, lng: centerLng + 0.001 },
        { lat: centerLat, lng: centerLng },
    ];

    const myBlocks = [
        { blockId: `P_${centerLat}_${centerLng}`, dogId: 1 },
        { blockId: `P_${centerLat}_${centerLng + 0.002}`, dogId: 1 },
    ];

    const othersBlocks = [
        { blockId: `P_${centerLat - 0.001}_${centerLng}`, dogId: 5 },
    ];

    return { path, myBlocks, othersBlocks };
};

export default async function SnapshotPage({ params }: { params: Promise<{ walkId: string }> }) {
    await params; // params is unused but required for page structure, await to satisfy async
    const { path, myBlocks, othersBlocks } = generateMockData();

    return (
        <div style={{ width: "100vw", height: "100vh", overflow: "hidden", position: "relative", zIndex: 9999, background: "white" }}>
            <SnapshotMap
                path={path}
                myBlocks={myBlocks}
                othersBlocks={othersBlocks}
            />
        </div>
    );
}
