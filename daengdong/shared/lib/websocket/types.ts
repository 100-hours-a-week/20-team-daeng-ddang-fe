// WebSocket 메시지 타입 정의
export type WebSocketMessageType =
    | 'CONNECTED'
    | 'LOCATION_UPDATE'
    | 'BLOCK_OCCUPIED'
    | 'BLOCK_OCCUPY_FAILED'
    | 'BLOCK_TAKEN'
    | 'BLOCKS_SYNC'
    | 'WALK_ENDED'
    | 'ERROR';

// 연결 성공 메시지
export interface ConnectedMessage {
    type: 'CONNECTED';
    data: {
        walkId: number;
        connectedAt: string;
    };
}

// 위치 업데이트 메시지 (Client → Server)
export interface LocationUpdateMessage {
    type: 'LOCATION_UPDATE';
    data: {
        lat: number;
        lng: number;
        timestamp: string;
    };
}

// 블록 점유 성공 메시지
export interface BlockOccupiedMessage {
    type: 'BLOCK_OCCUPIED';
    data: {
        blockId: string;
        dogId: number;
        dogName: string;
        occupiedAt: string;
    };
}

// 블록 점유 실패 메시지
export interface BlockOccupyFailedMessage {
    type: 'BLOCK_OCCUPY_FAILED';
    message: string;
    data: {
        reason: string;
    };
}

// 블록 탈취 메시지
export interface BlockTakenMessage {
    type: 'BLOCK_TAKEN';
    data: {
        blockId: string;
        previousDogId: number;
        newDogId: number;
        takenAt: string;
    };
}

// 블록 동기화 메시지
export interface BlocksSyncMessage {
    type: 'BLOCKS_SYNC';
    data: {
        blocks: Array<{
            blockId: string;
            dogId: number;
        }>;
    };
}

// 산책 종료 메시지
export interface WalkEndedMessage {
    type: 'WALK_ENDED';
    data: {
        walkId: number;
        endedAt: string;
    };
}

// 에러 메시지
export interface ErrorMessage {
    type: 'ERROR';
    message: string;
}

// 모든 서버 메시지 타입
export type ServerMessage =
    | ConnectedMessage
    | BlockOccupiedMessage
    | BlockOccupyFailedMessage
    | BlockTakenMessage
    | BlocksSyncMessage
    | WalkEndedMessage
    | ErrorMessage;

// 클라이언트 메시지 타입
export type ClientMessage = LocationUpdateMessage;

export interface IWalkWebSocketClient {
    connect(walkId: number, accessToken?: string): Promise<void>;
    sendLocation(lat: number, lng: number): void;
    subscribeToArea(areaKey: string): void;
    unsubscribeFromArea(): void;
    disconnect(): void;
    getConnectionStatus(): boolean;
}
