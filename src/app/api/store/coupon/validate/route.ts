import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = 'force-dynamic';

/**
 * [POST] Validate a coupon code and return the discount amount.
 * Called from the payment page when user clicks "Apply" on a coupon code.
 * This does NOT consume the coupon - it only validates and previews the discount.
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Chua dang nhap" }, { status: 401 });
    }

    const body = await req.json();
    const { ma_code, tong_tien_hang } = body;

    if (!ma_code || typeof ma_code !== 'string' || !ma_code.trim()) {
      return NextResponse.json({ success: false, message: "Vui long nhap ma giam gia" }, { status: 400 });
    }

    const coupon = await prisma.ma_giam_gia.findUnique({
      where: { ma_code: ma_code.trim() },
    });

    if (!coupon) {
      return NextResponse.json({ success: false, message: "Ma giam gia khong ton tai" }, { status: 400 });
    }

    // Check expiration dates
    const now = new Date();
    if (coupon.ngay_bat_dau && now < new Date(coupon.ngay_bat_dau)) {
      return NextResponse.json({ success: false, message: "Ma giam gia chua den thoi gian su dung" }, { status: 400 });
    }
    if (coupon.ngay_ket_thuc && now > new Date(coupon.ngay_ket_thuc)) {
      return NextResponse.json({ success: false, message: "Ma giam gia da het han" }, { status: 400 });
    }

    // Check usage limit
    if (coupon.gioi_han_su_dung !== null && coupon.gioi_han_su_dung !== undefined) {
      const usageCount = await prisma.don_hang.count({
        where: { ma_khuyen_mai: coupon.id, trang_thai: { not: "DA_HUY" } },
      });
      if (usageCount >= coupon.gioi_han_su_dung) {
        return NextResponse.json({ success: false, message: "Ma giam gia da het luot su dung" }, { status: 400 });
      }
    }

    // Check minimum order amount
    const tongTienHang = Number(tong_tien_hang || 0);
    if (coupon.don_toi_thieu && tongTienHang < Number(coupon.don_toi_thieu)) {
      return NextResponse.json({
        success: false,
        message: `Don hang toi thieu ${Number(coupon.don_toi_thieu).toLocaleString('vi-VN')}d de su dung ma nay`
      }, { status: 400 });
    }

    // Calculate discount amount
    const giaTriGiam = Number(coupon.gia_tri_giam || 0);
    let soTienGiam = 0;

    if (coupon.loai_giam_gia === 'PHAN_TRAM' || coupon.loai_giam_gia === 'percent') {
      soTienGiam = Math.round(tongTienHang * giaTriGiam / 100);
    } else {
      // Fixed amount discount
      soTienGiam = giaTriGiam;
    }

    // Discount cannot exceed product total
    soTienGiam = Math.min(soTienGiam, tongTienHang);

    return NextResponse.json({
      success: true,
      so_tien_giam: soTienGiam,
      loai_giam_gia: coupon.loai_giam_gia,
      gia_tri_giam: giaTriGiam,
    });
  } catch (error: any) {
    console.error("Loi validate coupon:", error.message);
    return NextResponse.json({ success: false, message: "Loi he thong" }, { status: 500 });
  }
}
