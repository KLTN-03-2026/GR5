import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Helper: lấy userId từ email (fallback nếu token không có id)
async function getUserId(): Promise<number | null> {
  const session = await auth();
  if (!session?.user?.email) return null;

  const idFromToken = Number((session.user as any).id);
  if (idFromToken && !isNaN(idFromToken)) return idFromToken;

  const user = await prisma.nguoi_dung.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  return user?.id ?? null;
}

export async function POST(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ success: false, message: "Chưa đăng nhập hoặc không xác định được tài khoản" }, { status: 401 });
  }

  const { oldPassword, newPassword } = await req.json();

  if (!oldPassword || !newPassword) {
    return NextResponse.json({ success: false, message: "Thiếu thông tin" }, { status: 400 });
  }
  if (newPassword.length < 6) {
    return NextResponse.json({ success: false, message: "Mật khẩu mới phải ít nhất 6 ký tự" }, { status: 400 });
  }

  const user = await prisma.nguoi_dung.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ success: false, message: "Không tìm thấy người dùng" }, { status: 404 });
  }

  // Tài khoản OAuth không có mật khẩu
  if (!user.mat_khau) {
    return NextResponse.json({ success: false, message: "Tài khoản này đăng nhập bằng OAuth, không có mật khẩu để đổi" }, { status: 400 });
  }

  const isMatch = await bcrypt.compare(oldPassword, user.mat_khau);
  if (!isMatch) {
    return NextResponse.json({ success: false, message: "Mật khẩu hiện tại không đúng" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.nguoi_dung.update({ where: { id: userId }, data: { mat_khau: hashed } });

  return NextResponse.json({ success: true, message: "Đổi mật khẩu thành công" });
}
