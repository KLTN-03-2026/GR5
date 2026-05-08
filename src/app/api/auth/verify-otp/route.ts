import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const { email, otp } = await req.json();

  // 1. Tìm mã OTP mới nhất dựa trên createdAt
  const otpRecord = await prisma.ma_otp.findFirst({
    where: { email, code: otp },
    orderBy: { createdAt: "desc" }, // Sắp xếp cái mới nhất lên đầu
  });

  if (!otpRecord) {
    return NextResponse.json(
      { message: "Mã OTP không chính xác" },
      { status: 400 },
    );
  }

  // 2. Kiểm tra hết hạn dựa trên expiresAt đã lưu trong DB
  const isExpired = new Date() > new Date(otpRecord.expiresAt);

  if (isExpired) {
    return NextResponse.json(
      { message: "Mã OTP đã hết hạn rồi Phú ơi" },
      { status: 400 },
    );
  }

  // 3. Xóa mã sau khi dùng xong (Để bảo mật, tránh dùng lại mã cũ)
  await prisma.ma_otp.delete({ where: { id: otpRecord.id } });

  return NextResponse.json({ message: "Xác thực thành công", success: true });
}
