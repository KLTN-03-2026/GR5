import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Helper: lấy userId từ email trong session (giống cách staff/hr/page.tsx làm)
async function getUserId(): Promise<number | null> {
  const session = await auth();
  if (!session?.user?.email) return null;

  // Ưu tiên id từ session token nếu có
  const idFromToken = Number((session.user as any).id);
  if (idFromToken && !isNaN(idFromToken)) return idFromToken;

  // Fallback: lookup từ email
  const user = await prisma.nguoi_dung.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  return user?.id ?? null;
}

// GET – Kiểm tra user đã có Face Data chưa
export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ success: false, message: "Chưa đăng nhập hoặc không xác định được tài khoản" }, { status: 401 });
  }

  const faceData = await prisma.du_lieu_khuon_mat.findUnique({
    where: { ma_nguoi_dung: userId },
    select: { id: true },
  });

  return NextResponse.json({ success: true, hasFaceData: !!faceData });
}

// POST – Lưu Face Descriptor vào DB
export async function POST(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ success: false, message: "Chưa đăng nhập hoặc không xác định được tài khoản" }, { status: 401 });
  }

  const { descriptor } = await req.json();
  if (!descriptor || !Array.isArray(descriptor)) {
    return NextResponse.json({ success: false, message: "Dữ liệu khuôn mặt không hợp lệ" }, { status: 400 });
  }

  // Upsert: tạo mới hoặc cập nhật nếu đã có
  await prisma.du_lieu_khuon_mat.upsert({
    where: { ma_nguoi_dung: userId },
    create: {
      ma_nguoi_dung: userId,
      vector_khuon_mat: JSON.stringify(descriptor),
    },
    update: {
      vector_khuon_mat: JSON.stringify(descriptor),
    },
  });

  return NextResponse.json({ success: true, message: "Đã lưu dữ liệu khuôn mặt" });
}

// DELETE – Xóa Face Data
export async function DELETE() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ success: false, message: "Chưa đăng nhập hoặc không xác định được tài khoản" }, { status: 401 });
  }

  await prisma.du_lieu_khuon_mat.deleteMany({ where: { ma_nguoi_dung: userId } });

  return NextResponse.json({ success: true, message: "Đã xóa dữ liệu khuôn mặt" });
}
