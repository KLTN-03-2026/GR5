import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { error } from "console";

export async function POST(req: Request) {
  try {
    // 1. Lấy session bằng hàm auth() mới
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Đăng nhập trước tiên " },
        { status: 401 },
      );
    }

    // 2. Lấy ID người dùng (Ở v5 thường nằm trực tiếp trong session.user.id)
    const userId = session.user.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Không tìm thấy ID người dùng!" },
        { status: 400 },
      );
    }

    // 3. Lấy dữ liệu từ body
    const body = await req.json();
    const { ho_ten, so_dien_thoai } = body;

    // 4. Cập nhật vào bảng hồ sơ
    const updatedProfile = await prisma.ho_so_nguoi_dung.update({
      where: {
        ma_nguoi_dung: Number(userId),
      },
      data: {
        ho_ten: ho_ten,
        so_dien_thoai: so_dien_thoai,
      },
    });

    return NextResponse.json({
      success: "Lưu thành công rồi nhé!",
      data: updatedProfile,
    });
  } catch (error: any) {
    console.error("Lỗi API Profile:", error);

    // Lỗi P2025 là không tìm thấy bản ghi (User chưa có dòng nào bên bảng hồ sơ)
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Mày chưa có dòng hồ sơ nào bên bảng ho_so_nguoi_dung cả!" },
        { status: 404 },
      );
    }

    return NextResponse.json({ error: "Lỗi hệ thống rồi!" }, { status: 500 });
  }
}
