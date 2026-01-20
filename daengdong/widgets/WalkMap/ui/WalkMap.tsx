"use client";

import Script from "next/script";
import { useState, useEffect, useRef } from "react";
import { CurrentLocationMarker } from "./CurrentLocationMarker";

interface WalkMapProps {
    currentPos: { lat: number; lng: number } | null;
    path?: { lat: number; lng: number }[];
}

export const WalkMap = ({ currentPos, path = [] }: WalkMapProps) => {
    const [loaded, setLoaded] = useState(false);
    const mapRef = useRef<any>(null);

    // 지도 초기화 및 중심 이동
    useEffect(() => {
        if (!loaded || !currentPos || !window.naver) return;

        const { naver } = window;
        const location = new naver.maps.LatLng(currentPos.lat, currentPos.lng);

        // 1. 지도 초기화 (최초 1회)
        if (!mapRef.current) {
            const map = new naver.maps.Map("map", {
                center: location,
                zoom: 15,
                gl: true,
                customStyleId: "767c7f0d-5728-4ff2-85ec-03e9a2475f18",
                zoomControl: true,
                padding: { top: 0, right: 0, bottom: 250, left: 0 },
                zoomControlOptions: {
                    position: naver.maps.Position.TOP_RIGHT,
                },
            });
            mapRef.current = map;
        }

        mapRef.current.panTo(location);

    }, [loaded, currentPos]);

    const recenterToCurrentLocation = () => {
        if (!currentPos || !mapRef.current) return;

        const { naver } = window;
        const newCenter = new naver.maps.LatLng(currentPos.lat, currentPos.lng);
        mapRef.current.setCenter(newCenter);
    };

    return (
        <>
            <Script
                src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=wt3yosmtpj&submodules=gl"
                strategy="afterInteractive"
                onLoad={() => setLoaded(true)}
            />

            <div
                id="map"
                style={{
                    width: "100%",
                    height: "100vh",
                    position: "relative",
                }}
            />

            {/* 우측 상단 (줌컨트롤 바로 밑) - Re-centering Button */}
            <div
                style={{
                    position: "fixed",
                    top: "300px",
                    right: "10px",
                    zIndex: 1000,
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                }}
            >
                <button
                    onClick={recenterToCurrentLocation}
                    style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: "white",
                        border: "1px solid #ccc",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                        cursor: "pointer",
                    }}
                >
                    📍
                </button>
            </div>

            <CurrentLocationMarker map={mapRef.current} position={currentPos} />
        </>
    );
};
