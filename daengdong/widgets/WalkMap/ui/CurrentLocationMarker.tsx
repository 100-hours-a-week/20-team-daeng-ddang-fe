import { useEffect, useRef } from "react";
import { colors } from "@/shared/styles/tokens";

interface CurrentLocationMarkerProps {
    map: any;
    position: { lat: number; lng: number } | null;
}

export const CurrentLocationMarker = ({ map, position }: CurrentLocationMarkerProps) => {
    const markerRef = useRef<any>(null);

    useEffect(() => {
        if (!map || !position || !window.naver) return;

        const { naver } = window;
        const location = new naver.maps.LatLng(position.lat, position.lng);

        if (!markerRef.current) {
            markerRef.current = new naver.maps.Marker({
                position: location,
                map: map,
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
    }, [map, position]);

    return null;
};
