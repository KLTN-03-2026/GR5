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
        { status: 400 },
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Mật khẩu phải có ít nhất 6 ký tự." },
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

    // ── Tạo user ──────────────────────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash(password, 10);

    // KỸ THUẬT NESTED WRITE: Gom 3 lệnh Insert vào cùng 1 Transaction
    const newUser = await prisma.nguoi_dung.create({
      data: {
        email,
        mat_khau: hashedPassword,
        trang_thai: 1,

        // 1. NGHIỆP VỤ CỐT LÕI: Tự động gán quyền Khách hàng (ID = 2)
        vai_tro_nguoi_dung: {
          create: {
            ma_vai_tro: 2,
          },
        },

        // 2. TỐI ƯU HÓA: Tạo hồ sơ đính kèm ngay trong lúc tạo user
        ho_so_nguoi_dung: ho_ten?.trim()
          ? {
              create: {
                ho_ten: ho_ten.trim(),
              },
            }
          : undefined, // undefined nghĩa là nếu không có tên thì bỏ qua không tạo hồ sơ
      },
    });

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
