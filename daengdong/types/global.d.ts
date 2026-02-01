import {
    NaverLatLng,
    NaverPoint,
    NaverMap,
    NaverMapOptions,
    NaverMarker,
    NaverMarkerOptions,
    NaverPolygon,
    NaverPolygonOptions,
    NaverPolyline,
    NaverPolylineOptions,
    NaverEventListener
} from './naver-maps';

declare global {
    interface Window {
        naver: {
            maps: {
                LatLng: new (lat: number, lng: number) => NaverLatLng;
                Point: new (x: number, y: number) => NaverPoint;
                Map: new (element: string | HTMLElement, options: NaverMapOptions) => NaverMap;
                Marker: new (options: NaverMarkerOptions) => NaverMarker;
                Polygon: new (options: NaverPolygonOptions) => NaverPolygon;
                Polyline: new (options: NaverPolylineOptions) => NaverPolyline;
                Event: {
                    addListener: (target: unknown, eventName: string, handler: () => void) => NaverEventListener;
                    removeListener: (listener: NaverEventListener) => void;
                };
                Position: {
                    TOP_RIGHT: unknown;
                };
            };
        };
        initNaverMap?: () => void;
        getWalkSnapshotBlob?: () => Promise<Blob | null>;
        isWalkSnapshotReady?: boolean;
    }
}

