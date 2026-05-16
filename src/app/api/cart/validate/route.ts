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

    const { items, coupon_code } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Giỏ hàng trống" }, { status: 400 });
    }

    const bienTheIds = items.map((i: any) => Number(i.ma_bien_the)).filter(Boolean);

    const bienTheList = await prisma.bien_the_san_pham.findMany({
      where: { id: { in: bienTheIds } },
      include: {
        san_pham: { select: { trang_thai: true, ten_san_pham: true } },
        lo_hang: {
          include: { ton_kho_tong: { select: { so_luong: true } } },
        },
      },
    });

    const validatedItems: any[] = [];
    const errors: string[] = [];

    for (const clientItem of items) {
      const maBienThe = Number(clientItem.ma_bien_the);
      const bienThe = bienTheList.find((bt) => bt.id === maBienThe);

      if (!bienThe) {
        errors.push(`Sản phẩm (biến thể #${maBienThe}) không tồn tại`);
        continue;
      }

      if (bienThe.san_pham?.trang_thai !== "DANG_BAN") {
        errors.push(`"${bienThe.san_pham?.ten_san_pham}" đã ngừng bán`);
        continue;
      }

      const tongTonKho = bienThe.lo_hang.reduce((sum, lh) => {
        return sum + lh.ton_kho_tong.reduce((s, tk) => s + (tk.so_luong || 0), 0);
      }, 0);

      const soLuong = Number(clientItem.so_luong) || 1;

      if (tongTonKho <= 0) {
        errors.push(`"${bienThe.san_pham?.ten_san_pham}" đã hết hàng`);
        continue;
      }

      if (soLuong > tongTonKho) {
        errors.push(`"${bienThe.san_pham?.ten_san_pham}" chỉ còn ${tongTonKho} sản phẩm`);
      }

      validatedItems.push({
        ma_bien_the: maBienThe,
        ten_san_pham: bienThe.san_pham?.ten_san_pham,
        gia_ban: Number(bienThe.gia_ban),
        so_luong: Math.min(soLuong, tongTonKho),
        ton_kho: tongTonKho,
      });
    }

    const subTotal = validatedItems.reduce((sum, item) => sum + item.gia_ban * item.so_luong, 0);
    const phiShip = subTotal >= 500000 ? 0 : 30000;

    let discount = 0;
    let couponError: string | null = null;

    if (coupon_code) {
      const coupon = await prisma.ma_giam_gia.findUnique({
        where: { ma_code: coupon_code },
      });

      if (!coupon) {
        couponError = "Mã giảm giá không tồn tại";
      } else {
        const now = new Date();

        if (coupon.ngay_bat_dau && now < coupon.ngay_bat_dau) {
          couponError = "Mã giảm giá chưa có hiệu lực";
        } else if (coupon.ngay_ket_thuc && now > coupon.ngay_ket_thuc) {
          couponError = "Mã giảm giá đã hết hạn";
        } else if (coupon.gioi_han_su_dung) {
          const usageCount = await prisma.don_hang.count({
            where: { ma_khuyen_mai: coupon.id, trang_thai: { not: "DA_HUY" } },
          });
          if (usageCount >= coupon.gioi_han_su_dung) {
            couponError = "Mã giảm giá đã hết lượt sử dụng";
          }
        }

        if (!couponError) {
          const donToiThieu = Number(coupon.don_toi_thieu || 0);
          if (subTotal < donToiThieu) {
            couponError = `Đơn hàng phải từ ${donToiThieu.toLocaleString("vi-VN")}đ`;
          } else {
            const giaTriGiam = Number(coupon.gia_tri_giam || 0);
            if (coupon.loai_giam_gia === "TIEN_MAT") {
              discount = giaTriGiam;
            } else if (coupon.loai_giam_gia === "PHAN_TRAM") {
              discount = (subTotal * giaTriGiam) / 100;
            }
          }
        }
      }
    }

    const total = Math.max(subTotal + phiShip - discount, 0);

    return NextResponse.json({
      valid: errors.length === 0,
      items: validatedItems,
      errors,
      subTotal,
      phiShip,
      discount,
      couponError,
      total,
    });
  } catch (error) {
    console.error("Lỗi validate giỏ hàng:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
