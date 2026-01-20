"use client";

// 지도 렌더링 테스트용 페이지 
import Script from "next/script";
import { useState, useEffect } from "react";

export default function Dev() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loaded) return;
    if (!window.naver) return;

    new window.naver.maps.Map("map", {
      center: new window.naver.maps.LatLng(37.5665, 126.978),
      zoom: 15,
    });
  }, [loaded]);

  return (
    <>
      <Script
        src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=wt3yosmtpj`}
        strategy="afterInteractive"
        onLoad={() => {
          console.log("Naver Maps SDK loaded");
          setLoaded(true);
        }}
      />
      <div id="map" style={{ width: "100%", height: "100vh" }} />
    </>
  );
}
