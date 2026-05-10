import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decode } from "@auth/core/jwt";

const AUTH_SECRET = process.env.AUTH_SECRET!;

async function getSessionToken(req: NextRequest) {
  const cookieName = process.env.NODE_ENV === "production"
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";
  const token = req.cookies.get(cookieName)?.value;
  if (!token) return null;

  try {
    const payload = await decode({ token, secret: AUTH_SECRET, salt: cookieName });
    return payload;
  } catch {
    return null;
  }
}

const AUTH_ONLY_REDIRECT = ["/login", "/register"];

export default async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  const token = await getSessionToken(req);

  const isLoggedIn = !!token;
  const roles: string[] = (token?.roles as string[]) || [];

  const isAdmin = roles.includes("ADMIN");
  const isStaff = roles.includes("STAFF");
  const isThuKho = roles.includes("THU_KHO");

  // 1. Đã login mà vào trang login/register → redirect về đúng dashboard theo role
  if (isLoggedIn && AUTH_ONLY_REDIRECT.some((r) => pathname.startsWith(r))) {
    if (isAdmin) return NextResponse.redirect(new URL("/admin/overview", nextUrl));
    if (isThuKho) return NextResponse.redirect(new URL("/warehouse-manager", nextUrl));
    if (isStaff) return NextResponse.redirect(new URL("/staff/warehouse", nextUrl));
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  // 2. Nhân viên nội bộ (ADMIN, THU_KHO, STAFF) vào trang store → redirect về dashboard tương ứng
  if (isLoggedIn && (isAdmin || isThuKho || isStaff) && !pathname.startsWith("/api")) {
    const STORE_ROUTES = ["/products", "/cart", "/checkout", "/payment", "/orders", "/search", "/categories"];
    const isStorePath =
      pathname === "/" ||
      STORE_ROUTES.some((r) => pathname.startsWith(r));

    if (isStorePath) {
      if (isAdmin) return NextResponse.redirect(new URL("/admin/overview", nextUrl));
      if (isThuKho) return NextResponse.redirect(new URL("/warehouse-manager", nextUrl));
      if (isStaff) return NextResponse.redirect(new URL("/staff/warehouse", nextUrl));
    }
  }

  // 3. Route /admin → chỉ ADMIN
  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(`/login?callbackUrl=${pathname}`, nextUrl));
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/403", nextUrl));
    }
  }

  // 4. Route /warehouse-manager → THU_KHO hoặc ADMIN
  if (pathname.startsWith("/warehouse-manager")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(`/login?callbackUrl=${pathname}`, nextUrl));
    }
    if (!isThuKho && !isAdmin) {
      return NextResponse.redirect(new URL("/403", nextUrl));
    }
  }

  // 5. Route /staff → STAFF hoặc ADMIN
  if (pathname.startsWith("/staff")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(`/login?callbackUrl=${pathname}`, nextUrl));
    }
    if (!isStaff && !isAdmin) {
      return NextResponse.redirect(new URL("/403", nextUrl));
    }
    if (isStaff && !isAdmin) {
      const allowedPaths = ["/staff/warehouse", "/staff/map", "/staff/orders", "/staff/hr"];
      const isAllowed = allowedPaths.some((p) => pathname.startsWith(p)) || pathname === "/staff";
      if (!isAllowed) {
        return NextResponse.redirect(new URL("/403", nextUrl));
      }
    }
  }

  // 6. Route /account → phải đăng nhập
  if (pathname.startsWith("/account")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(`/login?callbackUrl=${pathname}`, nextUrl));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/products/:path*",
    "/categories/:path*",
    "/cart/:path*",
    "/checkout/:path*",
    "/payment/:path*",
    "/search/:path*",
    "/orders/:path*",
    "/admin/:path*",
    "/warehouse-manager/:path*",
    "/staff/:path*",
    "/account/:path*",
    "/login",
    "/register",
  ],
};
