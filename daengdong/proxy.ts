import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 전체 헤더 대신, 필요한 것만 직접 추출하여 객체 생성
    const filteredHeaders = {
        "x-forwarded-for": request.headers.get("x-forwarded-for"),
        "x-caddy-source": request.headers.get("x-caddy-source") // Caddyfile의 header_up 이름과 일치시켜주세요
    };

    // 인증이 필요 없는 경로
    const publicPaths = [
        '/',
        '/login',
        '/healthcheck',
        '/oauth/kakao/callback',
        '/_next',
        '/favicon.ico',
        '/images',
        '/test/websocket',
        '/map-proxy/static-map',
        '/walk',
        '/ranking',
        '/healthcare',
        '/mypage',
        '/footprints'
    ];

    const isPublicPath = publicPaths.some(path =>
        path === '/' ? pathname === '/' : pathname.startsWith(path)
    );

    const hasAuthCookie = request.cookies.has('dd_sid');

    if (!isPublicPath && !hasAuthCookie && pathname !== '/terms') {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    // 미들웨어 적용 경로
    matcher: [
        '/((?!api|bff|next-api|_next/static|_next/image|favicon.ico).*)',
        '/map-proxy/static-map',
    ],
};
