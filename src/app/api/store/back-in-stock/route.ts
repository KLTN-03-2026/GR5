import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

// ============================================================================
// [POST] ĐĂNG KÝ NHẬN THÔNG BÁO KHI CÓ HÀNG TRỞ LẠI
// - Sử dụng bảng thong_bao với loai_thong_bao = "CO_HANG_TRO_LAI"
// - Hỗ trợ user đã đăng nhập (guest cần đăng nhập để nhận thông báo)
// - Body: { productId, variantId? }
// ============================================================================
export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user ? Number((session.user as any).id) : null;

    const body = await req.json();
    const { productId, variantId } = body;

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Thiếu mã sản phẩm" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Vui lòng đăng nhập để nhận thông báo khi có hàng trở lại" },
        { status: 401 }
      );
    }

    // Check if product exists
    const product = await prisma.san_pham.findUnique({
      where: { id: Number(productId) },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Sản phẩm không tồn tại" },
        { status: 404 }
      );
    }

    // Build a unique identifier for this subscription in noi_dung
    const subscriptionKey = variantId
      ? `BACK_IN_STOCK:product=${productId}:variant=${variantId}`
      : `BACK_IN_STOCK:product=${productId}`;

    // Check if already subscribed (look for existing unread notification with same key)
    const existing = await prisma.thong_bao.findFirst({
      where: {
        ma_nguoi_dung: userId,
        loai_thong_bao: "CO_HANG_TRO_LAI",
        noi_dung: { contains: subscriptionKey },
        da_doc: false,
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: true,
          message: "Bạn đã đăng ký nhận thông báo cho sản phẩm này rồi",
          alreadySubscribed: true,
        },
        { status: 200 }
      );
    }

    // Create subscription as a notification entry
    const notification = await prisma.thong_bao.create({
      data: {
        ma_nguoi_dung: userId,
        tieu_de: `Đăng ký thông báo có hàng: ${product.ten_san_pham}`,
        noi_dung: subscriptionKey,
        loai_thong_bao: "CO_HANG_TRO_LAI",
        da_doc: false,
        ngay_tao: new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Đăng ký thành công! Chúng tôi sẽ thông báo khi sản phẩm có hàng trở lại.",
        data: { id: notification.id },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Back-in-stock subscription error:", error);
    return NextResponse.json(
      { success: false, message: "Có lỗi xảy ra, vui lòng thử lại sau" },
      { status: 500 }
    );
  }
}
