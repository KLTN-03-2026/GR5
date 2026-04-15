import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ═══════════════════════════════════════════════
// GET — Gợi ý lô theo FEFO cho một sản phẩm
// GET /api/admin/warehouse/issue/suggest?ma_bien_the=X&so_luong=Y
// ═══════════════════════════════════════════════
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const maBienThe = Number(searchParams.get("ma_bien_the"));
  const soLuong   = Number(searchParams.get("so_luong") || 0);

  if (!maBienThe) return NextResponse.json({ lo_list: [], du_hang: false });

  // Lấy tất cả lô hàng của sản phẩm này, còn hàng, sắp xếp FEFO (HSD sớm nhất trước)
  const tonKho = await prisma.ton_kho_tong.findMany({
    where: {
      so_luong: { gt: 0 },
      lo_hang: {
        ma_bien_the: maBienThe,
        trang_thai: { notIn: ["DA_TIEU_HUY", "TRA_NCC"] },
      },
    },
    include: {
      lo_hang: { include: { bien_the_san_pham: { select: { ten_bien_the: true } } } },
      vi_tri_kho: true,
    },
    orderBy: { lo_hang: { han_su_dung: "asc" } },
    take: 10,
  });

  const totalStock = tonKho.reduce((s, t) => s + (t.so_luong ?? 0), 0);
  const duHang = totalStock >= soLuong;

  // Build gợi ý: lô đầu tiên là XUẤT TRƯỚC, còn lại là dự phòng
  let conLai = soLuong;
  const lo_list = tonKho.map((t, idx) => {
    const canXuat = Math.min(t.so_luong ?? 0, conLai);
    conLai = Math.max(0, conLai - canXuat);
    const hsd = t.lo_hang?.han_su_dung ? new Date(t.lo_hang.han_su_dung) : null;
    const today = new Date();
    const daysLeft = hsd ? Math.ceil((hsd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;

    return {
      ton_kho_id: t.id,
      ma_lo_hang: t.lo_hang?.ma_lo_hang,
      lo_hang_id: t.lo_hang?.id,
      san_pham: t.lo_hang?.bien_the_san_pham?.ten_bien_the,
      han_su_dung: hsd?.toLocaleDateString("vi-VN"),
      han_su_dung_raw: hsd?.toISOString(),
      days_left: daysLeft,
      so_luong_ton: t.so_luong,
      so_luong_xuat_goi_y: canXuat,
      vi_tri: [t.vi_tri_kho?.khu_vuc, t.vi_tri_kho?.day, t.vi_tri_kho?.ke, t.vi_tri_kho?.tang]
        .filter(Boolean).join(" — "),
      vi_tri_id: t.vi_tri_kho?.id,
      la_uu_tien: idx === 0,
      urgent: daysLeft !== null && daysLeft <= 7,
    };
  });

  return NextResponse.json({ lo_list, total_ton: totalStock, du_hang: duHang, thieu: Math.max(0, soLuong - totalStock) });
}

// ═══════════════════════════════════════════════
// POST — Xuất kho đa chế độ
// Body: { mode, ... }
//   mode = "qr"      → { qrCode }
//   mode = "manual"  → { ma_bien_the, so_luong, ma_don_hang? }
//   mode = "order"   → { ma_don_hang, items: [{ ma_bien_the, so_luong }] }
//   mode = "partial" → { ma_bien_the, so_luong_xuat, ma_don_hang? } (xác nhận thiếu hàng)
// ═══════════════════════════════════════════════
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { mode } = body;

    // ─── MODE: QR Scan ───────────────────────────────────────────
    if (mode === "qr") {
      const { qrCode } = body;
      if (!qrCode) return NextResponse.json({ error: "Thiếu mã QR" }, { status: 400 });
      const { WarehouseService } = await import("@/services/admin/warehouse.service");
      const result = await WarehouseService.scanAndIssueItem(qrCode, body.ma_don_hang || 1);
      return NextResponse.json({ success: true, message: result.message, mode: "qr" });
    }

    // ─── MODE: Manual (chọn lô từ danh sách) ────────────────────
    if (mode === "manual" || mode === "partial") {
      const { ma_bien_the, so_luong, ma_don_hang, force_partial } = body;
      if (!ma_bien_the || !so_luong) return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });

      // Lấy danh sách tồn kho theo FEFO
      const tonKhoDsFefo = await prisma.ton_kho_tong.findMany({
        where: {
          so_luong: { gt: 0 },
          lo_hang: { ma_bien_the: Number(ma_bien_the), trang_thai: { notIn: ["DA_TIEU_HUY", "TRA_NCC"] } },
        },
        include: { lo_hang: true, vi_tri_kho: true },
        orderBy: { lo_hang: { han_su_dung: "asc" } },
      });

      const totalTon = tonKhoDsFefo.reduce((s, t) => s + (t.so_luong ?? 0), 0);
      const yeuCau   = Number(so_luong);

      // Kiểm tra thiếu hàng
      if (totalTon < yeuCau && !force_partial) {
        return NextResponse.json({
          error: "Không đủ hàng",
          insufficient: true,
          thieu: yeuCau - totalTon,
          ton_kho: totalTon,
          yeu_cau: yeuCau,
        }, { status: 409 });
      }

      // Tạo phiếu xuất
      const phieuXuat = await prisma.phieu_xuat_kho.create({
        data: {
          ly_do_xuat: mode === "partial" ? "XUAT_MOT_PHAN" : "XUAT_THU_CONG",
          trang_thai: "HOAN_THANH",
          ngay_tao: new Date(),
          ...(ma_don_hang && { ma_don_hang: Number(ma_don_hang) }),
        },
      });

      // Trừ tồn theo FEFO
      let conLai = Math.min(yeuCau, totalTon);
      const xuat_items: string[] = [];

      await prisma.$transaction(async (tx) => {
        for (const tk of tonKhoDsFefo) {
          if (conLai <= 0) break;
          const tru = Math.min(conLai, tk.so_luong ?? 0);
          await tx.ton_kho_tong.update({ where: { id: tk.id }, data: { so_luong: { decrement: tru } } });

          // Ghi lịch sử xuất: lấy các thùng TRONG_KHO của lô này
          const thungs = await tx.kien_hang_chi_tiet.findMany({
            where: { ma_lo_hang: tk.lo_hang?.id ?? 0, trang_thai: "TRONG_KHO", ma_vi_tri: tk.vi_tri_kho?.id },
            take: tru,
          });
          // tk.lo_hang IS included via outer query — use it for ma_bien_the
          const maBienTheFromLo = tk.lo_hang?.ma_bien_the;
          for (const t of thungs) {
            await tx.kien_hang_chi_tiet.update({ where: { id: t.id }, data: { trang_thai: "DA_XUAT" } });
            if (t.ma_lo_hang && maBienTheFromLo) {
              await tx.kien_hang_da_xuat.create({
                data: {
                  ma_phieu_xuat: phieuXuat.id,
                  ma_vach_quet: t.ma_vach_quet,
                  ma_bien_the: maBienTheFromLo,
                  ngay_xuat: new Date(),
                },
              }).catch(() => null); // ignore if insert fails (e.g. constraint)
            }
          }
          xuat_items.push(`${tk.lo_hang?.ma_lo_hang}: ${tru} thùng`);
          conLai -= tru;
        }
      });

      return NextResponse.json({
        success: true,
        message: `Đã xuất ${Math.min(yeuCau, totalTon)} thùng theo FEFO. ${xuat_items.join(", ")}`,
        phieu_id: phieuXuat.id,
        xuat_items,
        partial: totalTon < yeuCau,
        thieu: Math.max(0, yeuCau - totalTon),
      });
    }

    // ─── MODE: Theo đơn hàng ──────────────────────────────────────
    if (mode === "order") {
      const { ma_don_hang } = body;
      if (!ma_don_hang) return NextResponse.json({ error: "Thiếu mã đơn hàng" }, { status: 400 });

      // Lấy chi tiết đơn hàng
      const donHang = await prisma.don_hang.findUnique({
        where: { id: Number(ma_don_hang) },
        include: {
          chi_tiet_don_hang: { include: { bien_the_san_pham: { select: { id: true, ten_bien_the: true } } } },
        },
      });
      if (!donHang) return NextResponse.json({ error: "Không tìm thấy đơn hàng" }, { status: 404 });

      // Với mỗi sản phẩm trong đơn, gợi ý lô FEFO
      const suggestions = await Promise.all(
        (donHang.chi_tiet_don_hang || []).map(async (ct) => {
          const maBienThe = ct.ma_bien_the;
          const soLuong   = ct.so_luong || 0;
          const tonKho = await prisma.ton_kho_tong.findMany({
            where: { so_luong: { gt: 0 }, lo_hang: { ma_bien_the: maBienThe ?? undefined } },
            include: { lo_hang: true, vi_tri_kho: true },
            orderBy: { lo_hang: { han_su_dung: "asc" } },
            take: 3,
          });
          return {
            ma_bien_the: maBienThe,
            ten_san_pham: ct.bien_the_san_pham?.ten_bien_the,
            so_luong_yeu_cau: soLuong,
            total_ton: tonKho.reduce((s, t) => s + (t.so_luong ?? 0), 0),
            fefo_suggestions: tonKho.map((t, i) => ({
              la_uu_tien: i === 0,
              ma_lo: t.lo_hang?.ma_lo_hang,
              han_su_dung: t.lo_hang?.han_su_dung?.toLocaleDateString("vi-VN"),
              vi_tri: [t.vi_tri_kho?.khu_vuc, t.vi_tri_kho?.day, t.vi_tri_kho?.ke].filter(Boolean).join("-"),
              so_luong_ton: t.so_luong,
            })),
          };
        })
      );

      return NextResponse.json({ don_hang: { id: donHang.id, trang_thai: donHang.trang_thai }, suggestions });
    }

    return NextResponse.json({ error: "mode không hợp lệ (qr|manual|order|partial)" }, { status: 400 });

  } catch (err: any) {
    console.error("[POST /api/admin/warehouse/issue]", err);
    return NextResponse.json({ error: err.message || "Lỗi server" }, { status: 500 });
  }
}