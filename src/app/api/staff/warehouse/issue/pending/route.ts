import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ensureOrderIssueTicket } from "@/lib/warehouse-issue";

function classifyOrder(provinceId: number): "GAN" | "TRUNG" | "XA" {
  if (provinceId === 48 || provinceId === 203) return "GAN";
  const mienTrung = [46, 49, 51, 52, 54, 56, 44, 45, 223, 243, 218, 219, 221, 224, 225];
  if (mienTrung.includes(provinceId)) return "TRUNG";
  return "XA";
}

async function ensurePendingIssueTickets() {
  const orders = await prisma.don_hang.findMany({
    where: {
      trang_thai: "CHO_GIAO_HANG",
      phieu_xuat_kho: {
        none: {
          ly_do_xuat: "XUAT_THEO_DON_HANG",
        },
      },
    },
    select: { id: true },
    take: 50,
  });

  for (const order of orders) {
    await prisma.$transaction(async (tx) => {
      await ensureOrderIssueTicket(tx, order.id);
    });
  }
}

// ═══════════════════════════════════════════════════════════════
// GET — Danh sách đơn hàng đang chờ xuất kho
// Điều kiện: đơn CHO_GIAO_HANG + có phiếu xuất DANG_SOAN
// ═══════════════════════════════════════════════════════════════
export async function GET(req: NextRequest) {
  try {
    const filterLoai = req.nextUrl.searchParams.get("loai_don"); // GAN | TRUNG | XA | null (all)

    await ensurePendingIssueTickets();

    const phieuXuats = await prisma.phieu_xuat_kho.findMany({
      where: {
        trang_thai: "DANG_SOAN",
        ly_do_xuat: "XUAT_THEO_DON_HANG",
        don_hang: { trang_thai: "CHO_GIAO_HANG" },
      },
      include: {
        don_hang: {
          include: {
            chi_tiet_don_hang: {
              include: { bien_the_san_pham: { include: { san_pham: true } } },
            },
          },
        },
        chi_tiet_phieu_xuat: {
          include: { kien_hang_da_xuat: true },
        },
      },
      orderBy: { ngay_tao: "asc" },
    });

    const now = Date.now();

    const items = phieuXuats
      .map((px) => {
        const don = px.don_hang;
        if (!don) return null;

        const loaiDon = classifyOrder(don.ma_tinh_ghn ?? 0);

        // Filter theo loại đơn
        if (filterLoai && filterLoai !== loaiDon) return null;

        const tongYeuCau = px.chi_tiet_phieu_xuat.reduce((s, ct) => s + ct.so_luong_yeu_cau, 0);
        const tongDaXuat = px.chi_tiet_phieu_xuat.reduce((s, ct) => s + (ct.kien_hang_da_xuat?.length ?? 0), 0);

        const thoiGianCho = px.ngay_tao ? Math.floor((now - new Date(px.ngay_tao).getTime()) / 60000) : 0;

        // Ưu tiên: GAN > TRUNG > XA, trong cùng loại thì lâu nhất trước
        const urgentThreshold = loaiDon === "GAN" ? 60 : 240; // 1h cho GẦN, 4h cho TRUNG/XA
        const isUrgent = thoiGianCho >= urgentThreshold;

        const sanPhams = don.chi_tiet_don_hang.map((ct) => ({
          ten: ct.bien_the_san_pham?.san_pham?.ten_san_pham ?? "",
          bien_the: ct.bien_the_san_pham?.ten_bien_the ?? "",
          so_luong: ct.so_luong ?? 0,
        }));

        return {
          phieu_xuat_id: px.id,
          don_hang_id: don.id,
          ma_don: `DH${String(don.id).padStart(4, "0")}`,
          ho_ten_nguoi_nhan: don.ho_ten_nguoi_nhan,
          dia_chi: don.dia_chi_giao_hang,
          loai_don: loaiDon,
          tien_do: { da_xuat: tongDaXuat, tong: tongYeuCau },
          thoi_gian_cho_phut: thoiGianCho,
          is_urgent: isUrgent,
          san_phams: sanPhams,
          ngay_tao: px.ngay_tao,
        };
      })
      .filter(Boolean);

    // Sắp xếp: urgent trước, sau đó GAN > TRUNG > XA, sau đó thời gian chờ giảm dần
    const priorityMap = { GAN: 0, TRUNG: 1, XA: 2 };
    items.sort((a: any, b: any) => {
      if (a.is_urgent !== b.is_urgent) return a.is_urgent ? -1 : 1;
      if (priorityMap[a.loai_don as keyof typeof priorityMap] !== priorityMap[b.loai_don as keyof typeof priorityMap]) {
        return priorityMap[a.loai_don as keyof typeof priorityMap] - priorityMap[b.loai_don as keyof typeof priorityMap];
      }
      return b.thoi_gian_cho_phut - a.thoi_gian_cho_phut;
    });

    return NextResponse.json({
      items,
      total: items.length,
      summary: {
        gan: items.filter((i: any) => i.loai_don === "GAN").length,
        trung: items.filter((i: any) => i.loai_don === "TRUNG").length,
        xa: items.filter((i: any) => i.loai_don === "XA").length,
        urgent: items.filter((i: any) => i.is_urgent).length,
      },
    });
  } catch (err: any) {
    console.error("[GET /api/staff/warehouse/issue/pending]", err);
    return NextResponse.json({ error: err.message || "Lỗi server" }, { status: 500 });
  }
}
