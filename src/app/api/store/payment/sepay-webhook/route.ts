import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ensureOrderIssueTicket } from "@/lib/warehouse-issue";

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

    console.log("[SEPAY WEBHOOK] Payload nhận được:", JSON.stringify(body));

    const { content, transferAmount, transferType, referenceCode } = body;

    if (transferType !== "in") {
      console.log("[SEPAY WEBHOOK] Bỏ qua: transferType =", transferType);
      return NextResponse.json({ success: true, message: "Bỏ qua giao dịch tiền ra" });
    }

    if (!content) {
      console.log("[SEPAY WEBHOOK] Bỏ qua: content rỗng");
      return NextResponse.json({ success: true, message: "Không có nội dung CK" });
    }

    // 3. Trích xuất Mã đơn hàng (VD: "DH123" -> lấy số 123)
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

    if (order.trang_thai === "DA_THANH_TOAN" || order.trang_thai === "CHO_GIAO_HANG" || order.trang_thai === "CHO_XU_LY") {
      return NextResponse.json({ success: true, message: "Đơn hàng đã được thanh toán trước đó" });
    }

    if (order.trang_thai === "DA_HUY" || order.trang_thai === "THANH_TOAN_THAT_BAI") {
      return NextResponse.json({ success: true, message: "Đơn hàng đã bị hủy hoặc thanh toán thất bại" });
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

    // 6. Cập nhật trạng thái đơn hàng & giao dịch thanh toán
    let didConfirm = false;
    await prisma.$transaction(async (tx) => {
      // 6.1. Cập nhật đơn hàng → CHO_XU_LY (đã thanh toán, chờ nhân viên xử lý)
      const updated = await tx.don_hang.updateMany({
        where: {
          id: orderId,
          trang_thai: { notIn: ["DA_THANH_TOAN", "CHO_XU_LY", "CHO_GIAO_HANG", "DA_HUY", "THANH_TOAN_THAT_BAI"] },
        },
        data: { trang_thai: "CHO_XU_LY" }
      });

      if (updated.count === 0) return;
      didConfirm = true;

      // 6.2. Update giao dịch có sẵn hoặc tạo mới
      const existingTx = await tx.giao_dich_thanh_toan.findFirst({
        where: { ma_don_hang: orderId }
      });

      if (existingTx) {
        await tx.giao_dich_thanh_toan.update({
          where: { id: existingTx.id },
          data: {
            trang_thai: "DA_THANH_TOAN",
            ma_giao_dich_ben_ngoai: referenceCode || "SEPAY_BANK",
          }
        });
      } else {
        await tx.giao_dich_thanh_toan.create({
          data: {
            ma_don_hang: orderId,
            so_tien: paidAmount,
            trang_thai: "DA_THANH_TOAN",
            ma_giao_dich_ben_ngoai: referenceCode || "SEPAY_BANK",
            phuong_thuc_thanh_toan: "CHUYEN_KHOAN"
          }
        });
      }

      // 6.3. Ghi lịch sử đơn hàng
      await tx.lich_su_don_hang.create({
        data: { ma_don_hang: orderId, trang_thai: "CHO_XU_LY" }
      });

      await ensureOrderIssueTicket(tx, orderId);
    });

    if (!didConfirm) {
      return NextResponse.json({ success: true, message: "Đơn hàng đã được xử lý trước đó" });
    }

    console.log(`[SEPAY WEBHOOK] Đã xác nhận đơn DH${orderId} - chuyển sang CHO_GIAO_HANG, số tiền ${paidAmount}`);

    return NextResponse.json({ success: true, message: "Xác nhận thanh toán tự động thành công!" });

  } catch (error: any) {
    console.error("[SEPAY WEBHOOK ERROR]:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
