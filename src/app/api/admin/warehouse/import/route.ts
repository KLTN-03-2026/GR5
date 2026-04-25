import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { WarehouseAdminService } from "@/services/admin/warehouse-admin.service";

// ── GET: Danh sách phiếu nhập ──
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "all";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "15");
  
  const result = await WarehouseAdminService.getReceiptList(status, page, limit);
  return NextResponse.json({ phieus: result.items, meta: result.meta });
}

// ── POST: Tạo phiếu nhập mới (CHO_GIAO_HANG) ──
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ma_ncc, ma_bien_the, so_luong_thung, han_su_dung } = body;

    if (!ma_ncc || !ma_bien_the || !so_luong_thung || !han_su_dung) {
      return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }

    const phieu = await prisma.phieu_nhap_kho.create({
      data: {
        ma_ncc: Number(ma_ncc),
        trang_thai: "CHO_GIAO_HANG",
        chi_tiet_phieu_nhap: {
          create: {
            ma_bien_the: Number(ma_bien_the),
            so_luong_yeu_cau: Number(so_luong_thung),
            so_luong_thuc_nhan: 0,
            don_gia: 0,
          },
        },
      },
      include: {
        chi_tiet_phieu_nhap: {
          include: { bien_the_san_pham: { select: { ten_bien_the: true } } }
        },
        nha_cung_cap: { select: { ten_ncc: true } },
      },
    });

    return NextResponse.json({ success: true, phieu, id: phieu.id }, { status: 201 });
  } catch (err: any) {
    console.error("[POST /api/admin/warehouse/import]", err);
    return NextResponse.json({ error: err.message || "Lỗi tạo phiếu" }, { status: 500 });
  }
}