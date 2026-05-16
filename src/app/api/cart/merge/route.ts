import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const userId = Number((session.user as any).id);
    const { items } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: true, merged: 0 });
    }

    let cart = await prisma.gio_hang.findUnique({
      where: { ma_nguoi_dung: userId },
      include: { chi_tiet_gio_hang: true },
    });

    if (!cart) {
      cart = await prisma.gio_hang.create({
        data: { ma_nguoi_dung: userId },
        include: { chi_tiet_gio_hang: true },
      });
    }

    let merged = 0;

    for (const guestItem of items) {
      const maBienThe = Number(guestItem.ma_bien_the);
      if (!maBienThe) continue;

      const existing = cart.chi_tiet_gio_hang.find(
        (ct) => ct.ma_bien_the === maBienThe
      );

      if (existing) {
        const newQty = Math.min((existing.so_luong || 0) + (guestItem.so_luong || 1), 99);
        await prisma.chi_tiet_gio_hang.update({
          where: { id: existing.id },
          data: { so_luong: newQty },
        });
      } else {
        await prisma.chi_tiet_gio_hang.create({
          data: {
            ma_gio_hang: cart.id,
            ma_bien_the: maBienThe,
            so_luong: Math.min(guestItem.so_luong || 1, 99),
          },
        });
      }
      merged++;
    }

    return NextResponse.json({ success: true, merged });
  } catch (error) {
    console.error("Lỗi merge giỏ hàng:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
