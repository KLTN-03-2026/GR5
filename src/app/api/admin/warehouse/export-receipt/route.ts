import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { shelf_id, lo_hang_id, so_luong_xuat, ly_do, ghi_chu } = body;

    if (!lo_hang_id || !so_luong_xuat) {
      return NextResponse.json({ error: "Thiếu thông tin lô hàng hoặc số lượng" }, { status: 400 });
    }

    const tonKhoList = await prisma.ton_kho_tong.findMany({
      where: { ma_lo_hang: Number(lo_hang_id) },
      orderBy: { so_luong: 'desc' }
    });

    const tonKho = tonKhoList[0];

    if (!tonKho || tonKho.so_luong! < Number(so_luong_xuat)) {
      return NextResponse.json({ error: "Số lượng xuất vượt quá tồn kho" }, { status: 400 });
    }

    const ma_phieu = "PX-" + Date.now();

    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Create phieu_xuat_kho
      const phieuXuat = await tx.phieu_xuat_kho.create({
        data: {
          ma_nguoi_tao: 1, // Fallback ID
          ly_do_xuat: ly_do,
          trang_thai: "DA_XUAT",
          ngay_tao: new Date(),
        }
      });

      // 2. Create chi_tiet_phieu_xuat
      const loHang = await tx.lo_hang.findUnique({ where: { id: Number(lo_hang_id) } });
      if (loHang?.ma_bien_the) {
        await tx.chi_tiet_phieu_xuat.create({
          data: {
            ma_phieu_xuat: phieuXuat.id,
            ma_bien_the: loHang.ma_bien_the,
            so_luong_yeu_cau: Number(so_luong_xuat),
            so_luong_thuc_xuat: Number(so_luong_xuat)
          }
        });
      }

      // 3. Update ton_kho_tong
      const newSoLuong = tonKho.so_luong! - Number(so_luong_xuat);
      if (newSoLuong <= 0) {
         await tx.ton_kho_tong.delete({ where: { id: tonKho.id } });
      } else {
         await tx.ton_kho_tong.update({
           where: { id: tonKho.id },
           data: { so_luong: newSoLuong }
         });
      }
      return { ma_phieu, so_luong_con_lai: newSoLuong };
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Lỗi server" }, { status: 500 });
  }
}
