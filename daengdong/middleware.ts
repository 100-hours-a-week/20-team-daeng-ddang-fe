import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    // TODO: 쿠키 액세스 토큰 기반 인증 미들웨어 구현 
    /*
    const isPublicPath =
        pathname === '/login' ||
        pathname.startsWith('/oauth') ||
        pathname === '/intro' ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/static') ||
        pathname.includes('.');

    // 인증이 필요 없는 경로
    const publicPaths = [
        '/login',
        '/oauth/kakao/callback',
        '/walk',
        '/snapshot',
        '/_next',
        '/favicon.ico',
        '/images',
        '/test/websocket'
    ];

    const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

    const hasAuthCookie = request.cookies.has('isLoggedIn');

    if (!isPublicPath && !hasAuthCookie) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    if (hasAccessToken && (pathname === '/login' || pathname.startsWith('/oauth/kakao/callback'))) {
        return NextResponse.redirect(new URL('/walk', request.url));
    }
    */

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
