import { ServerMessage, IWalkWebSocketClient } from './types';

export class MockWalkWebSocketClient implements IWalkWebSocketClient {
    private isConnected = false;
    private walkId: number | null = null;
    private mockInterval: NodeJS.Timeout | null = null;

    constructor(
        private onMessage: (message: ServerMessage) => void,
        private onError: (error: Error) => void
    ) { }

    connect(walkId: number, accessToken?: string): Promise<void> {
        return new Promise((resolve) => {
            console.log('[MockWS] Connecting...', { walkId, accessToken });

            setTimeout(() => {
                this.isConnected = true;
                this.walkId = walkId;
                console.log('[MockWS] Connected!');

                this.onMessage({
                    type: 'CONNECTED',
                    data: {
                        walkId,
                        connectedAt: new Date().toISOString()
                    }
                });

                resolve();
            }, 1000);
        });
    }

    sendLocation(lat: number, lng: number): void {
        if (!this.isConnected) {
            console.warn('[MockWS] Not connected');
            return;
        }

        console.log(`[MockWS] Location sent: ${lat}, ${lng}`);

        // 확률적으로 블록 점유 이벤트 발생 (테스트용)
        if (Math.random() > 0.7) {
            this.simulateBlockOccupied(lat, lng);
        }
    }

    private simulateBlockOccupied(lat: number, lng: number) {
        // 간단한 모의 블록 ID 생성
        const blockId = `MOCK_${lat.toFixed(3)}_${lng.toFixed(3)}`;

        // 50% 확률로 내 땅 vs 남의 땅
        const isMyDog = Math.random() > 0.5;
        const mockDogId = isMyDog ? 1 : 999;

        setTimeout(() => {
            const message: ServerMessage = {
                type: 'BLOCK_OCCUPIED',
                data: {
                    blockId,
                    dogId: mockDogId,
                    dogName: isMyDog ? '내강아지' : '남의강아지',
                    occupiedAt: new Date().toISOString()
                }
            };

            console.log('[MockWS] Server Message:', message);
            this.onMessage(message);
        }, 500);
    }

    disconnect() {
        this.isConnected = false;
        console.log("🔌 [Mock] WebSocket 연결 해제");
    }

    subscribeToArea(areaKey: string) {
        if (!this.isConnected) return;
        console.log(`📡 [Mock] Area 구독 시작: ${areaKey}`);

        // Mock: 구독 즉시 테스트용 메시지 전송 (선택 사항)
        // setTimeout(() => {
        //     this.onMessage({
        //         type: 'BLOCKS_SYNC',
        //         data: { blocks: [] }
        //     });
        // }, 1000);
    }

    unsubscribeFromArea() {
        console.log('🔕 [Mock] Area 구독 해제');
    }

    getConnectionStatus() {
        return this.isConnected;
    }
}
