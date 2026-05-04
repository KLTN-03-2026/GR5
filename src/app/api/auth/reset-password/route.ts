import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs"; // Cài lệnh: npm install bcryptjs

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Thiếu thông tin cần thiết!" },
        { status: 400 },
      );
    }

    // 1. Kiểm tra user có tồn tại không
    const user = await prisma.nguoi_dung.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Không tìm thấy người dùng!" },
        { status: 404 },
      );
    }

    // 2. Mã hóa mật khẩu mới (Salt rounds = 10 là chuẩn)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Cập nhật mật khẩu vào bảng nguoi_dung
    await prisma.nguoi_dung.update({
      where: { email },
      data: {
        mat_khau: hashedPassword,
        // Nếu Phú có trường 'password' thì sửa tên cho đúng nhé
      },
    });

    // 4. (Tùy chọn) Xóa mã OTP sau khi đổi pass thành công để bảo mật
    await prisma.ma_otp.deleteMany({
      where: { email },
    });

    return NextResponse.json(
      { message: "Đổi mật khẩu thành công!" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("LỖI RESET PASSWORD:", error.message);
    return NextResponse.json({ message: "Lỗi hệ thống!" }, { status: 500 });
  }
}
