"use client";

import { colors } from "@/shared/styles/tokens";
import Script from "next/script";
import { useState, useEffect, useRef } from "react";

export default function Dev() {
  const [loaded, setLoaded] = useState(false);
  const [currentPos, setCurrentPos] = useState<{ lat: number; lng: number } | null>(null);
  const mapRef = useRef<any>(null);

  // 현재 위치 가져오기
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      alert("이 브라우저에서는 위치 정보가 지원되지 않습니다.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrentPos({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => console.error(err),
      { enableHighAccuracy: true }
    );
  }, []);

  // 지도 렌더링
  useEffect(() => {
    if (!loaded || !currentPos) return;
    if (!window.naver) return;

    const { naver } = window;

    const map = new naver.maps.Map("map", {
      center: new naver.maps.LatLng(currentPos.lat, currentPos.lng),
      zoom: 15,
      gl: true,
      // customStyleId: "b9cc8c4d-2e8c-4fc7-a8f7-a46d28543f6a", //기본 컬러
      customStyleId: "767c7f0d-5728-4ff2-85ec-03e9a2475f18",
      zoomControl: true,
      zoomControlOptions: {
        position: naver.maps.Position.TOP_RIGHT,
      },
    });

    mapRef.current = map;

    // 현재 위치 마커
    new naver.maps.Marker({
      position: new naver.maps.LatLng(currentPos.lat, currentPos.lng),
      map,
      icon: {
        content: `<div style="
      width: 36px;
      height: 36px;
      background: ${colors.primary[500]};
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 0 8px rgba(0,0,0,0.2);
    "></div>`,
        anchor: new naver.maps.Point(18, 18)
      }
    });

  }, [loaded, currentPos]);

  // 현재 위치로 다시 이동 버튼
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