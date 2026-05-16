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
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/store") ||
    pathname.startsWith("/api/chat") ||
    pathname.startsWith("/api/cai-dat-vi-tri")
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
    const STORE_ROUTES = ["/products", "/checkout", "/search", "/categories"];
    // /cart và /payment: cho phép nếu có query ?admin_preview để xem demo
    const isStorePath =
      pathname === "/" ||
      STORE_ROUTES.some((r) => pathname.startsWith(r));

    if (isStorePath) {
      if (isAdmin) return NextResponse.redirect(new URL("/admin/overview", nextUrl));
      if (isThuKho) return NextResponse.redirect(new URL("/warehouse-manager", nextUrl));
      if (isStaff) return NextResponse.redirect(new URL("/staff/warehouse", nextUrl));
    }
  }

  // 3a. Route /payment → phải đăng nhập (mọi role đều được vào)
  if (pathname.startsWith("/payment") && !isLoggedIn) {
    return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, nextUrl));
  }

  const INTERNAL_WAREHOUSE_API_PREFIXES = [
    "/api/admin/warehouse/inventory",
    "/api/admin/warehouse/import",
    "/api/admin/warehouse/issue",
    "/api/admin/warehouse/alerts",
    "/api/admin/warehouse/warnings",
    "/api/admin/warehouse/map",
    "/api/admin/warehouse/zones",
    "/api/admin/warehouse/history",
    "/api/admin/warehouse/export-receipt",
    "/api/admin/warehouse/vi-tri-available",
    "/api/admin/warehouse/upload/evidence",
    "/api/admin/warehouse/receiving",
    "/api/admin/warehouse/qc",
  ];

  // API PROTECTION: các API vận hành kho dùng chung cho ADMIN, THU_KHO và STAFF
  if (INTERNAL_WAREHOUSE_API_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    if (!isLoggedIn || (!isAdmin && !isThuKho && !isStaff)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // API phụ trợ cho màn hình kho staff: chỉ cho nội bộ đọc danh sách sản phẩm/NCC
  if (
    req.method === "GET" &&
    (pathname.startsWith("/api/admin/products") || pathname.startsWith("/api/admin/ncc"))
  ) {
    if (!isLoggedIn || (!isAdmin && !isThuKho && !isStaff)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // API PROTECTION: /api/admin → chỉ ADMIN
  if (pathname.startsWith("/api/admin")) {
    if (!isLoggedIn || !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // API PROTECTION: /api/staff → STAFF, THU_KHO hoặc ADMIN
  if (pathname.startsWith("/api/staff")) {
    if (!isLoggedIn || (!isStaff && !isThuKho && !isAdmin)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  // 5. Route /staff → STAFF, THU_KHO hoặc ADMIN
  if (pathname.startsWith("/staff")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(`/login?callbackUrl=${pathname}`, nextUrl));
    }
    if (!isStaff && !isThuKho && !isAdmin) {
      return NextResponse.redirect(new URL("/403", nextUrl));
    }
    if ((isStaff || isThuKho) && !isAdmin) {
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
    "/api/admin/:path*",
    "/api/staff/:path*",
  ],
};
