import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/admin/ncc/[id]/lo-hang-trong-kho
 * Lấy danh sách lô hàng của NCC còn kiện trong kho (trang_thai = TRONG_KHO)
 */
export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const loHangList = await prisma.lo_hang.findMany({
    where: {
      ma_ncc: Number(id),
      kien_hang_chi_tiet: {
        some: { trang_thai: "TRONG_KHO" },
      },
    },
    include: {
      bien_the_san_pham: {
        select: {
          ten_bien_the: true,
          san_pham: { select: { ten_san_pham: true } },
        },
      },
      kien_hang_chi_tiet: {
        where: { trang_thai: "TRONG_KHO" },
        select: { id: true, trang_thai: true },
      },
    },
    orderBy: { han_su_dung: "asc" }, // FEFO: hiển thị lô sắp hết hạn trước
  });

  return NextResponse.json({ lo_hang: loHangList });
}
