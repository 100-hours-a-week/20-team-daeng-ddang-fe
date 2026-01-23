# WebSocket API 사용 가이드

## 개요

이 프로젝트의 WebSocket 구현은 **순수 WebSocket + STOMP** 프로토콜을 사용합니다.
산책(walkId) 단위로 실시간 이벤트를 주고받으며, SockJS는 사용하지 않습니다.

## 아키텍처

### 연결 방식
- **프로토콜**: WebSocket (ws:// 또는 wss://)
- **메시지 프로토콜**: STOMP
- **엔드포인트**: `/ws/walks`
- **구독 토픽**: `/topic/walks/{walkId}`

### 통신 흐름

```
Client                          Server
  |                               |
  |-- connect(walkId) ----------->|  WebSocket 연결
  |<---------- onConnect ---------|  연결 성공
  |                               |
  |-- auto subscribe ------------>|  /topic/walks/{walkId} 구독
  |                               |
  |-- sendLocation() ------------>|  /app/walks/{walkId}/location
  |                               |
  |<--- BLOCK_OCCUPIED ----------|  블록 점유 성공
  |<--- BLOCK_TAKEN -------------|  블록 탈취
  |<--- BLOCKS_SYNC -------------|  블록 동기화
  |<--- WALK_ENDED --------------|  산책 종료
  |                               |
  |-- disconnect() -------------->|  연결 해제
```

## 사용 방법

### 1. 클라이언트 생성

```typescript
import { WalkWebSocketClient } from '@/shared/lib/websocket/WalkWebSocketClient';

const client = new WalkWebSocketClient(
  'http://localhost:8080',  // API Base URL
  (message) => {
    // 서버로부터 메시지 수신 시 호출
    console.log('메시지:', message);
  },
  (error) => {
    // 에러 발생 시 호출
    console.error('에러:', error);
  }
);
```

### 2. 연결 및 자동 구독

```typescript
// walkId로 연결하면 자동으로 /topic/walks/{walkId} 구독
await client.connect(999);

// 연결 성공 시 자동으로 다음 토픽을 구독합니다:
// - /topic/walks/999
```

### 3. 위치 전송

```typescript
// 현재 위치를 서버로 전송
// walkStore의 currentPos를 사용하거나, 없으면 기본값 사용
const { currentPos } = useWalkStore();
const lat = currentPos?.lat ?? 37.39421;
const lng = currentPos?.lng ?? 127.11142;

client.sendLocation(lat, lng);

// 서버 목적지: /app/walks/{walkId}/location
```

### 4. 메시지 수신

클라이언트는 다음 이벤트를 자동으로 수신하고 처리합니다:

```typescript
// 모든 메시지는 onMessage 콜백으로 전달됩니다
const client = new WalkWebSocketClient(
  baseUrl,
  (message) => {
    switch (message.type) {
      case 'BLOCK_OCCUPIED':
        // 블록 점유 성공
        console.log('점유한 블록:', message.data.blockId);
        break;
      
      case 'BLOCK_OCCUPY_FAILED':
        // 블록 점유 실패
        console.log('실패 이유:', message.message);
        break;
      
      case 'BLOCK_TAKEN':
        // 블록 탈취당함
        console.log('탈취된 블록:', message.data.blockId);
        break;
      
      case 'BLOCKS_SYNC':
        // 블록 동기화
        console.log('동기화된 블록들:', message.data.blocks);
        break;
      
      case 'WALK_ENDED':
        // 산책 종료
        console.log('산책 종료:', message.data.walkId);
        break;
      
      case 'ERROR':
        // 에러 메시지
        console.error('서버 에러:', message.message);
        break;
    }
  },
  (error) => {
    console.error('WebSocket 에러:', error);
  }
);
```

### 5. 연결 해제

```typescript
// 구독 해제 및 WebSocket 연결 종료
client.disconnect();
```

## 메시지 타입

### Client → Server

#### LOCATION_UPDATE
```typescript
{
  type: 'LOCATION_UPDATE',
  data: {
    lat: number,      // 위도
    lng: number,      // 경도
    timestamp: string // ISO 8601 형식
  }
}
```

**목적지**: `/app/walks/{walkId}/location`

### Server → Client

#### BLOCK_OCCUPIED
```typescript
{
  type: 'BLOCK_OCCUPIED',
  data: {
    blockId: string,
    dogId: number,
    dogName: string,
    occupiedAt: string
  }
}
```

#### BLOCK_OCCUPY_FAILED
```typescript
{
  type: 'BLOCK_OCCUPY_FAILED',
  message: string,
  data: {
    reason: string
  }
}
```

#### BLOCK_TAKEN
```typescript
{
  type: 'BLOCK_TAKEN',
  data: {
    blockId: string,
    previousDogId: number,
    newDogId: number,
    takenAt: string
  }
}
```

#### BLOCKS_SYNC
```typescript
{
  type: 'BLOCKS_SYNC',
  data: {
    blocks: Array<{
      blockId: string,
      dogId: number
    }>
  }
}
```

#### WALK_ENDED
```typescript
{
  type: 'WALK_ENDED',
  data: {
    walkId: number,
    endedAt: string
  }
}
```

#### ERROR
```typescript
{
  type: 'ERROR',
  message: string
}
```

## 테스트

WebSocket 연결을 테스트하려면:

1. 개발 서버 실행: `npm run dev`
2. 브라우저에서 `/test/websocket` 접속
3. "연결하기" 버튼 클릭
4. "위치 전송" 버튼으로 메시지 전송 테스트
5. 콘솔에서 수신 메시지 확인

## 주의사항

### ❌ SockJS 사용 안 함
이전 버전과 달리 **SockJS를 사용하지 않습니다**. 백엔드도 `withSockJS()` 설정이 제거되어야 합니다.

### ✅ 자동 구독
`connect()` 호출 시 자동으로 `/topic/walks/{walkId}` 토픽을 구독합니다. 
별도의 `subscribe()` 호출이 필요 없습니다.

### ✅ 재연결
네트워크 문제로 연결이 끊어지면 5초 후 자동으로 재연결을 시도합니다.

### ✅ Heartbeat
4초마다 heartbeat를 주고받아 연결 상태를 유지합니다.

## 백엔드 요구사항

백엔드는 다음과 같이 설정되어야 합니다:

```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws/walks")
            .setAllowedOrigins("*");
        // ❌ .withSockJS() 사용 안 함!
    }
    
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic");
        registry.setApplicationDestinationPrefixes("/app");
    }
}
```

## 변경 이력

### v2.0.0 (2026-01-23)
- ❌ SockJS 제거
- ❌ Region/Cell 기반 구독 제거
- ✅ 순수 WebSocket + STOMP 사용
- ✅ walkId 기반 단일 토픽 구독
- ✅ 자동 구독 기능 추가
- ✅ 메시지 타입별 라우팅 개선
