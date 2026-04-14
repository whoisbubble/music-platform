// frontend/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // 1. Достаем токен из кук запроса
    const token = request.cookies.get('token')?.value;

    // 2. Определяем, куда юзер хочет пойти
    const isLibraryPage = request.nextUrl.pathname.startsWith('/library');
    const isSearchPage = request.nextUrl.pathname.startsWith('/search');
    const isAlbumPage = request.nextUrl.pathname.startsWith('/album');
    const isArtistsPage = request.nextUrl.pathname.startsWith('/artists');
    const isMainPage = request.nextUrl.pathname === '/';
    const isLoginPage = request.nextUrl.pathname.startsWith('/login');
    const isRegisterPage = request.nextUrl.pathname.startsWith('/register');

    // 3. ЛОГИКА ЗАЩИТЫ:
    // Если юзер идет в библиотеку БЕЗ токена -> на логин
    if (isLibraryPage && !token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (isArtistsPage && !token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (isSearchPage && !token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (isAlbumPage && !token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (isMainPage && !token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Если юзер УЖЕ залогинен и идет на логин/регистрацию -> на главную
    if ((isLoginPage || isRegisterPage) && token) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next(); // Пропускаем дальше
}

// Указываем, на какие пути должен срабатывать этот фильтр
export const config = {
    matcher: ['/library/:path*', '/login', '/register', '/search/:path*', '/album/:path*', '/', '/artists/:path*'],
};