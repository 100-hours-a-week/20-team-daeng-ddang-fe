"use client";

import { colors } from "@/shared/styles/tokens";
import Script from "next/script";
import { useState, useEffect, useRef } from "react";

export default function Dev() {
  const [loaded, setLoaded] = useState(false);
  const [currentPos, setCurrentPos] = useState<{ lat: number; lng: number } | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // 실시간 위치 추적 (watchPosition)
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      alert("이 브라우저에서는 위치 정보가 지원되지 않습니다.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setCurrentPos({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => console.error(err),
      { enableHighAccuracy: true }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // 지도 및 마커 업데이트
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
        zoomControlOptions: {
          position: naver.maps.Position.TOP_RIGHT,
        },
      });
      mapRef.current = map;
    }

    // 2. 마커 생성 또는 업데이트
    if (!markerRef.current) {
      markerRef.current = new naver.maps.Marker({
        position: location,
        map: mapRef.current,
        icon: {
          content: `<div style="
            width: 36px;
            height: 36px;
            background: ${colors.primary[500]};
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 0 8px rgba(0,0,0,0.2);
          "></div>`,
          anchor: new naver.maps.Point(18, 18),
        },
      });
    } else {
      markerRef.current.setPosition(location);
    }

    // 3. 지도 중심 이동 (자동 추적)
    // 부드러운 이동을 위해 panTo 사용
    mapRef.current.panTo(location);

  }, [loaded, currentPos]);

  // 현재 위치로 다시 이동 버튼
  const recenterToCurrentLocation = () => {
    if (!currentPos || !mapRef.current) return;

    const { naver } = window;
    const newCenter = new naver.maps.LatLng(currentPos.lat, currentPos.lng);
    mapRef.current.setCenter(newCenter);
    mapRef.current.setZoom(17, true); // 줌 레벨도 살짝 당겨줌 (UX 향상)
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

      {/* 우측 상단 (줌컨트롤 바로 밑) */}
      <div
        style={{
          position: "fixed",
          top: "250px",
          right: "10px",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {/* 현재 위치 버튼 */}
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
    </>
  );
}