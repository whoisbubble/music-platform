import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function decodePayload(token: string) {
  try {
    const [, payload] = token.split(".");
    if (!payload) {
      return null;
    }

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const decoded = JSON.parse(atob(padded));
    return decoded as { roles?: string[] };
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
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

  if (isProtectedPage && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/", request.url));
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
