import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Webhook API cho SePay (Tự động xác nhận chuyển khoản ngân hàng)
 * Tài liệu SePay: https://docs.sepay.vn/webhook.html
 */
export async function POST(req: Request) {
  try {
    // 1. Kiểm tra Token bảo mật từ Header (Tránh bị fake request)
    // Cấu hình mã này trong phần Webhook của SePay Dashboard và file .env
    const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
    const EXPECTED_TOKEN = process.env.SEPAY_WEBHOOK_TOKEN || "sepay_test_token_123";

    if (!authHeader || !authHeader.includes(EXPECTED_TOKEN)) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse dữ liệu từ SePay gửi về
    const body = await req.json();
    
    // Payload của SePay thường có các trường:
    // gateway, transactionDate, accountNumber, content, transferType, transferAmount, referenceCode
    const { content, transferAmount, transferType, referenceCode } = body;

    // Chỉ quan tâm giao dịch cộng tiền (tiền vào)
    if (transferType !== "in") {
      return NextResponse.json({ success: true, message: "Bỏ qua giao dịch tiền ra" });
    }

    if (!content) {
      return NextResponse.json({ success: true, message: "Không có nội dung CK" });
    }

    // 3. Trích xuất Mã đơn hàng (VD: "DH123" -> lấy số 123)
    // Regex tìm chữ DH (không phân biệt hoa thường) kèm theo các chữ số
    const match = content.match(/DH(\d+)/i);
    
    if (!match) {
      return NextResponse.json({ success: true, message: "Nội dung không chứa mã đơn hàng hợp lệ" });
    }

    const orderId = parseInt(match[1], 10);

    // 4. Kiểm tra đơn hàng trong Database
    const order = await prisma.don_hang.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return NextResponse.json({ success: true, message: `Không tìm thấy đơn hàng ID: ${orderId}` });
    }

    if (order.trang_thai === "DA_THANH_TOAN") {
      return NextResponse.json({ success: true, message: "Đơn hàng đã được thanh toán trước đó" });
    }

    // 5. Kiểm tra số tiền
    // Nếu tiền CK >= Tổng tiền đơn hàng (hoặc cho phép thiếu một chút tùy nghiệp vụ, ở đây check >=)
    const expectedAmount = Number(order.tong_tien || 0);
    const paidAmount = Number(transferAmount || 0);

    if (paidAmount < expectedAmount) {
      return NextResponse.json({ 
        success: true, 
        message: `Chuyển thiếu tiền. Yêu cầu: ${expectedAmount}, Thực nhận: ${paidAmount}` 
      });
    }

    // 6. Cập nhật trạng thái đơn hàng & Lưu giao dịch
    // Dùng Transaction để đảm bảo tính toàn vẹn dữ liệu
    await prisma.$transaction([
      // 6.1. Cập nhật trạng thái đơn
      prisma.don_hang.update({
        where: { id: orderId },
        data: { trang_thai: "DA_THANH_TOAN" }
      }),
      // 6.2. Ghi nhận giao dịch
      prisma.giao_dich_thanh_toan.create({
        data: {
          ma_don_hang: orderId,
          so_tien: paidAmount,
          trang_thai: "THANH_CONG",
          ma_giao_dich_ben_ngoai: referenceCode || "SEPAY_BANK",
          phuong_thuc_thanh_toan: "CHUYEN_KHOAN"
        }
      })
    ]);

    console.log(`[SEPAY WEBHOOK] Đã tự động xác nhận đơn hàng DH${orderId} với số tiền ${paidAmount}`);

    return NextResponse.json({ success: true, message: "Xác nhận thanh toán tự động thành công!" });

  } catch (error: any) {
    console.error("[SEPAY WEBHOOK ERROR]:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
