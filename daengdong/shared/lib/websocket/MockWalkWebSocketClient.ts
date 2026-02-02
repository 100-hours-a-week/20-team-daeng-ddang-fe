import { ServerMessage, IWalkWebSocketClient } from './types';

export class MockWalkWebSocketClient implements IWalkWebSocketClient {
    private isConnected = false;
    private walkId: number | null = null;
    private mockInterval: NodeJS.Timeout | null = null;

    constructor(
        private onMessage: (message: ServerMessage) => void,
        private onError: (error: Error) => void
    ) { }

    connect(walkId: number, _accessToken?: string): Promise<void> {
        return new Promise((resolve) => {


            setTimeout(() => {
                this.isConnected = true;
                this.walkId = walkId;


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


            this.onMessage(message);
        }, 500);
    }

    disconnect() {
        this.isConnected = false;

    }

    subscribeToArea(_areaKey: string) {
        if (!this.isConnected) return;


        // Mock: 구독 즉시 테스트용 메시지 전송 (선택 사항)
        // setTimeout(() => {
        //     this.onMessage({
        //         type: 'BLOCKS_SYNC',
        //         data: { blocks: [] }
        //     });
        // }, 1000);
    }

    unsubscribeFromArea() {

    }

    getConnectionStatus() {
        return this.isConnected;
    }
}
