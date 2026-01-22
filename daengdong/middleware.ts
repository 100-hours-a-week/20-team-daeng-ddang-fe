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

    if (!isPublicPath && !hasAccessToken) {
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
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
