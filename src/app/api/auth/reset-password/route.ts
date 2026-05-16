import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createHash } from "crypto";
import { validatePassword } from "@/lib/password-validation";

export async function POST(req: Request) {
  try {
    const { email, password, token } = await req.json();

    if (!email || !password || !token) {
      return NextResponse.json(
        { message: "Thiếu thông tin cần thiết!" },
        { status: 400 },
      );
    }

    const pwCheck = validatePassword(password);
    if (!pwCheck.valid) {
      return NextResponse.json(
        { message: pwCheck.message },
        { status: 400 },
      );
    }

    // 1. Hash token từ client để so sánh với token đã lưu trong DB
    const hashedToken = createHash("sha256").update(token).digest("hex");

    // 2. Tìm reset token hợp lệ trong bảng ma_otp
    const tokenRecord = await prisma.ma_otp.findFirst({
      where: {
        email,
        code: hashedToken,
      },
    });

    if (!tokenRecord) {
      return NextResponse.json(
        { message: "Token không hợp lệ hoặc đã được sử dụng!" },
        { status: 403 },
      );
    }

    // 3. Kiểm tra token hết hạn
    const isExpired = new Date() > new Date(tokenRecord.expiresAt);
    if (isExpired) {
      // Xóa token hết hạn
      await prisma.ma_otp.delete({ where: { id: tokenRecord.id } });
      return NextResponse.json(
        { message: "Token đã hết hạn. Vui lòng thực hiện lại từ đầu!" },
        { status: 403 },
      );
    }

    // 4. Kiểm tra user có tồn tại không
    const user = await prisma.nguoi_dung.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Không tìm thấy người dùng!" },
        { status: 404 },
      );
    }

    // 5. Mã hóa mật khẩu mới
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6. Cập nhật mật khẩu
    await prisma.nguoi_dung.update({
      where: { email },
      data: {
        mat_khau: hashedPassword,
      },
    });

    // 7. Xóa token sau khi sử dụng thành công (one-time use)
    await prisma.ma_otp.delete({ where: { id: tokenRecord.id } });

    // 8. Xóa tất cả OTP/token còn lại của email này để dọn dẹp
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
