import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function getOrCreateCart(userId: number) {
  let cart = await prisma.gio_hang.findUnique({
    where: { ma_nguoi_dung: userId },
  });
  if (!cart) {
    cart = await prisma.gio_hang.create({ data: { ma_nguoi_dung: userId } });
  }
  return cart;
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const userId = Number((session.user as any).id);
    const { ma_bien_the, so_luong } = await req.json();

    if (!ma_bien_the || !so_luong || so_luong < 1) {
      return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
    }

    const cart = await getOrCreateCart(userId);

    const existing = await prisma.chi_tiet_gio_hang.findFirst({
      where: { ma_gio_hang: cart.id, ma_bien_the },
    });

    if (existing) {
      await prisma.chi_tiet_gio_hang.update({
        where: { id: existing.id },
        data: { so_luong: (existing.so_luong || 0) + so_luong },
      });
    } else {
      await prisma.chi_tiet_gio_hang.create({
        data: { ma_gio_hang: cart.id, ma_bien_the, so_luong },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lỗi thêm giỏ hàng:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const userId = Number((session.user as any).id);
    const { ma_bien_the, so_luong } = await req.json();

    if (!ma_bien_the || !so_luong || so_luong < 1 || so_luong > 99) {
      return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
    }

    const cart = await prisma.gio_hang.findUnique({
      where: { ma_nguoi_dung: userId },
    });

    if (!cart) {
      return NextResponse.json({ error: "Giỏ hàng không tồn tại" }, { status: 404 });
    }

    const item = await prisma.chi_tiet_gio_hang.findFirst({
      where: { ma_gio_hang: cart.id, ma_bien_the },
    });

    if (!item) {
      return NextResponse.json({ error: "Sản phẩm không có trong giỏ" }, { status: 404 });
    }

    await prisma.chi_tiet_gio_hang.update({
      where: { id: item.id },
      data: { so_luong },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lỗi cập nhật giỏ hàng:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const userId = Number((session.user as any).id);
    const { ma_bien_the } = await req.json();

    if (!ma_bien_the) {
      return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
    }

    const cart = await prisma.gio_hang.findUnique({
      where: { ma_nguoi_dung: userId },
    });

    if (!cart) {
      return NextResponse.json({ error: "Giỏ hàng không tồn tại" }, { status: 404 });
    }

    await prisma.chi_tiet_gio_hang.deleteMany({
      where: { ma_gio_hang: cart.id, ma_bien_the },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lỗi xóa giỏ hàng:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
