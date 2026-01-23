import { Client, IMessage } from '@stomp/stompjs';
import { ServerMessage, ClientMessage } from './types';

export class WalkWebSocketClient {
    private client: Client | null = null;
    private walkId: number | null = null;
    private isConnected = false;

    constructor(
        private baseUrl: string,
        private onMessage: (message: ServerMessage) => void,
        private onError: (error: Error) => void
    ) { }

    // WebSocket 연결
    connect(walkId: number): Promise<void> {
        return new Promise((resolve, reject) => {
            this.walkId = walkId;

            // HTTP/HTTPS URL을 WebSocket URL로 변환
            const wsUrl = this.baseUrl
                .replace(/^http:\/\//, 'ws://')
                .replace(/^https:\/\//, 'wss://');

            this.client = new Client({
                brokerURL: `${wsUrl}/ws/walks`,
                debug: (str) => {
                    console.log('[STOMP Debug]', str);
                },
                reconnectDelay: 5000, // 5초 후 재연결
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000,
            });

            // 연결 성공 시
            this.client.onConnect = () => {
                console.log('✅ WebSocket 연결 성공');
                this.isConnected = true;
                resolve();
            };

            // 연결 에러 시
            this.client.onStompError = (frame) => {
                console.error('❌ STOMP 에러:', frame.headers['message']);
                this.isConnected = false;
                const error = new Error(frame.headers['message'] || 'STOMP 연결 실패');
                this.onError(error);
                reject(error);
            };

            // WebSocket 에러 시
            this.client.onWebSocketError = (event) => {
                console.error('❌ WebSocket 에러:', event);
                this.isConnected = false;
                const error = new Error('WebSocket 연결 실패');
                this.onError(error);
                reject(error);
            };

            // 연결 시작
            this.client.activate();
        });
    }

    // 지역 채널 구독
    subscribeToRegionCell(regionId: number, cellId: string, callback: (message: ServerMessage) => void) {
        if (!this.client || !this.isConnected) {
            console.warn('⚠️ WebSocket이 연결되지 않았습니다');
            return;
        }

        const topic = `/topic/regions/${regionId}/cells/${cellId}`;
        console.log(`📡 구독 시작: ${topic}`);

        return this.client.subscribe(topic, (message: IMessage) => {
            try {
                const data = JSON.parse(message.body) as ServerMessage;
                console.log('📨 메시지 수신:', data);
                callback(data);
                this.onMessage(data);
            } catch (error) {
                console.error('❌ 메시지 파싱 에러:', error);
                this.onError(error as Error);
            }
        });
    }

    // 위치 전송
    sendLocation(lat: number, lng: number) {
        if (!this.client || !this.isConnected || !this.walkId) {
            console.warn('⚠️ WebSocket이 연결되지 않았거나 walkId가 없습니다');
            return;
        }

        const message: ClientMessage = {
            type: 'LOCATION_UPDATE',
            data: {
                lat,
                lng,
                timestamp: new Date().toISOString(),
            },
        };

        const destination = `/app/walks/${this.walkId}/location`;
        console.log(`📤 위치 전송: ${destination}`, message);

        this.client.publish({
            destination,
            body: JSON.stringify(message),
        });
    }

    // 연결 해제
    disconnect() {
        if (this.client) {
            console.log('🔌 WebSocket 연결 해제');
            this.client.deactivate();
            this.isConnected = false;
            this.walkId = null;
        }
    }

    // 연결 상태 확인
    getConnectionStatus() {
        return this.isConnected;
    }
}
