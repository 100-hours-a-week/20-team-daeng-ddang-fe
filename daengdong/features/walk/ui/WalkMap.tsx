"use client";

import Script from "next/script";
import { useState, useEffect } from "react";
import { CurrentLocationMarker } from "./CurrentLocationMarker";
import { MyBlocksOverlay } from "./MyBlocksOverlay";
import { OthersBlocksOverlay } from "./OthersBlocksOverlay";
import { BlockData } from "@/entities/walk/model/types";
import { NaverMap } from "@/types/naver-maps";

interface WalkMapProps {
    currentPos: { lat: number; lng: number } | null;
    myBlocks?: BlockData[];
    othersBlocks?: BlockData[];
}

export const WalkMap = ({ currentPos, myBlocks = [], othersBlocks = [] }: WalkMapProps) => {
    const [loaded, setLoaded] = useState(false);
    const [map, setMap] = useState<NaverMap | null>(null);

    // 이미 스크립트가 로드되어 있는 경우 확인
    useEffect(() => {
        if (typeof window !== "undefined" && window.naver && window.naver.maps) {
            setLoaded(true);
        }
    }, []);

    useEffect(() => {
        if (typeof window !== "undefined") {
            window.initNaverMap = () => {
                setLoaded(true);
            };
        }
    }, []);

    // 지도 초기화 및 중심 이동
    useEffect(() => {
        if (!loaded || !currentPos || !window.naver) return;

        const { naver } = window;
        const location = new naver.maps.LatLng(currentPos.lat, currentPos.lng);

        if (!map) {
            const newMap = new naver.maps.Map("map", {
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

            setMap(newMap);
        } else {
            map.panTo(location);
        }

    }, [loaded, currentPos, map]);

    const recenterToCurrentLocation = () => {
        if (!currentPos || !map) return;

        const { naver } = window;
        const newCenter = new naver.maps.LatLng(currentPos.lat, currentPos.lng);
        map.setCenter(newCenter);
    };

    return (
        <>
            <Script
                src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=wt3yosmtpj&submodules=gl&callback=initNaverMap"
                strategy="afterInteractive"
            />

            <div
                id="walk-map-container"
                style={{
                    width: "100%",
                    height: "100%",
                    position: "relative",
                }}
            >
                <div
                    id="map"
                    style={{
                        width: "100%",
                        height: "100%",
                    }}
                />
            </div>

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

            <CurrentLocationMarker map={map} position={currentPos} />

            {map && (
                <>
                    <MyBlocksOverlay map={map} myBlocks={myBlocks} />
                    <OthersBlocksOverlay map={map} othersBlocks={othersBlocks} />
                </>
            )}
        </>
    );
};

