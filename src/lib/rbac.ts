/**
 * RBAC Utility
 * Các hàm helper kiểm tra quyền trong cả Server và Client components
 */

export type AppRole = "ADMIN" | "STAFF" | "CUSTOMER" | "THU_KHO";

/** Kiểm tra user có ít nhất 1 trong các role yêu cầu không */
export function hasRole(userRoles: string[], ...required: AppRole[]): boolean {
  if (!userRoles || userRoles.length === 0) return false;
  return required.some((r) => userRoles.includes(r));
}

/** Lấy roles từ session.user (dùng ở Server Components) */
export function getRoles(sessionUser: any): string[] {
  return sessionUser?.roles ?? [];
}

/** Kiểm tra có phải Admin */
export function isAdmin(sessionUser: any): boolean {
  return hasRole(getRoles(sessionUser), "ADMIN");
}

/** Kiểm tra có phải Staff hoặc Admin */
export function isStaff(sessionUser: any): boolean {
  return hasRole(getRoles(sessionUser), "STAFF", "ADMIN");
}

/** Kiểm tra có phải Thủ Kho hoặc Admin */
export function isThuKho(sessionUser: any): boolean {
  return hasRole(getRoles(sessionUser), "THU_KHO", "ADMIN");
}

/** Kiểm tra đã đăng nhập */
export function isAuthenticated(session: any): boolean {
  return !!session?.user?.email;
}
