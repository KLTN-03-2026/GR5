/**
 * RBAC Utility
 * Các hàm helper kiểm tra quyền trong cả Server và Client components
 *
 * Bảng phân quyền:
 * ┌─────────────────────────────────┬───────┬─────────┬────────┐
 * │ Chức năng                       │ ADMIN │ THU_KHO │ STAFF  │
 * ├─────────────────────────────────┼───────┼─────────┼────────┤
 * │ Tạo đơn đặt hàng NCC            │  ✅   │   ✅    │        │
 * │ Duyệt thanh toán NCC lớn        │  ✅   │         │        │
 * │ Ghi nhận thanh toán NCC nhỏ     │       │   ✅    │        │
 * │ Quản lý thông tin NCC           │  ✅   │ Xem+Sửa │        │
 * │ Tạo phiếu nhập                  │       │   ✅    │  ✅    │
 * │ Duyệt phiếu nhập                │       │   ✅    │        │
 * │ Duyệt tiêu hủy hàng             │       │   ✅    │        │
 * │ Tạo khuyến mãi xả kho           │       │   ✅    │        │
 * │ Xem sơ đồ kho                   │  ✅   │   ✅    │  ✅    │
 * │ Xem báo cáo tổng doanh thu      │  ✅   │         │        │
 * │ Xem báo cáo nhập xuất kho       │  ✅   │   ✅    │        │
 * │ Quản lý nhân sự                 │  ✅   │         │        │
 * │ Xếp ca, duyệt nghỉ phép         │  ✅   │         │        │
 * └─────────────────────────────────┴───────┴─────────┴────────┘
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

/** Kiểm tra có phải Staff (STAFF hoặc ADMIN) */
export function isStaff(sessionUser: any): boolean {
  return hasRole(getRoles(sessionUser), "STAFF", "ADMIN");
}

/** Kiểm tra có phải Thủ Kho (THU_KHO hoặc ADMIN) */
export function isThuKho(sessionUser: any): boolean {
  return hasRole(getRoles(sessionUser), "THU_KHO", "ADMIN");
}

/** Kiểm tra có phải STAFF thuần (không phải ADMIN) */
export function isStaffOnly(sessionUser: any): boolean {
  const roles = getRoles(sessionUser);
  return roles.includes("STAFF") && !roles.includes("ADMIN");
}

/** Kiểm tra đã đăng nhập */
export function isAuthenticated(session: any): boolean {
  return !!session?.user?.email;
}

// ── Quyền chi tiết theo chức năng ──────────────────────────────────────────

/** Tạo đơn đặt hàng NCC: ADMIN + THU_KHO */
export function canCreateSupplierOrder(sessionUser: any): boolean {
  return hasRole(getRoles(sessionUser), "ADMIN", "THU_KHO");
}

/** Duyệt thanh toán NCC lớn: chỉ ADMIN */
export function canApprovePayment(sessionUser: any): boolean {
  return hasRole(getRoles(sessionUser), "ADMIN");
}

/** Ghi nhận thanh toán NCC nhỏ: THU_KHO (ADMIN cũng được) */
export function canRecordSmallPayment(sessionUser: any): boolean {
  return hasRole(getRoles(sessionUser), "ADMIN", "THU_KHO");
}

/** Tạo phiếu nhập: THU_KHO + STAFF (ADMIN cũng được) */
export function canCreateImportReceipt(sessionUser: any): boolean {
  return hasRole(getRoles(sessionUser), "ADMIN", "THU_KHO", "STAFF");
}

/** Duyệt phiếu nhập: THU_KHO (ADMIN cũng được) */
export function canApproveReceipt(sessionUser: any): boolean {
  return hasRole(getRoles(sessionUser), "ADMIN", "THU_KHO");
}

/** Duyệt tiêu hủy + Tạo khuyến mãi xả kho: THU_KHO (ADMIN cũng được) */
export function canManageDisposal(sessionUser: any): boolean {
  return hasRole(getRoles(sessionUser), "ADMIN", "THU_KHO");
}

/** Xem sơ đồ kho: tất cả nội bộ (ADMIN, THU_KHO, STAFF) */
export function canViewWarehouseMap(sessionUser: any): boolean {
  return hasRole(getRoles(sessionUser), "ADMIN", "THU_KHO", "STAFF");
}

/** Xem báo cáo tổng doanh thu: chỉ ADMIN */
export function canViewRevenueReport(sessionUser: any): boolean {
  return hasRole(getRoles(sessionUser), "ADMIN");
}

/** Xem báo cáo nhập xuất kho: ADMIN + THU_KHO */
export function canViewWarehouseReport(sessionUser: any): boolean {
  return hasRole(getRoles(sessionUser), "ADMIN", "THU_KHO");
}

/** Quản lý nhân sự, xếp ca, duyệt nghỉ phép: chỉ ADMIN */
export function canManageHR(sessionUser: any): boolean {
  return hasRole(getRoles(sessionUser), "ADMIN");
}
