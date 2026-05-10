import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { rateLimit } from "@/lib/rate-limit";
import { validatePassword } from "@/lib/password-validation";

// POST /api/auth/register
export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    const { success: allowed } = rateLimit(`register:${ip}`, 5, 60_000);
    if (!allowed) {
      return NextResponse.json(
        { success: false, message: "Bạn đã thử quá nhiều lần. Vui lòng đợi 1 phút." },
        { status: 429 },
      );
    }

    const { ho_ten, email, password, otp } = await req.json();

    // ── Validation ────────────────────────────────────────────────────────────
    if (!email || !password || !otp) {
      return NextResponse.json(
        { success: false, message: "Email, mật khẩu và mã OTP là bắt buộc." },
        { status: 400 },
      );
    }
    const pwCheck = validatePassword(password);
    if (!pwCheck.valid) {
      return NextResponse.json(
        { success: false, message: pwCheck.message },
        { status: 400 },
      );
    }

    // ── Kiểm tra email đã tồn tại ─────────────────────────────────────────────
    const existing = await prisma.nguoi_dung.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Email này đã được sử dụng." },
        { status: 409 },
      );
    }

    // ── Kiểm tra OTP ─────────────────────────────────────────────────────────
    const otpRecord = await prisma.ma_otp.findFirst({
      where: { email },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, message: "Mã OTP không chính xác hoặc đã hết hạn" },
        { status: 400 },
      );
    }

    const isExpired = new Date() > new Date(otpRecord.expiresAt);
    if (isExpired) {
      return NextResponse.json(
        { success: false, message: "Mã OTP đã hết hạn" },
        { status: 400 },
      );
    }

    const isMatch = await bcrypt.compare(otp, otpRecord.code);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Mã OTP không chính xác" },
        { status: 400 },
      );
    }

    // ── Tạo user ──────────────────────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash(password, 10);

    // Lookup ID của role KHACH_HANG từ DB (tránh hardcode ID)
    const roleKhachHang = await prisma.vai_tro.findFirst({
      where: { ten_vai_tro: "KHACH_HANG" },
    });
    if (!roleKhachHang) {
      return NextResponse.json(
        { success: false, message: "Cấu hình hệ thống lỗi: không tìm thấy vai trò Khách hàng." },
        { status: 500 },
      );
    }

    // KỸ THUẬT NESTED WRITE: Gom 3 lệnh Insert vào cùng 1 Transaction
    const newUser = await prisma.nguoi_dung.create({
      data: {
        email,
        mat_khau: hashedPassword,
        trang_thai: 1,

        // 1. NGHIỆP VỤ CỐT LÕI: Tự động gán quyền Khách hàng (lookup động)
        vai_tro_nguoi_dung: {
          create: {
            ma_vai_tro: roleKhachHang.id,
          },
        },

        // 2. TỐI ƯU HÓA: Tạo hồ sơ đính kèm ngay trong lúc tạo user
        ho_so_nguoi_dung: ho_ten?.trim()
          ? {
              create: {
                ho_ten: ho_ten.trim(),
              },
            }
          : undefined,
      },
    });

    // Xóa OTP sau khi sử dụng thành công
    await prisma.ma_otp.delete({ where: { id: otpRecord.id } });

    return NextResponse.json(
      { success: true, message: "Đăng ký thành công!", userId: newUser.id },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("[REGISTER_ERROR]", error);
    if (error?.code === "P2002") {
      return NextResponse.json(
        { success: false, message: "Email này đã được sử dụng." },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống. Vui lòng thử lại." },
      { status: 500 },
    );
  }
}
