import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { randomUUID, createHash } from "crypto";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { success: allowed } = rateLimit(`verify-otp:${ip}`, 5, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { message: "Bạn đã thử quá nhiều lần. Vui lòng đợi 1 phút." },
      { status: 429 },
    );
  }

  const { email, otp } = await req.json();

  // 1. Tìm mã OTP mới nhất của email này
  const otpRecord = await prisma.ma_otp.findFirst({
    where: { email },
    orderBy: { createdAt: "desc" },
  });

  if (!otpRecord) {
    return NextResponse.json(
      { message: "Mã OTP không chính xác" },
      { status: 400 },
    );
  }

  // 2. Kiểm tra hết hạn
  const isExpired = new Date() > new Date(otpRecord.expiresAt);
  if (isExpired) {
    return NextResponse.json(
      { message: "Mã OTP đã hết hạn" },
      { status: 400 },
    );
  }

  // 3. So sánh OTP đã hash
  const isMatch = await bcrypt.compare(otp, otpRecord.code);
  if (!isMatch) {
    return NextResponse.json(
      { message: "Mã OTP không chính xác" },
      { status: 400 },
    );
  }

  // 4. Xóa mã OTP sau khi xác thực thành công
  await prisma.ma_otp.delete({ where: { id: otpRecord.id } });

  // 5. Tạo reset token ngẫu nhiên, hash và lưu vào DB với thời hạn 10 phút
  const resetToken = randomUUID();
  const hashedToken = createHash("sha256").update(resetToken).digest("hex");

  await prisma.ma_otp.create({
    data: {
      email,
      code: hashedToken,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 phút
    },
  });

  return NextResponse.json({
    message: "Xác thực thành công",
    success: true,
    resetToken, // Trả token (chưa hash) cho client để dùng ở bước reset-password
  });
}
