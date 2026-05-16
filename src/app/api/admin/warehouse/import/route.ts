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

// ── POST: Tạo đơn đặt hàng NCC (CHO_GIAO_HANG) ──
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ma_ncc, ngay_giao_du_kien, items, vi_tri, vi_tri_id } = body;

    if (!ma_ncc || !ngay_giao_du_kien) {
      return NextResponse.json({ error: "Thiếu thông tin bắt buộc (NCC, ngày giao)" }, { status: 400 });
    }

    // Build line items - support both old single-item and new multi-item format
    let lineItems: { ma_bien_the: number; so_luong_yeu_cau: number; don_gia: number }[];

    if (Array.isArray(items) && items.length > 0) {
      lineItems = items.map((item: any) => ({
        ma_bien_the: Number(item.ma_bien_the),
        so_luong_yeu_cau: Number(item.so_luong || item.so_luong_thung),
        don_gia: Number(item.don_gia || item.don_gia_tam_tinh || 0),
      }));
    } else if (body.ma_bien_the && body.so_luong_thung) {
      lineItems = [{
        ma_bien_the: Number(body.ma_bien_the),
        so_luong_yeu_cau: Number(body.so_luong_thung),
        don_gia: Number(body.don_gia_tam_tinh || 0),
      }];
    } else {
      return NextResponse.json({ error: "Cần ít nhất 1 sản phẩm (items[] hoặc ma_bien_the + so_luong_thung)" }, { status: 400 });
    }

    // Resolve vị trí cất (nếu form gửi lên): ưu tiên vi_tri_id, fallback lookup theo {khu, day, ke, tang}
    let maViTriCat: number | null = null;
    if (vi_tri_id) {
      maViTriCat = Number(vi_tri_id);
    } else if (vi_tri && (vi_tri.khu || vi_tri.day || vi_tri.ke)) {
      const match = await prisma.vi_tri_kho.findFirst({
        where: {
          khu_vuc: vi_tri.khu || undefined,
          day: vi_tri.day || undefined,
          ke: vi_tri.ke || undefined,
          tang: vi_tri.tang || undefined,
        },
        select: { id: true },
      });
      if (match) maViTriCat = match.id;
    }

    const phieu = await prisma.phieu_nhap_kho.create({
      data: {
        ma_ncc: Number(ma_ncc),
        ma_nguoi_tao: body.nguoi_tao_id ? Number(body.nguoi_tao_id) : undefined,
        trang_thai: "CHO_GIAO_HANG",
        ngay_du_kien_giao: new Date(ngay_giao_du_kien),
        ma_vi_tri_cat: maViTriCat,
        chi_tiet_phieu_nhap: {
          create: lineItems.map((item) => ({
            ma_bien_the: item.ma_bien_the,
            so_luong_yeu_cau: item.so_luong_yeu_cau,
            so_luong_thuc_nhan: 0,
            don_gia: item.don_gia,
          })),
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
