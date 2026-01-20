import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check for accessToken in cookies
    // const hasAccessToken = request.cookies.has('accessToken');

    // 1. Protected Routes: If no token, redirect to /login
    // We can define protected routes explicitly or exclude public ones.
    // Here we assume everything except public paths is protected.
    /*
    const isPublicPath =
        pathname === '/login' ||
        pathname.startsWith('/oauth') ||
        pathname === '/intro' || // Assuming there might be an intro page
        pathname.startsWith('/_next') ||
        pathname.startsWith('/static') ||
        pathname.includes('.'); // files like .png, .ico

    if (!isPublicPath && !hasAccessToken) {
        const loginUrl = new URL('/login', request.url);
        // loginUrl.searchParams.set('from', pathname); // Optional: remember where to redirect back
        return NextResponse.redirect(loginUrl);
    }

    // 2. Auth Pages: If already logged in, redirect away from login/callback
    if (hasAccessToken && (pathname === '/login' || pathname.startsWith('/oauth/kakao/callback'))) {
        return NextResponse.redirect(new URL('/walk', request.url));
    }
    */

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
