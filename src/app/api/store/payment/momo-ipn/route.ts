import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";

// MoMo gọi endpoint này (server-to-server) sau khi thanh toán hoàn tất
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const {
      partnerCode,
      orderId,       // Dạng: "123_1714000000000"
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature,
    } = body;

    // === BƯỚC 1: VERIFY CHỮ KÝ TỪ MOMO ===
    const accessKey = process.env.MOMO_ACCESS_KEY || "klm05TvNCzjOaHU1";
    const secretKey = process.env.MOMO_SECRET_KEY || "at67qH6mk8w5Y1nAwMovdPTlcjTA21kH";

    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
    const expectedSignature = crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex");

    if (signature !== expectedSignature) {
      console.error("❌ MoMo IPN: Chữ ký không hợp lệ!", { signature, expectedSignature });
      return NextResponse.json({ resultCode: 1, message: "Invalid signature" });
    }

    // === BƯỚC 2: LẤY ID ĐƠN HÀNG THỰC (bỏ phần timestamp) ===
    const realOrderId = parseInt(orderId.split("_")[0]);
    if (isNaN(realOrderId)) {
      return NextResponse.json({ resultCode: 1, message: "Invalid orderId" });
    }

    // === BƯỚC 3: CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG ===
    if (resultCode === 0) {
      // Thanh toán THÀNH CÔNG
      await prisma.don_hang.update({
        where: { id: realOrderId },
        data: { trang_thai: "DA_THANH_TOAN" } as any,
      });
      console.log(`✅ MoMo IPN: Đơn hàng #${realOrderId} đã thanh toán thành công. TransId: ${transId}`);
    } else {
      // Thanh toán THẤT BẠI
      await prisma.don_hang.update({
        where: { id: realOrderId },
        data: { trang_thai: "THANH_TOAN_THAT_BAI" } as any,
      });
      console.log(`❌ MoMo IPN: Đơn hàng #${realOrderId} thanh toán thất bại. ResultCode: ${resultCode}`);
    }

    // === BƯỚC 4: PHẢN HỒI LẠI MOMO (BẮT BUỘC) ===
    return NextResponse.json({ resultCode: 0, message: "success" });

  } catch (error: any) {
    console.error("🔥 MoMo IPN Error:", error);
    return NextResponse.json({ resultCode: 1, message: error.message }, { status: 500 });
  }
}
