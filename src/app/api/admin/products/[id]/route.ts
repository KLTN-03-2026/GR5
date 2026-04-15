import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params; 
    const productId = parseInt(params.id);
    if (isNaN(productId)) return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 });
    await prisma.san_pham.delete({ where: { id: productId } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Không thể xóa vì sản phẩm này đã phát sinh dữ liệu!" }, { status: 500 });
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params; 
    const productId = parseInt(params.id);
    const body = await request.json();
    const { ten_san_pham, ma_danh_muc, xuat_xu, mo_ta, trang_thai, bien_the, anh_san_pham } = body;

    // 1. Cập nhật thông tin cơ bản
    await prisma.san_pham.update({
      where: { id: productId },
      data: {
        ten_san_pham,
        ma_danh_muc: ma_danh_muc ? parseInt(ma_danh_muc) : null,
        xuat_xu: xuat_xu || "",
        mo_ta: mo_ta || "",
        trang_thai: trang_thai || "DANG_BAN"
      }
    });

    // 2. Xử lý Ảnh
    if (anh_san_pham && anh_san_pham.length > 0) {
      await prisma.anh_san_pham.deleteMany({ where: { ma_san_pham: productId } });
      await prisma.anh_san_pham.createMany({
        data: anh_san_pham.map((url: string, index: number) => ({
          ma_san_pham: productId,
          duong_dan_anh: url,
          la_anh_chinh: index === 0
        }))
      });
    }

    // 3. Xử lý Biến thể (Bọc an toàn cho ép kiểu số)
    for (const bt of bien_the) {
      const parsedGiaGoc = (bt.gia_goc !== "" && bt.gia_goc !== null && bt.gia_goc !== undefined) ? parseFloat(bt.gia_goc) : null;
      const parsedGiaBan = parseFloat(bt.gia_ban) || 0;

      if (bt.id) {
        await prisma.bien_the_san_pham.update({
          where: { id: bt.id },
          data: {
            ten_bien_the: bt.ten_bien_the || "",
            don_vi_tinh: bt.don_vi_tinh || "Kg",
            gia_goc: parsedGiaGoc,
            gia_ban: parsedGiaBan
          }
        });
      } else {
        await prisma.bien_the_san_pham.create({
          data: {
            ma_san_pham: productId,
            ma_sku: `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`, // Tự sinh mã để không bị lỗi
            ten_bien_the: bt.ten_bien_the || "",
            don_vi_tinh: bt.don_vi_tinh || "Kg",
            gia_goc: parsedGiaGoc,
            gia_ban: parsedGiaBan
          }
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lỗi Sửa sản phẩm:", error);
    return NextResponse.json({ error: "Lỗi khi cập nhật sản phẩm" }, { status: 500 });
  }
}