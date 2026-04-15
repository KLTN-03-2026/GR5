import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ==========================================
// PATCH — Cập nhật vị trí kho (tên, sức chứa, ghi chú)
// ==========================================
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { suc_chua_toi_da, ghi_chu, khu_vuc } = body;

    const updated = await prisma.vi_tri_kho.update({
      where: { id: Number(id) },
      data: {
        ...(suc_chua_toi_da !== undefined && { suc_chua_toi_da: Number(suc_chua_toi_da) }),
        ...(ghi_chu !== undefined && { ghi_chu }),
        ...(khu_vuc !== undefined && { khu_vuc }),
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PATCH /api/admin/warehouse/zones/[id]]", err);
    return NextResponse.json({ error: "Lỗi cập nhật" }, { status: 500 });
  }
}

// ==========================================
// DELETE — Xóa toàn bộ khu (theo tên khu), với kiểm tra tồn kho
// ==========================================
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { ma_vi_tri_dich } = body; // vị trí đích nếu cần chuyển hàng

    // Lấy thông tin vị trí
    const viTri = await prisma.vi_tri_kho.findUnique({
      where: { id: Number(id) },
    });
    if (!viTri) return NextResponse.json({ error: "Không tìm thấy vị trí" }, { status: 404 });

    // Tìm tất cả vị trí cùng khu
    const allInKhu = await prisma.vi_tri_kho.findMany({
      where: { khu_vuc: viTri.khu_vuc },
      select: { id: true },
    });
    const idsInKhu = allInKhu.map((v) => v.id);

    // Kiểm tra hàng tồn
    const stockCheck = await prisma.ton_kho_tong.findMany({
      where: {
        ma_vi_tri: { in: idsInKhu },
        so_luong: { gt: 0 },
      },
      include: {
        lo_hang: { include: { bien_the_san_pham: true } },
        vi_tri_kho: true,
      },
    });

    if (stockCheck.length > 0 && !ma_vi_tri_dich) {
      // Có hàng nhưng chưa chọn khu đích → trả về danh sách block
      return NextResponse.json(
        {
          error: "HAS_STOCK",
          message: "Khu này còn hàng tồn, vui lòng chọn khu đích để chuyển hàng trước",
          stock: stockCheck.map((s) => ({
            id: s.id,
            san_pham: s.lo_hang?.bien_the_san_pham?.ten_bien_the || "N/A",
            so_luong: s.so_luong,
            vi_tri: `${s.vi_tri_kho?.khu_vuc}-${s.vi_tri_kho?.day}-${s.vi_tri_kho?.ke}-${s.vi_tri_kho?.tang}`,
          })),
        },
        { status: 409 }
      );
    }

    // Nếu có khu đích → chuyển hàng
    if (ma_vi_tri_dich && stockCheck.length > 0) {
      await Promise.all(
        stockCheck.map((s) =>
          prisma.ton_kho_tong.update({
            where: { id: s.id },
            data: { ma_vi_tri: Number(ma_vi_tri_dich) },
          })
        )
      );
    }

    // Xóa tất cả vị trí trong khu
    await prisma.vi_tri_kho.deleteMany({
      where: { id: { in: idsInKhu } },
    });

    return NextResponse.json({ message: `Đã xóa khu "${viTri.khu_vuc}"` });
  } catch (err) {
    console.error("[DELETE /api/admin/warehouse/zones/[id]]", err);
    return NextResponse.json({ error: "Lỗi xóa khu vực" }, { status: 500 });
  }
}
