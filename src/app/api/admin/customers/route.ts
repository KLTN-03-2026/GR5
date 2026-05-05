import { NextResponse } from "next/server";
// Hãy chắc chắn đường dẫn tới prisma client của em là đúng
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get("q") || "";

    // Thực hiện truy vấn với Prisma
    const rawCustomers = await prisma.nguoi_dung.findMany({
      where: {
        // 1. Lọc theo role (Giả sử id 2 là CUSTOMER).
        // LƯU Ý: Em phải check lại model vai_tro_nguoi_dung xem cột ID vai trò tên là gì nhé.
        // Ở đây anh giả định là ma_vai_tro
        vai_tro_nguoi_dung: {
          some: {
            // THAY 'ma_vai_tro' BẰNG TÊN CỘT THỰC TẾ TRONG MODEL vai_tro_nguoi_dung CỦA EM
            ma_vai_tro: 2,
          },
        },
        // 2. Tìm kiếm theo keyword
        OR: [
          { email: { contains: keyword } },
          {
            ho_so_nguoi_dung: {
              ho_ten: { contains: keyword },
            },
          },
          {
            ho_so_nguoi_dung: {
              so_dien_thoai: { contains: keyword },
            },
          },
        ],
      },
      select: {
        id: true,
        email: true,
        ho_so_nguoi_dung: {
          select: { ho_ten: true, so_dien_thoai: true, anh_dai_dien: true },
        },

        _count: {
          select: {
            don_hang: {
              // THAY 'trang_thai' VÀ 'HOAN_THANH' BẰNG CỘT VÀ GIÁ TRỊ THỰC TẾ TRONG BẢNG don_hang
              where: { trang_thai: "HOAN_THANH" },
            },
          },
        },
        // 4. Kéo các đơn hàng hoàn thành ra để lấy tổng tiền
        don_hang: {
          // THAY 'trang_thai' BẰNG CỘT THỰC TẾ
          where: { trang_thai: "HOAN_THANH" },
          // THAY 'tong_tien' BẰNG TÊN CỘT CHỨA GIÁ TRỊ ĐƠN HÀNG TRONG BẢNG don_hang
          select: { tong_tien: true },
        },
      },
      orderBy: { id: "desc" },
    });

    // Xử lý dữ liệu sau khi query
    const formattedCustomers = rawCustomers.map((user: any) => {
      // Tính tổng chi tiêu
      const tongChiTieu = user.don_hang.reduce((sum: number, don: any) => {
        // Ép kiểu về số vì đôi khi Prisma lấy Decimal từ DB lên dưới dạng object
        const tien = Number(don.tong_tien) || 0;
        return sum + tien;
      }, 0);

      return {
        id: user.id,
        ten: user.ho_so_nguoi_dung?.ho_ten || "Chưa cập nhật",
        email: user.email,
        sdt: user.ho_so_nguoi_dung?.so_dien_thoai || "Chưa cập nhật",
        avatar: user.ho_so_nguoi_dung?.anh_dai_dien || null,
        tongDon: user._count.don_hang,
        tongChiTieu: tongChiTieu,
      };
    });

    return NextResponse.json({ data: formattedCustomers });
  } catch (error) {
    console.error("Lỗi lấy dữ liệu khách hàng:", error);
    return NextResponse.json(
      { error: "Lỗi server khi fetch danh sách khách hàng" },
      { status: 500 },
    );
  }
}
