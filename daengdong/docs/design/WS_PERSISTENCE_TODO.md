# 산책 WebSocket 탭 이동 끊김 대응 TODO

## 배경
- 현재 WebSocket 연결 수명주기가 `walk` 화면 컴포넌트(`useWalkControl`)에 묶여 있음.
- BottomNav로 다른 탭으로 이동하면 컴포넌트 unmount로 `disconnect()`가 호출됨.
- 사용자 입장에서는 산책이 진행 중인데도 실시간 동기화가 끊길 수 있음.

## 현재 관찰된 이슈
- 탭 이동 시 WS 연결이 끊기고, 산책 화면 복귀 시 재연결됨.
- 연결 끊김/재연결 상태가 사용자에게 충분히 노출되지 않음.
- 명세상 메시지 타입(`ERROR`, `WALK_ENDED`, `BLOCK_OCCUPY_FAILED`)이 UI 흐름에서 부분 미처리 상태.

## 목표
- 산책이 `walking` 상태인 동안 페이지 이동과 무관하게 WS 연결을 유지한다.
- 연결 상태(연결 중/연결됨/재연결 중/실패)를 사용자에게 명확히 표시한다.
- 중복 연결, 무한 재연결, 조용한 실패를 방지한다.

## 제안 아키텍처
- 전역 manager 컴포넌트 도입(예: `widgets/WalkRealtimeManager`).
  - `app/layout` 또는 전역 providers에 1회 마운트.
  - `walkStore.walkMode`, `walkStore.walkId`를 구독해 연결 수명주기 제어.
- `useWalkControl`은 WS 생성/해제 책임을 제거하고, 화면 로직에 집중.
- WebSocket 클라이언트는 싱글턴 또는 단일 인스턴스 보장.

## 구현 가이드 (초안)
1. 전역 manager 생성
   - `walking && walkId`면 connect
   - `idle` 또는 종료 이벤트 수신 시 disconnect
2. 메시지 처리 일원화
   - `CONNECTED`, `ERROR`, `WALK_ENDED`, `BLOCK_OCCUPY_FAILED` 포함 처리
3. 상태 노출
   - 전역 store에 `wsStatus` 추가 (`disconnected | connecting | connected | reconnecting | error`)
   - 산책 관련 화면에 배너/토스트로 상태 안내
4. 안전장치
   - 중복 connect 방지
   - 재연결 백오프 및 최대 재시도 정책
   - 탭 이동/복귀 시 구독 중복 방지

## 인증 관련 메모
- `NEXT_PUBLIC_USE_BFF_AUTH=false`:
  - 로컬 저장 토큰(`dd_access_token`)을 WS `CONNECT Authorization` 헤더에 전달 필요.
- `NEXT_PUBLIC_USE_BFF_AUTH=true`:
  - 클라이언트 토큰 비소유 구조이므로, 장기적으로는 WS도 BFF 경유(프록시 또는 단기 토큰 발급) 설계 필요.

## 수용 기준 (Acceptance Criteria)
- 산책 중 BottomNav로 다른 탭 이동 후 1분 이상 유지해도 WS 연결이 끊기지 않는다.
- 산책 화면 복귀 시 중복 연결/중복 구독이 발생하지 않는다.
- 서버 `ERROR` 메시지 수신 시 사용자에게 즉시 오류가 표시된다.
- 산책 종료(`WALK_ENDED`) 수신 시 연결이 정상 정리된다.

## 테스트 체크리스트
- 정상 흐름: 연결 → 위치 전송 → 블록 점유/동기화 수신
- 탭 이동: walk → ranking/mypage → walk
- 네트워크 단절 후 복구: 오프라인/온라인 전환
- 인증 만료/부재: CONNECT 실패 시 안내 및 후속 동작
- 새로고침 복귀: `walking + walkId` 상태에서 자동 재연결
