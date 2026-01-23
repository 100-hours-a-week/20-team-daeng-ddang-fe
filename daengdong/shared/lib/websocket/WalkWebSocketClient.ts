import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { ServerMessage, ClientMessage } from './types';

export class WalkWebSocketClient {
    private client: Client | null = null;
    private walkId: number | null = null;
    private isConnected = false;
    private subscription: StompSubscription | null = null;

    constructor(
        private baseUrl: string,
        private onMessage: (message: ServerMessage) => void,
        private onError: (error: Error) => void
    ) { }

    // WebSocket 연결 및 자동 구독
    connect(walkId: number): Promise<void> {
        return new Promise((resolve, reject) => {
            this.walkId = walkId;

            // HTTP/HTTPS URL을 WebSocket URL로 변환하고 /api/v3 제거
            const wsUrl = this.baseUrl
                .replace(/^http:\/\//, 'ws://')
                .replace(/^https:\/\//, 'wss://')
                .replace(/\/api\/v3$/, ''); // /api/v3 경로 제거

            this.client = new Client({
                brokerURL: `${wsUrl}/ws/walks`,
                debug: (str) => {

                    console.log('[STOMP Debug]', str);
                },
                reconnectDelay: 5000, // 5초 후 재연결
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000,
            });

            // 연결 성공 시 자동으로 walkId 토픽 구독
            this.client.onConnect = () => {
                console.log('✅ WebSocket 연결 성공');
                this.isConnected = true;

                // walkId 기반 토픽 자동 구독
                this.subscribeToWalk();

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

    // walkId 기반 토픽 구독 (내부 메서드)
    private subscribeToWalk() {
        if (!this.client || !this.isConnected || !this.walkId) {
            console.warn('⚠️ WebSocket이 연결되지 않았거나 walkId가 없습니다');
            return;
        }

        const topic = `/topic/walks/${this.walkId}`;
        console.log(`📡 구독 시작: ${topic}`);

        this.subscription = this.client.subscribe(topic, (message: IMessage) => {
            try {
                const data = JSON.parse(message.body) as ServerMessage;
                console.log(`📨 메시지 수신 [${data.type}]:`, data);

                // 메시지 타입별 처리
                this.handleMessage(data);
            } catch (error) {
                console.error('❌ 메시지 파싱 에러:', error);
                this.onError(error as Error);
            }
        });
    }

    // 메시지 타입별 처리
    private handleMessage(message: ServerMessage) {
        switch (message.type) {
            case 'BLOCK_OCCUPIED':
                console.log('🟢 블록 점유 성공:', message.data);
                break;
            case 'BLOCK_OCCUPY_FAILED':
                console.log('🔴 블록 점유 실패:', message.message);
                break;
            case 'BLOCK_TAKEN':
                console.log('⚠️ 블록 탈취됨:', message.data);
                break;
            case 'BLOCKS_SYNC':
                console.log('🔄 블록 동기화:', message.data);
                break;
            case 'WALK_ENDED':
                console.log('🏁 산책 종료:', message.data);
                break;
            case 'ERROR':
                console.error('❌ 에러 메시지:', message.message);
                break;
            default:
                console.log('📨 기타 메시지:', message);
        }

        // 상위 콜백 호출
        this.onMessage(message);
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
        if (this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = null;
        }

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
