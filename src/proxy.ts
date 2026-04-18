export { auth as proxy } from "@/lib/auth";

export const config = {
  // Cấu hình để không chặn các file hệ thống và ảnh
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
