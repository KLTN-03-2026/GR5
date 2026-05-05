import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";

// VNPay redirect user's browser đến đây sau khi thanh toán
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Lấy toàn bộ params từ VNPay
    const vnpParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      vnpParams[key] = value;
    });

    const secureHash = vnpParams["vnp_SecureHash"];
    const responseCode = vnpParams["vnp_ResponseCode"];
    const txnRef = vnpParams["vnp_TxnRef"]; // Dạng: "123_1714000000000"

    if (!secureHash || !txnRef) {
      return NextResponse.redirect(new URL("/payment/check?status=failed&reason=missing_params", req.url));
    }

    // === BƯỚC 1: VERIFY CHỮ KÝ VNPAY ===
    const secretKey = process.env.VNPAY_SECRET_KEY || "GM2XYUP38PA43ASTS8YU4MD2AT22JL8N";

    // Xóa vnp_SecureHash và vnp_SecureHashType khỏi params trước khi tính lại hash
    delete vnpParams["vnp_SecureHash"];
    delete vnpParams["vnp_SecureHashType"];

    // Sắp xếp theo key A-Z
    const sortedKeys = Object.keys(vnpParams).sort();
    const signData = sortedKeys
      .map((key) => `${key}=${encodeURIComponent(vnpParams[key]).replace(/%20/g, "+")}`)
      .join("&");

    const expectedHash = crypto.createHmac("sha512", secretKey).update(Buffer.from(signData, "utf-8")).digest("hex");

    if (secureHash !== expectedHash) {
      console.error("❌ VNPay Return: Chữ ký không khớp!");
      return NextResponse.redirect(new URL("/payment/check?status=failed&reason=invalid_signature", req.url));
    }

    // === BƯỚC 2: LẤY ORDER ID THỰC ===
    const realOrderId = parseInt(txnRef.split("_")[0]);
    if (isNaN(realOrderId)) {
      return NextResponse.redirect(new URL("/payment/check?status=failed&reason=invalid_order", req.url));
    }

    // === BƯỚC 3: CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG ===
    if (responseCode === "00") {
      // THÀNH CÔNG
      await prisma.don_hang.update({
        where: { id: realOrderId },
        data: { trang_thai: "DA_THANH_TOAN" } as any,
      });
      console.log(`✅ VNPay Return: Đơn hàng #${realOrderId} đã thanh toán thành công.`);
      return NextResponse.redirect(new URL(`/payment/check?orderId=${realOrderId}&status=success&method=vnpay`, req.url));
    } else {
      // THẤT BẠI
      await prisma.don_hang.update({
        where: { id: realOrderId },
        data: { trang_thai: "THANH_TOAN_THAT_BAI" } as any,
      });
      console.log(`❌ VNPay Return: Đơn hàng #${realOrderId} thất bại. Code: ${responseCode}`);
      return NextResponse.redirect(new URL(`/payment/check?orderId=${realOrderId}&status=failed&method=vnpay&code=${responseCode}`, req.url));
    }

  } catch (error: any) {
    console.error("🔥 VNPay Return Error:", error);
    return NextResponse.redirect(new URL("/payment/check?status=failed&reason=server_error", req.url));
  }
}
