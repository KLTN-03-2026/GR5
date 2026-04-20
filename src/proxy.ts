import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Các route công khai không cần auth
const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password", "/verify-otp", "/403"];
const AUTH_ONLY_REDIRECT = ["/login", "/register"]; // Đã login → redirect về /

export default async function proxy(req: NextRequest) {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;
  
  // Tránh check auth cho các tài nguyên tĩnh, API NextAuth
  if (
    pathname.startsWith("/_next") || 
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  // Dùng getToken thay vì auth() để tránh import prisma / mariadb vào Edge Runtime
  const token = await getToken({ 
    req, 
    secret: process.env.AUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });
  
  const isLoggedIn = !!token;
  const roles: string[] = (token?.roles as string[]) || [];

  // 1. Đã login mà vào trang login/register → redirect về trang chủ
  if (isLoggedIn && AUTH_ONLY_REDIRECT.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  // 2. Route /admin → phải có role ADMIN
  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(`/login?callbackUrl=${pathname}`, nextUrl));
    }
    if (!roles.includes("ADMIN")) {
      return NextResponse.redirect(new URL("/403", nextUrl));
    }
  }

  // 3. Route /staff → phải có role STAFF hoặc ADMIN
  if (pathname.startsWith("/staff")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(`/login?callbackUrl=${pathname}`, nextUrl));
    }
    if (!roles.includes("STAFF") && !roles.includes("ADMIN")) {
      return NextResponse.redirect(new URL("/403", nextUrl));
    }
  }

  // 4. Route /account → phải đăng nhập
  if (pathname.startsWith("/account")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(`/login?callbackUrl=${pathname}`, nextUrl));
    }
  }

  return NextResponse.next();
}

// Matcher: chạy middleware trên các route cần thiết (bỏ qua static files, api/auth)
export const config = {
  matcher: [
    "/admin/:path*",
    "/staff/:path*",
    "/account/:path*",
    "/login",
    "/register",
  ],
};
