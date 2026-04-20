import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { WarehouseAdminService } from "@/services/admin/warehouse-admin.service";

// ── GET: Danh sách phiếu nhập CHO_DUYET / CHO_KIEM_TRA ──
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "all";
  const phieus = await WarehouseAdminService.getReceiptList(status);
  return NextResponse.json({ phieus });
}

// ── POST: Tạo phiếu nhập nháp (CHO_DUYET — không auto approve) ──
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ma_ncc, ma_bien_the, so_luong_thung, ngay_thu_hoach, ngay_nhap_kho, han_su_dung, vi_tri, ma_lo_hang_tuy_chinh } = body;

    if (!ma_ncc || !ma_bien_the || !so_luong_thung || !han_su_dung) {
      return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }

    // Kiểm tra trùng mã lô nếu người dùng tự nhập
    if (ma_lo_hang_tuy_chinh) {
      const existing = await prisma.lo_hang.findFirst({
        where: { ma_lo_hang: ma_lo_hang_tuy_chinh },
      });
      if (existing) {
        return NextResponse.json({
          error: "Mã lô đã tồn tại",
          conflict: true,
          lo_cu: { id: existing.id, ma_lo_hang: existing.ma_lo_hang },
        }, { status: 409 });
      }
    }

    const maPhieu = `PN-${Date.now()}`;

    const phieu = await prisma.phieu_nhap_kho.create({
      data: {
        ma_phieu: maPhieu,
        ma_ncc: Number(ma_ncc),
        trang_thai: "CHO_DUYET",
        ghi_chu: ma_lo_hang_tuy_chinh ? `Mã lô tự chọn: ${ma_lo_hang_tuy_chinh}` : undefined,
        chi_tiet: {
          create: {
            ma_bien_the: Number(ma_bien_the),
            so_luong_thung: Number(so_luong_thung),
            so_luong_yeu_cau: Number(so_luong_thung),
            don_gia: 0,
            ngay_thu_hoach: ngay_thu_hoach ? new Date(ngay_thu_hoach) : undefined,
            ngay_nhap_kho: new Date(ngay_nhap_kho),
            han_su_dung: new Date(han_su_dung),
            khu_du_kien: vi_tri?.khu,
            day_du_kien: vi_tri?.day,
            ke_du_kien: vi_tri?.ke,
            tang_du_kien: vi_tri?.tang,
          },
        },
      },
      include: {
        chi_tiet: { include: { bien_the_san_pham: { select: { ten_bien_the: true } } } },
        nha_cung_cap: { select: { ten_ncc: true } },
      },
    });

    return NextResponse.json({ success: true, phieu, ma_phieu: maPhieu }, { status: 201 });
  } catch (err: any) {
    console.error("[POST /api/admin/warehouse/import]", err);
    return NextResponse.json({ error: err.message || "Lỗi tạo phiếu" }, { status: 500 });
  }
}