import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Đảm bảo bạn đã có file khởi tạo prisma ở đây

export async function GET() {
  try {
    const now = new Date();

    // Dùng Prisma chui vào bảng ma_giam_gia lấy dữ liệu
    const validCoupons = await prisma.ma_giam_gia.findMany({
      where: {
        // Chỉ lấy những mã mà ngày hiện tại đang nằm trong khoảng thời gian cho phép
        ngay_bat_dau: { lte: now },
        ngay_ket_thuc: { gte: now },
        // Nếu có gioi_han_su_dung > 0 thì thêm vào (hiện tại schema cho phép null nên bỏ qua tạm)
      },
      orderBy: {
        gia_tri_giam: 'desc' // Ưu tiên xếp mã giảm nhiều nhất lên đầu
      }
    });

    return NextResponse.json(validCoupons);
  } catch (error) {
    console.error("Lỗi API lấy mã giảm giá:", error);
    return NextResponse.json({ error: "Lỗi Server" }, { status: 500 });
  }
}