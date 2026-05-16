import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Simulate FEFO allocation cho 1 đơn hàng (DRY RUN - không thay đổi DB)
// GET /api/test/fefo/simulate?order_id=123
// GET /api/test/fefo/simulate?bien_the=5&so_luong=3&tinh=48
export async function GET(req: NextRequest) {
  try {
    const orderId = req.nextUrl.searchParams.get("order_id");
    const bienTheParam = req.nextUrl.searchParams.get("bien_the");
    const soLuongParam = req.nextUrl.searchParams.get("so_luong");
    const tinhParam = req.nextUrl.searchParams.get("tinh");

    const today = new Date();

    // Classify helper
    function classify(provinceId: number): "GAN" | "TRUNG" | "XA" {
      if (provinceId === 48 || provinceId === 203) return "GAN";
      const mienTrung = [46, 49, 51, 52, 54, 56, 44, 45, 223, 243, 218, 219, 221, 224, 225];
      if (mienTrung.includes(provinceId)) return "TRUNG";
      return "XA";
    }

    function getMinDays(zone: "GAN" | "TRUNG" | "XA"): number {
      return zone === "GAN" ? 1 : zone === "TRUNG" ? 3 : 5;
    }

    // Mode 1: Simulate cho đơn hàng thực
    if (orderId) {
      const order = await prisma.don_hang.findUnique({
        where: { id: Number(orderId) },
        include: {
          chi_tiet_don_hang: {
            include: { bien_the_san_pham: { include: { san_pham: true } } },
          },
        },
      });
      if (!order) return NextResponse.json({ error: "Không tìm thấy đơn hàng" }, { status: 404 });

      const loaiDon = classify(order.ma_tinh_ghn ?? 0);
      const minDays = getMinDays(loaiDon);

      const allocations = [];
      for (const item of order.chi_tiet_don_hang) {
        if (!item.ma_bien_the) continue;
        const result = await simulateAllocation(item.ma_bien_the, item.so_luong ?? 1, minDays, today);
        allocations.push({
          san_pham: item.bien_the_san_pham?.san_pham?.ten_san_pham,
          bien_the: item.bien_the_san_pham?.ten_bien_the,
          yeu_cau: item.so_luong ?? 1,
          ...result,
        });
      }

      return NextResponse.json({
        mode: "order",
        order_id: Number(orderId),
        loai_don: loaiDon,
        min_days_hsd: minDays,
        packing: loaiDon === "XA" ? "DONG_GOI_LANH + DA_KHO" : loaiDon === "TRUNG" ? "GIU_NHIET" : "BINH_THUONG",
        allocations,
        summary: {
          total_items: allocations.length,
          all_sufficient: allocations.every((a) => a.sufficient),
          items_insufficient: allocations.filter((a) => !a.sufficient).map((a) => a.san_pham),
        },
      });
    }

    // Mode 2: Simulate cho biến thể cụ thể
    if (bienTheParam) {
      const bienThe = Number(bienTheParam);
      const soLuong = Number(soLuongParam) || 1;
      const provinceId = Number(tinhParam) || 48;

      const loaiDon = classify(provinceId);
      const minDays = getMinDays(loaiDon);

      const result = await simulateAllocation(bienThe, soLuong, minDays, today);

      // Lấy tên SP
      const bt = await prisma.bien_the_san_pham.findUnique({
        where: { id: bienThe },
        include: { san_pham: true },
      });

      return NextResponse.json({
        mode: "variant",
        san_pham: bt?.san_pham?.ten_san_pham,
        bien_the: bt?.ten_bien_the,
        province_id: provinceId,
        loai_don: loaiDon,
        min_days_hsd: minDays,
        yeu_cau: soLuong,
        ...result,
      });
    }

    return NextResponse.json({
      usage: {
        "Mode 1 - By Order": "GET /api/test/fefo/simulate?order_id=123",
        "Mode 2 - By Variant": "GET /api/test/fefo/simulate?bien_the=5&so_luong=3&tinh=48",
      },
      zones: {
        "48, 203": "GAN (min 1 ngày HSD)",
        "44-56, 218-225, 243": "TRUNG (min 3 ngày HSD)",
        "Còn lại": "XA (min 5 ngày HSD)",
      },
    });
  } catch (err: any) {
    console.error("[TEST FEFO SIMULATE]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

async function simulateAllocation(
  maBienThe: number,
  soLuongYeuCau: number,
  minDaysLeft: number,
  today: Date
) {
  const tonKhoList = await prisma.ton_kho_tong.findMany({
    where: {
      so_luong: { gt: 0 },
      lo_hang: {
        ma_bien_the: maBienThe,
        trang_thai: { notIn: ["DA_TIEU_HUY", "TRA_NCC"] },
      },
    },
    include: { lo_hang: true, vi_tri_kho: true },
    orderBy: { lo_hang: { han_su_dung: "asc" } },
  });

  // Tất cả lô (bao gồm không đủ HSD)
  const allLots = tonKhoList.map((tk) => {
    const hsd = tk.lo_hang?.han_su_dung ? new Date(tk.lo_hang.han_su_dung) : null;
    const daysLeft = hsd ? Math.ceil((hsd.getTime() - today.getTime()) / 86400000) : null;
    return {
      lo_hang: tk.lo_hang?.ma_lo_hang,
      han_su_dung: hsd?.toLocaleDateString("vi-VN"),
      days_left: daysLeft,
      so_luong: tk.so_luong,
      vi_tri: [tk.vi_tri_kho?.khu_vuc, tk.vi_tri_kho?.day, tk.vi_tri_kho?.ke, tk.vi_tri_kho?.tang].filter(Boolean).join("/"),
      eligible: daysLeft === null || daysLeft >= minDaysLeft,
      reason_if_not: daysLeft !== null && daysLeft < minDaysLeft
        ? `HSD còn ${daysLeft} ngày < yêu cầu ${minDaysLeft} ngày`
        : null,
    };
  });

  // Lô đủ điều kiện
  const eligible = allLots.filter((l) => l.eligible);
  const totalAvailable = eligible.reduce((s, l) => s + (l.so_luong ?? 0), 0);

  // Phân bổ FEFO
  let remaining = soLuongYeuCau;
  const allocation = eligible.map((lot) => {
    if (remaining <= 0) return { ...lot, allocate: 0 };
    const allocate = Math.min(lot.so_luong ?? 0, remaining);
    remaining -= allocate;
    return { ...lot, allocate };
  }).filter((l) => l.allocate > 0);

  return {
    all_lots: allLots,
    eligible_lots: eligible.length,
    rejected_lots: allLots.filter((l) => !l.eligible),
    total_available: totalAvailable,
    sufficient: totalAvailable >= soLuongYeuCau,
    shortage: totalAvailable < soLuongYeuCau ? soLuongYeuCau - totalAvailable : 0,
    fefo_allocation: allocation,
  };
}
