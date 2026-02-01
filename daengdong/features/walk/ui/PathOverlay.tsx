"use client";

import { useEffect, useRef } from "react";
import { NaverMap, NaverPolyline } from "@/types/naver-maps";
import { LatLng } from "@/entities/walk/model/types";
import { colors } from "@/shared/styles/tokens";

interface PathOverlayProps {
    map: NaverMap;
    path: LatLng[];
}

export const PathOverlay = ({ map, path }: PathOverlayProps) => {
    const polylineRef = useRef<NaverPolyline | null>(null);

    useEffect(() => {
        if (!map || path.length < 2) {
            polylineRef.current?.setMap(null);
            polylineRef.current = null;
            return;
        }

        const { naver } = window;
        const coords = path.map(p => new naver.maps.LatLng(p.lat, p.lng));

        if (!polylineRef.current) {
            polylineRef.current = new naver.maps.Polyline({
                map: map,
                path: coords,
                strokeColor: colors.primary[500],
                strokeWeight: 4,
                strokeOpacity: 0.9,
                strokeStyle: "solid", // 실선 스타일
                strokeLineCap: "round",
                strokeLineJoin: "round",
            });
        } else {
            polylineRef.current.setPaths(coords);
        }

        return () => {
            if (polylineRef.current) {
                polylineRef.current.setMap(null);
                polylineRef.current = null;
            }
        };
    }, [map, path]);

    return null;
};
