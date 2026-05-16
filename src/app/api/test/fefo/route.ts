import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Test FEFO Distance-Aware — GET /api/test/fefo
// Kiểm tra toàn bộ logic FEFO theo khoảng cách giao hàng
export async function GET(req: NextRequest) {
  try {
    const today = new Date();

    // 1. Kiểm tra tồn kho hiện tại (lô có HSD)
    const tonKho = await prisma.ton_kho_tong.findMany({
      where: { so_luong: { gt: 0 } },
      include: {
        lo_hang: {
          include: { bien_the_san_pham: { include: { san_pham: true } } },
        },
        vi_tri_kho: true,
      },
      orderBy: { lo_hang: { han_su_dung: "asc" } },
      take: 50,
    });

    const inventory = tonKho.map((tk) => {
      const hsd = tk.lo_hang?.han_su_dung ? new Date(tk.lo_hang.han_su_dung) : null;
      const daysLeft = hsd ? Math.ceil((hsd.getTime() - today.getTime()) / 86400000) : null;
      return {
        ton_kho_id: tk.id,
        lo_hang: tk.lo_hang?.ma_lo_hang,
        san_pham: tk.lo_hang?.bien_the_san_pham?.san_pham?.ten_san_pham ?? "?",
        bien_the: tk.lo_hang?.bien_the_san_pham?.ten_bien_the ?? "?",
        so_luong: tk.so_luong,
        han_su_dung: hsd?.toLocaleDateString("vi-VN"),
        days_left: daysLeft,
        vi_tri: [tk.vi_tri_kho?.khu_vuc, tk.vi_tri_kho?.day, tk.vi_tri_kho?.ke, tk.vi_tri_kho?.tang].filter(Boolean).join(" / "),
        fefo_eligible: {
          GAN: daysLeft === null || daysLeft >= 1,
          TRUNG: daysLeft === null || daysLeft >= 3,
          XA: daysLeft === null || daysLeft >= 5,
        },
      };
    });

    // 2. Kiểm tra đơn đang chờ giao + phân loại
    const pendingOrders = await prisma.don_hang.findMany({
      where: { trang_thai: "CHO_GIAO_HANG" },
      include: {
        chi_tiet_don_hang: {
          include: { bien_the_san_pham: { include: { san_pham: true } } },
        },
        phieu_xuat_kho: {
          include: { chi_tiet_phieu_xuat: { include: { kien_hang_da_xuat: true } } },
        },
      },
      take: 20,
      orderBy: { ngay_tao: "desc" },
    });

    const orders = pendingOrders.map((order) => {
      const provinceId = order.ma_tinh_ghn ?? 0;
      const mienTrung = [46, 49, 51, 52, 54, 56, 44, 45, 223, 243, 218, 219, 221, 224, 225];
      let loaiDon: "GAN" | "TRUNG" | "XA" = "XA";
      if (provinceId === 48 || provinceId === 203) loaiDon = "GAN";
      else if (mienTrung.includes(provinceId)) loaiDon = "TRUNG";

      const minDays = loaiDon === "GAN" ? 1 : loaiDon === "TRUNG" ? 3 : 5;

      const phieu = order.phieu_xuat_kho[0];
      const tongYeuCau = phieu?.chi_tiet_phieu_xuat.reduce((s, ct) => s + ct.so_luong_yeu_cau, 0) ?? 0;
      const tongDaXuat = phieu?.chi_tiet_phieu_xuat.reduce((s, ct) => s + (ct.kien_hang_da_xuat?.length ?? 0), 0) ?? 0;

      return {
        don_hang_id: order.id,
        ma_don: `DH${String(order.id).padStart(4, "0")}`,
        nguoi_nhan: order.ho_ten_nguoi_nhan,
        dia_chi: order.dia_chi_giao_hang,
        ma_tinh_ghn: provinceId,
        loai_don: loaiDon,
        min_days_hsd: minDays,
        packing: loaiDon === "XA" ? "DONG_GOI_LANH" : loaiDon === "TRUNG" ? "GIU_NHIET" : "BINH_THUONG",
        san_phams: order.chi_tiet_don_hang.map((ct) => ({
          ten: ct.bien_the_san_pham?.san_pham?.ten_san_pham,
          bien_the: ct.bien_the_san_pham?.ten_bien_the,
          so_luong: ct.so_luong,
        })),
        tien_do_xuat: { da_xuat: tongDaXuat, tong: tongYeuCau },
        co_phieu_xuat: !!phieu,
      };
    });

    // 3. Cảnh báo HSD
    const warnings = await prisma.canh_bao_lo_hang.findMany({
      where: { da_xu_ly: false },
      include: {
        lo_hang: {
          include: { bien_the_san_pham: { include: { san_pham: true } } },
        },
      },
      orderBy: { ngay_tao: "desc" },
      take: 10,
    });

    const expiryWarnings = warnings.map((w) => ({
      id: w.id,
      lo_hang: w.lo_hang?.ma_lo_hang,
      san_pham: w.lo_hang?.bien_the_san_pham?.san_pham?.ten_san_pham,
      loai_canh_bao: w.loai_canh_bao,
      han_su_dung: w.lo_hang?.han_su_dung?.toLocaleDateString("vi-VN"),
      ngay_tao: w.ngay_tao?.toLocaleDateString("vi-VN"),
    }));

    // 4. Tổng hợp FEFO health
    const totalLots = tonKho.length;
    const expiredLots = inventory.filter((i) => i.days_left !== null && i.days_left <= 0).length;
    const urgentLots = inventory.filter((i) => i.days_left !== null && i.days_left > 0 && i.days_left <= 3).length;
    const healthyLots = totalLots - expiredLots - urgentLots;

    return NextResponse.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      fefo_summary: {
        total_lots_in_stock: totalLots,
        expired: expiredLots,
        urgent_3days: urgentLots,
        healthy: healthyLots,
        pending_orders: orders.length,
        orders_by_zone: {
          GAN: orders.filter((o) => o.loai_don === "GAN").length,
          TRUNG: orders.filter((o) => o.loai_don === "TRUNG").length,
          XA: orders.filter((o) => o.loai_don === "XA").length,
        },
        unresolved_warnings: expiryWarnings.length,
      },
      fefo_rules: {
        GAN: { label: "Nội thành Đà Nẵng (mã tỉnh 48, 203)", min_days_hsd: 1, packing: "Bình thường" },
        TRUNG: { label: "Miền Trung (mã tỉnh 44-56, 218-225, 243)", min_days_hsd: 3, packing: "Túi giữ nhiệt" },
        XA: { label: "Toàn quốc (còn lại)", min_days_hsd: 5, packing: "Túi giữ nhiệt + đá khô" },
      },
      inventory,
      pending_orders: orders,
      expiry_warnings: expiryWarnings,
    });
  } catch (err: any) {
    console.error("[TEST FEFO]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
