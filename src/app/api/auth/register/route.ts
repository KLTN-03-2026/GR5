import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// POST /api/auth/register
export async function POST(req: Request) {
  try {
    const { ho_ten, email, password } = await req.json();

    // ── Validation ────────────────────────────────────────────────────────────
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email và mật khẩu là bắt buộc." },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Mật khẩu phải có ít nhất 6 ký tự." },
        { status: 400 }
      );
    }

    // ── Kiểm tra email đã tồn tại ─────────────────────────────────────────────
    const existing = await prisma.nguoi_dung.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Email này đã được sử dụng." },
        { status: 409 }
      );
    }

    // ── Tạo user ──────────────────────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.nguoi_dung.create({
      data: {
        email,
        mat_khau: hashedPassword,
        trang_thai: 1,
      },
    });

    // Tạo hồ sơ đính kèm nếu có họ tên
    if (ho_ten?.trim()) {
      await prisma.ho_so_nguoi_dung.create({
        data: {
          ma_nguoi_dung: newUser.id,
          ho_ten: ho_ten.trim(),
        },
      });
    }

    return NextResponse.json(
      { success: true, message: "Đăng ký thành công!", userId: newUser.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[REGISTER_ERROR]", error);
    if (error?.code === "P2002") {
      return NextResponse.json(
        { success: false, message: "Email này đã được sử dụng." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống. Vui lòng thử lại." },
      { status: 500 }
    );
  }
}
