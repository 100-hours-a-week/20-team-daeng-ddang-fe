"use client";

import styled from "@emotion/styled";
import Script from "next/script";
import { useState, useEffect } from "react";
import { BlockData } from "@/entities/walk/model/types";
import { MyBlocksOverlay } from "@/features/walk/ui/MyBlocksOverlay";
import { OthersBlocksOverlay } from "@/features/walk/ui/OthersBlocksOverlay";

import { NaverMap } from "@/types/naver-maps";

interface SnapshotMapProps {
    path: { lat: number; lng: number }[];
    myBlocks: BlockData[];
    othersBlocks: BlockData[];
}

declare global {
    interface Window {
        initNaverMap?: () => void;
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
    const [map, setMap] = useState<NaverMap | null>(null);

    const [path] = useState(() => {
        if (typeof window !== "undefined" && window.SNAPSHOT_DATA?.path) {
            console.log("[SnapshotMap] Loaded path from window");
            return window.SNAPSHOT_DATA.path;
        }
        return initialPath;
    });

    const [myBlocks] = useState(() => {
        if (typeof window !== "undefined" && window.SNAPSHOT_DATA?.myBlocks) {
            console.log("[SnapshotMap] Loaded myBlocks from window");
            return window.SNAPSHOT_DATA.myBlocks;
        }
        return initialMyBlocks;
    });

    const [othersBlocks] = useState(() => {
        if (typeof window !== "undefined" && window.SNAPSHOT_DATA?.othersBlocks) {
            console.log("[SnapshotMap] Loaded othersBlocks from window");
            return window.SNAPSHOT_DATA.othersBlocks;
        }
        return initialOthersBlocks;
    });

    const centerLat = path.length > 0 ? path[path.length - 1].lat : 37.3868;
    const centerLng = path.length > 0 ? path[path.length - 1].lng : 127.1247;

    useEffect(() => {
        if (typeof window !== "undefined" && window.naver && window.naver.maps) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
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
                logoControl: false,
            });

            // eslint-disable-next-line react-hooks/set-state-in-effect
            setMap(newMap);
        }
    }, [loaded, centerLat, centerLng, map]);

    useEffect(() => {
        if (!map || !window.naver) return;

        const { naver } = window;
        window.snapshotReady = false;

        if (path.length > 0) {
            const polylinePath = path.map(p => new naver.maps.LatLng(p.lat, p.lng));
            new naver.maps.Polyline({
                map: map,
                path: polylinePath,
                strokeColor: '#FFB74D',
                strokeOpacity: 0.8,
                strokeWeight: 6,
                strokeLineCap: 'round',
                strokeLineJoin: 'round',
            });

        }

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

        if (path.length > 0) {
            const lastPoint = path[path.length - 1];
            map.setCenter(new naver.maps.LatLng(lastPoint.lat, lastPoint.lng));
            map.setZoom(17);
        }

        const idleListener = naver.maps.Event.addListener(map, 'idle', () => {
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
            <MapContainer id="map" />
            {map && (
                <>
                    <MyBlocksOverlay map={map} myBlocks={myBlocks} />
                    <OthersBlocksOverlay map={map} othersBlocks={othersBlocks} />
                </>
            )}
        </>
    );
};

const MapContainer = styled.div`
    width: 100%;
    height: 100vh;
`;
