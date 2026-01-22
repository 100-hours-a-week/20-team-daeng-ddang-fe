"use client";

import Script from "next/script";
import { useState, useEffect } from "react";
import { BlockData } from "@/entities/walk/model/types";
import { MyBlocksOverlay } from "@/features/walk/ui/MyBlocksOverlay";
import { OthersBlocksOverlay } from "@/features/walk/ui/OthersBlocksOverlay";

interface SnapshotMapProps {
    path: { lat: number; lng: number }[];
    myBlocks: BlockData[];
    othersBlocks: BlockData[];
}

declare global {
    interface Window {
        initNaverMap?: () => void;
        naver: any;
        snapshotReady?: boolean;
        SNAPSHOT_DATA?: {
            path: { lat: number; lng: number }[];
            myBlocks?: BlockData[];
            othersBlocks?: BlockData[];
        };
    }
}

export const SnapshotMap = ({ path: initialPath, myBlocks: initialMyBlocks, othersBlocks: initialOthersBlocks }: SnapshotMapProps) => {
    const [loaded, setLoaded] = useState(false);
    const [map, setMap] = useState<any>(null);

    const [path, setPath] = useState(initialPath);
    const [myBlocks, setMyBlocks] = useState(initialMyBlocks);
    const [othersBlocks, setOthersBlocks] = useState(initialOthersBlocks);

    // Initial load check for injected data
    useEffect(() => {
        if (typeof window !== "undefined" && window.SNAPSHOT_DATA) {
            if (window.SNAPSHOT_DATA.path) setPath(window.SNAPSHOT_DATA.path);
            if (window.SNAPSHOT_DATA.myBlocks) setMyBlocks(window.SNAPSHOT_DATA.myBlocks);
            if (window.SNAPSHOT_DATA.othersBlocks) setOthersBlocks(window.SNAPSHOT_DATA.othersBlocks);
        }
    }, []);

    // Mock center calculation (start or end of path)
    const centerLat = path.length > 0 ? path[path.length - 1].lat : 37.3868;
    const centerLng = path.length > 0 ? path[path.length - 1].lng : 127.1247;

    useEffect(() => {
        if (typeof window !== "undefined" && window.naver && window.naver.maps) {
            setLoaded(true);
        } else {
            window.initNaverMap = () => {
                setLoaded(true);
            };
        }
    }, []);

    useEffect(() => {
        if (!loaded || !window.naver) return;

        const { naver } = window;
        const location = new naver.maps.LatLng(centerLat, centerLng);

        if (!map) {
            const newMap = new naver.maps.Map("map", {
                center: location,
                zoom: 17,
                gl: true,
                customStyleId: "767c7f0d-5728-4ff2-85ec-03e9a2475f18",
                zoomControl: false,
                scaleControl: false,
                mapDataControl: false,
                logoControl: false, // Might strict Naver TOS to remove logo, but for snapshot it's often cleaner. User request said "No UI".
            });

            setMap(newMap);
        }
    }, [loaded, centerLat, centerLng]);

    // Draw Polyline and Signal Ready
    useEffect(() => {
        if (!map || !window.naver) return;

        const { naver } = window;
        window.snapshotReady = false;

        // Draw Polyline
        if (path.length > 0) {
            const polylinePath = path.map(p => new naver.maps.LatLng(p.lat, p.lng));
            new naver.maps.Polyline({
                map: map,
                path: polylinePath,
                strokeColor: '#FFB74D', // Primary color
                strokeOpacity: 0.8,
                strokeWeight: 6,
                strokeLineCap: 'round',
                strokeLineJoin: 'round',
            });

        }

        // Draw Marker at User's Last Location
        if (path.length > 0) {
            const lastPoint = path[path.length - 1];
            new naver.maps.Marker({
                position: new naver.maps.LatLng(lastPoint.lat, lastPoint.lng),
                map: map,
                icon: {
                    content: `
                        <div style="
                            width: 40px; 
                            height: 40px; 
                            background-color: #FFB74D; 
                            border: 4px solid white; 
                            border-radius: 50%; 
                            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                        "></div>
                    `,
                    anchor: new naver.maps.Point(20, 20),
                }
            });
        }

        // Ensure map is centered on the last point (User's location)
        if (path.length > 0) {
            const lastPoint = path[path.length - 1];
            map.setCenter(new naver.maps.LatLng(lastPoint.lat, lastPoint.lng));
            map.setZoom(17); // Check this matches the user request for one level higher
        }

        // Set ready signal after a short delay to ensure rendering frames
        // In a real scenario, we might wait for tilesloaded event
        const idleListener = naver.maps.Event.addListener(map, 'idle', () => {
            // Delay slightly to allow polygons to render
            setTimeout(() => {
                window.snapshotReady = true;
            }, 800);
            naver.maps.Event.removeListener(idleListener);
        });

    }, [map, path, myBlocks, othersBlocks]);

    return (
        <>
            <Script
                src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=wt3yosmtpj&submodules=gl&callback=initNaverMap"
                strategy="afterInteractive"
            />
            <div
                id="map"
                style={{
                    width: "100%",
                    height: "100vh",
                }}
            />
            {map && (
                <>
                    <MyBlocksOverlay map={map} myBlocks={myBlocks} />
                    <OthersBlocksOverlay map={map} othersBlocks={othersBlocks} />
                </>
            )}
        </>
    );
};
