import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = 'force-dynamic';

/**
 * API để hủy đơn hàng chưa thanh toán và hoàn lại kho
 * Dùng cho trường hợp:
 * - Người dùng đóng cửa sổ thanh toán mà không hoàn tất
 * - Đơn hàng quá hạn thanh toán (>30 phút)
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Chưa đăng nhập" }, { status: 401 });
    }
    const sessionUserId = Number((session.user as any).id);

    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, message: "Thiếu ID đơn hàng" }, { status: 400 });
    }

    // Kiểm tra quyền sở hữu và trạng thái đơn hàng
    const order = await prisma.don_hang.findUnique({
      where: { id: Number(orderId) },
      select: {
        ma_nguoi_dung: true,
        trang_thai: true,
        ngay_tao: true,
        giao_dich_thanh_toan: {
          select: { id: true, trang_thai: true, phuong_thuc_thanh_toan: true }
        }
      },
    });

    if (!order) {
      return NextResponse.json({ success: false, message: "Đơn hàng không tồn tại" }, { status: 404 });
    }

    if (order.ma_nguoi_dung !== sessionUserId) {
      return NextResponse.json({ success: false, message: "Bạn không có quyền thao tác đơn hàng này" }, { status: 403 });
    }

    // Chỉ hủy đơn đang chờ xác nhận và chưa thanh toán
    if (order.trang_thai !== "CHO_XAC_NHAN") {
      // Neu da bi huy hoac that bai roi thi tra ve success (idempotent)
      if (order.trang_thai === "DA_HUY" || order.trang_thai === "THANH_TOAN_THAT_BAI") {
        return NextResponse.json({ success: true, message: "Đơn hàng đã được hủy trước đó" });
      }
      return NextResponse.json({ success: false, message: "Đơn hàng không thể hủy" }, { status: 400 });
    }

    const payment = order.giao_dich_thanh_toan?.[0];
    if (payment?.trang_thai === "DA_THANH_TOAN") {
      return NextResponse.json({ success: false, message: "Đơn hàng đã thanh toán" }, { status: 400 });
    }

    // Atomic update: chi huy khi trang thai van la CHO_XAC_NHAN (tranh race condition voi IPN/return)
    const updated = await prisma.don_hang.updateMany({
      where: { id: Number(orderId), trang_thai: "CHO_XAC_NHAN" },
      data: { trang_thai: "DA_HUY" } as any,
    });

    if (updated.count === 0) {
      // Don hang da duoc xu ly boi handler khac (vnpay-return, vnpay-ipn, momo-ipn)
      console.log(`[Cancel Unpaid] Order #${orderId} already processed by another handler, skipping stock restore`);
      return NextResponse.json({ success: true, message: "Đơn hàng đã được xử lý bởi hệ thống" });
    }

    // Chi hoan kho khi atomic update thanh cong (dam bao chi hoan 1 lan duy nhat)
    await prisma.$transaction(async (tx) => {
      // Lấy chi tiết đơn hàng
      const chiTiet = await tx.chi_tiet_don_hang.findMany({
        where: { ma_don_hang: Number(orderId) }
      });

      // Hoàn lại tồn kho cho từng sản phẩm
      for (const item of chiTiet) {
        if (item.ma_bien_the && item.so_luong) {
          const stock = await tx.ton_kho_tong.findFirst({
            where: { lo_hang: { ma_bien_the: item.ma_bien_the } },
            orderBy: { ngay_cap_nhat: "desc" },
          });
          if (stock) {
            await tx.ton_kho_tong.update({
              where: { id: stock.id },
              data: { so_luong: { increment: item.so_luong } },
            });
          }
        }
      }

      // Thêm lịch sử
      await tx.lich_su_don_hang.create({
        data: {
          ma_don_hang: Number(orderId),
          trang_thai: "DA_HUY",
          ghi_chu: "Hủy do không hoàn tất thanh toán"
        }
      });

      // Cập nhật trạng thái giao dịch thanh toán
      if (payment) {
        await tx.giao_dich_thanh_toan.update({
          where: { id: payment.id },
          data: { trang_thai: "DA_HUY" } as any
        });
      }
    });

    console.log(`✅ Đã hủy đơn hàng #${orderId} và hoàn kho do không hoàn tất thanh toán`);

    return NextResponse.json({
      success: true,
      message: "Đã hủy đơn hàng và hoàn lại sản phẩm vào kho"
    });

  } catch (error: any) {
    console.error("Lỗi hủy đơn chưa thanh toán:", error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
