import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "music_platform_token";

function decodePayload(token: string) {
  try {
    const [, payload] = token.split(".");
    if (!payload) {
      return null;
    }

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const decoded = JSON.parse(atob(padded));
    return decoded as { roles?: string[]; exp?: number };
  } catch {
    return null;
  }
}

function isTokenUsable(token: string) {
  const payload = decodePayload(token);
  if (!payload) {
    return false;
  }

  return !payload.exp || payload.exp * 1000 > Date.now();
}

export function proxy(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const pathname = request.nextUrl.pathname;

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isProtectedPage =
    pathname === "/" ||
    pathname.startsWith("/search") ||
    pathname.startsWith("/album") ||
    pathname.startsWith("/collection") ||
    pathname.startsWith("/library") ||
    pathname.startsWith("/chat") ||
    pathname.startsWith("/admin");

  if (isProtectedPage && (!token || !isTokenUsable(token))) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete(AUTH_COOKIE_NAME);
    response.cookies.delete("token");
    return response;
  }

  if (isAuthPage && token && !isTokenUsable(token)) {
    const response = NextResponse.next();
    response.cookies.delete(AUTH_COOKIE_NAME);
    response.cookies.delete("token");
    return response;
  }

  if (pathname.startsWith("/admin") && token) {
    const payload = decodePayload(token);
    const roles = payload?.roles ?? [];

    if (!roles.includes("admin")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/search/:path*",
    "/album/:path*",
    "/collection/:path*",
    "/library/:path*",
    "/chat/:path*",
    "/admin/:path*",
  ],
};
