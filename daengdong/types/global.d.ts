export { };

declare global {
    interface Window {
        naver: any;
        initNaverMap?: () => void;
        getWalkSnapshotBlob?: () => Promise<Blob | null>;
    }
}
