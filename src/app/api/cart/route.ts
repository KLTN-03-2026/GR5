import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const userId = Number((session.user as any).id);

    let gioHang = await prisma.gio_hang.findUnique({
      where: { ma_nguoi_dung: userId },
      include: {
        chi_tiet_gio_hang: {
          include: {
            bien_the_san_pham: {
              include: {
                san_pham: {
                  include: {
                    anh_san_pham: { where: { la_anh_chinh: true }, take: 1 },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!gioHang) {
      gioHang = await prisma.gio_hang.create({
        data: { ma_nguoi_dung: userId },
        include: {
          chi_tiet_gio_hang: {
            include: {
              bien_the_san_pham: {
                include: {
                  san_pham: {
                    include: {
                      anh_san_pham: { where: { la_anh_chinh: true }, take: 1 },
                    },
                  },
                },
              },
            },
          },
        },
      });
    }

    const items = gioHang.chi_tiet_gio_hang.map((ct) => ({
      id: ct.bien_the_san_pham?.ma_san_pham,
      ma_bien_the: ct.ma_bien_the,
      ten_san_pham: ct.bien_the_san_pham?.san_pham?.ten_san_pham || "",
      gia_ban: Number(ct.bien_the_san_pham?.gia_ban || 0),
      anh_chinh: ct.bien_the_san_pham?.san_pham?.anh_san_pham?.[0]?.duong_dan_anh || "",
      phan_loai: ct.bien_the_san_pham?.ten_bien_the || "",
      so_luong: ct.so_luong || 1,
    }));

    return NextResponse.json({ items, cartId: gioHang.id });
  } catch (error) {
    console.error("Lỗi lấy giỏ hàng:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
