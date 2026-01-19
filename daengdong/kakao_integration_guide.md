# 백엔드 & 카카오 로그인 실연동 가이드

현재 구현된 코드는 "UI 및 로직의 뼈대"입니다. 실제로 서버와 통신하여 로그인을 완료하려면 아래 내용을 확인하고 수정해야 합니다.

## 1. 환경 변수 설정 (`.env`)
백엔드 API 주소를 환경 변수로 관리해야 합니다.
프로젝트 루트에 `.env` (또는 `.env.local`) 파일을 만들고 아래 내용을 추가하세요.

```env
NEXT_PUBLIC_API_BASE_URL=https://api.your-backend.com
```

## 2. 로그인 페이지 (`app/login/page.tsx`)
`handleKakaoLogin` 함수에서 백엔드의 카카오 인증 엔드포인트로 리다이렉트합니다.
백엔드 개발자에게 **"카카오 로그인 리다이렉트를 처리하는 GET API 주소"**를 물어보고 수정하세요.

```typescript
const handleKakaoLogin = () => {
    // 예: 백엔드가 /auth/kakao/login 으로 요청하면 302 Redirect로 카카오창을 띄워주는 경우
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/kakao/login`;
};
```

## 3. 콜백 페이지 (`app/oauth/kakao/callback/page.tsx`)
카카오 로그인 후 `code`를 받아 백엔드에 전송하는 로직입니다.
`mutationFn: kakaoLogin` 부분이 실제 API 호출입니다.

**체크할 점:**
1. 백엔드가 `POST` 요청으로 `code`를 받는지 확인하세요.
2. 응답 데이터(`data`)에 `accessToken`, `refreshToken`이 포함되어 있는지 확인하세요.

## 4. API 함수 (`shared/api/auth.ts`)
실제 API 요청 함수를 작성해야 합니다. (현재 파일이 없다면 생성 필요)

```typescript
// shared/api/auth.ts
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const kakaoLogin = async (code: string) => {
    // 백엔드 API 명세에 맞춰 경로와 파라미터 수정
    const response = await axios.post(`${BASE_URL}/auth/login/kakao`, {
        code: code,
    });
    return response.data; // { accessToken: '...', refreshToken: '...' }
};
```
