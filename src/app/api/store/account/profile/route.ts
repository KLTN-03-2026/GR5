import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

const PHONE_REGEX = /^0\d{9,10}$/;

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Đăng nhập trước tiên" },
        { status: 401 },
      );
    }

    const userId = session.user.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Không tìm thấy ID người dùng" },
        { status: 400 },
      );
    }

    const body = await req.json();
    const { ho_ten, so_dien_thoai, gioi_tinh, ngay_sinh } = body;

    if (so_dien_thoai && !PHONE_REGEX.test(so_dien_thoai)) {
      return NextResponse.json(
        { error: "Số điện thoại không hợp lệ (10-11 số, bắt đầu bằng 0)" },
        { status: 400 },
      );
    }

    if (ngay_sinh) {
      const birthDate = new Date(ngay_sinh);
      const now = new Date();
      if (isNaN(birthDate.getTime()) || birthDate > now) {
        return NextResponse.json(
          { error: "Ngày sinh không hợp lệ" },
          { status: 400 },
        );
      }
      const age = now.getFullYear() - birthDate.getFullYear();
      if (age > 120 || age < 10) {
        return NextResponse.json(
          { error: "Ngày sinh không hợp lệ" },
          { status: 400 },
        );
      }
    }

    const updateData: any = {
      ho_ten: ho_ten || undefined,
      so_dien_thoai: so_dien_thoai || undefined,
    };
    if (gioi_tinh !== undefined) updateData.gioi_tinh = gioi_tinh;
    if (ngay_sinh) updateData.ngay_sinh = new Date(ngay_sinh);

    const updatedProfile = await prisma.ho_so_nguoi_dung.update({
      where: {
        ma_nguoi_dung: Number(userId),
      },
      data: updateData,
    });

    return NextResponse.json({
      success: "Lưu thành công!",
      data: updatedProfile,
    });
  } catch (error: any) {
    console.error("Lỗi API Profile:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Chưa có hồ sơ. Vui lòng liên hệ admin." },
        { status: 404 },
      );
    }

    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
