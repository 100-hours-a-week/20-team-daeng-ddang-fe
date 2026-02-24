import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 인증이 필요 없는 경로
    const publicPaths = [
        '/login',
        '/healthcheck',
        '/oauth/kakao/callback',
        '/walk',
        '/_next',
        '/favicon.ico',
        '/images',
        '/test/websocket',
        '/map-proxy/static-map',
    ];

    const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

    const hasAuthCookie = request.cookies.has('isLoggedIn');

    if (!isPublicPath && !hasAuthCookie && pathname !== '/terms') {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    if (pathname === '/login' && hasAuthCookie) {
        const url = request.nextUrl.clone();
        url.pathname = '/walk';
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    // 미들웨어 적용 경로
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
        '/map-proxy/static-map',
    ],
};
