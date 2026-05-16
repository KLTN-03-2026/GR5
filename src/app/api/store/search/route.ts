import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || ""; // Từ khóa khách gõ

    // Tìm kiếm trong Database
    const products = await prisma.san_pham.findMany({
      where: {
        AND: [
          { trang_thai: "DANG_BAN" }, // Chỉ lấy hàng đang hoạt động
          {
            OR: [
              { ten_san_pham: { contains: query } },
              { mo_ta: { contains: query } },
              { xuat_xu: { contains: query } },
            ],
          },
        ],
      },
      // Bốc thêm dữ liệu từ các bảng liên quan để hiển thị
      include: {
        anh_san_pham: {
          take: 1, // Chỉ lấy 1 tấm ảnh đầu tiên làm ảnh đại diện
        },
        bien_the_san_pham: {
          select: {
            gia_ban: true, // Lấy giá bán từ bảng biến thể
          },
          take: 1, // Lấy giá của biến thể đầu tiên để hiện "Giá từ..."
        },
      },
    });

    return NextResponse.json(products);
  } catch (error: any) {
    console.error("Lỗi search:", error.message);
    return NextResponse.json({ error: "Có lỗi xảy ra, vui lòng thử lại!" }, { status: 500 });
  }
}
