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

    const { code, order_subtotal } = await req.json();

    if (!code) {
      return NextResponse.json({ valid: false, error: "Chưa nhập mã giảm giá" }, { status: 400 });
    }

    const coupon = await prisma.ma_giam_gia.findUnique({
      where: { ma_code: code.trim().toUpperCase() },
    });

    if (!coupon) {
      return NextResponse.json({ valid: false, error: "Mã giảm giá không tồn tại" });
    }

    const now = new Date();

    if (coupon.ngay_bat_dau && now < coupon.ngay_bat_dau) {
      return NextResponse.json({ valid: false, error: "Mã giảm giá chưa có hiệu lực" });
    }

    if (coupon.ngay_ket_thuc && now > coupon.ngay_ket_thuc) {
      return NextResponse.json({ valid: false, error: "Mã giảm giá đã hết hạn" });
    }

    if (coupon.gioi_han_su_dung) {
      const usageCount = await prisma.don_hang.count({
        where: { ma_khuyen_mai: coupon.id, trang_thai: { not: "DA_HUY" } },
      });
      if (usageCount >= coupon.gioi_han_su_dung) {
        return NextResponse.json({ valid: false, error: "Mã giảm giá đã hết lượt sử dụng" });
      }
    }

    const donToiThieu = Number(coupon.don_toi_thieu || 0);
    const subtotal = Number(order_subtotal || 0);

    if (subtotal < donToiThieu) {
      return NextResponse.json({
        valid: false,
        error: `Đơn hàng phải từ ${donToiThieu.toLocaleString("vi-VN")}đ để dùng mã này`,
      });
    }

    let discount = 0;
    const giaTriGiam = Number(coupon.gia_tri_giam || 0);

    if (coupon.loai_giam_gia === "TIEN_MAT") {
      discount = giaTriGiam;
    } else if (coupon.loai_giam_gia === "PHAN_TRAM") {
      discount = (subtotal * giaTriGiam) / 100;
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        ma_code: coupon.ma_code,
        loai_giam_gia: coupon.loai_giam_gia,
        gia_tri_giam: giaTriGiam,
        don_toi_thieu: donToiThieu,
        ngay_ket_thuc: coupon.ngay_ket_thuc,
      },
      discount,
    });
  } catch (error) {
    console.error("Lỗi validate voucher:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
