import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// [GET] Lấy danh sách địa chỉ
export async function GET() {
  const session = await auth();
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const addresses = await prisma.dia_chi_nguoi_dung.findMany({
    where: {
      nguoi_dung: { email: session.user.email },
    },
    orderBy: { la_mac_dinh: "desc" }, // Thằng nào mặc định cho lên đầu
  });
  return NextResponse.json(addresses);
}

// [PUT] Đặt làm mặc định hoặc Cập nhật
export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, action } = await req.json();

  if (action === "set-default") {
    // 1. Tìm user đang đăng nhập
    const user = await prisma.nguoi_dung.findUnique({
      where: { email: session.user.email },
    });

    // 2. Bỏ mặc định tất cả địa chỉ của user này
    await prisma.dia_chi_nguoi_dung.updateMany({
      where: { ma_nguoi_dung: user?.id },
      data: { la_mac_dinh: false },
    });

    // 3. Cập nhật địa chỉ được chọn thành mặc định
    await prisma.dia_chi_nguoi_dung.update({
      where: { id: Number(id) },
      data: { la_mac_dinh: true },
    });

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

// [DELETE] Xóa địa chỉ
export async function DELETE(req: Request) {
  const { id } = await req.json();
  await prisma.dia_chi_nguoi_dung.delete({
    where: { id: Number(id) },
  });
  return NextResponse.json({ success: true });
}
