import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 인증이 필요 없는 경로
    const publicPaths = [
        '/login',
        '/oauth/kakao/callback',
        '/walk',
        '/_next',
        '/favicon.ico',
        '/images',
    ];

    const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

    const hasRefreshToken = request.cookies.has('refreshToken'); // TODO: 백엔드 리프레시 토큰 이름 확인 필요

    if (!isPublicPath && !hasRefreshToken) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    if (pathname === '/login' && hasRefreshToken) {
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
    ],
};
