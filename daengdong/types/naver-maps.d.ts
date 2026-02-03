export { };

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
        TransCoord: {
          fromLatLngToEPSG5179: (latlng: NaverLatLng) => NaverPoint;
          fromEPSG5179ToLatLng: (point: NaverPoint) => NaverLatLng;
        };
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
    snapshotReady?: boolean;
    SNAPSHOT_DATA?: {
      path: { lat: number; lng: number }[];
      myBlocks?: { blockId: string; dogId: number; occupiedAt?: string }[];
      othersBlocks?: { blockId: string; dogId: number; occupiedAt?: string }[];
    };
  }
}

export interface NaverLatLng {
  lat: () => number;
  lng: () => number;
}

export interface NaverPoint {
  x: number;
  y: number;
}

export interface NaverMap {
  setCenter: (location: NaverLatLng) => void;
  setZoom: (zoom: number) => void;
  getZoom: () => number;
  panTo: (location: NaverLatLng) => void;
  setOptions: (options: Partial<NaverMapOptions>) => void;
  morph: (coord: NaverLatLng, zoom?: number, transitionOptions?: unknown) => void;
}

export interface NaverMarker {
  setPosition: (location: NaverLatLng) => void;
  setMap: (map: NaverMap | null) => void;
}

export interface NaverPolygon {
  setPaths: (paths: NaverLatLng[]) => void;
  setOptions: (options: Partial<NaverPolygonOptions>) => void;
  setMap: (map: NaverMap | null) => void;
}

export interface NaverPolyline {
  setPaths: (path: NaverLatLng[]) => void;
  setMap: (map: NaverMap | null) => void;
}

export type NaverEventListener = unknown;

export interface NaverMapOptions {
  center: NaverLatLng;
  zoom: number;
  gl?: boolean;
  customStyleId?: string;
  zoomControl?: boolean;
  scaleControl?: boolean;
  mapDataControl?: boolean;
  logoControl?: boolean;
  padding?: { top: number; right: number; bottom: number; left: number };
  zoomControlOptions?: {
    position: unknown;
  };
}

export interface NaverMarkerOptions {
  position: NaverLatLng;
  map: NaverMap;
  icon?: {
    content: string;
    anchor: NaverPoint;
  };
}

export interface NaverPolygonOptions {
  map: NaverMap;
  paths: NaverLatLng[];
  fillColor: string;
  fillOpacity: number;
  strokeColor: string;
  strokeOpacity: number;
  strokeWeight: number;
  clickable?: boolean;
}

export interface NaverPolylineOptions {
  map: NaverMap;
  path: NaverLatLng[];
  strokeColor: string;
  strokeOpacity: number;
  strokeWeight: number;
  strokeStyle?: string;
  strokeLineCap?: string;
  strokeLineJoin?: string;
}
