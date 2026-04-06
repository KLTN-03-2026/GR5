import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { format } from "date-fns";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, type } = body;

    // KIỂM TRA ĐẦU VÀO
    if (!orderId || isNaN(Number(orderId))) {
      return NextResponse.json({ success: false, message: "Mã đơn hàng không hợp lệ" }, { status: 400 });
    }

    const order = await prisma.don_hang.findUnique({
      where: { id: Number(orderId) },
    });

    if (!order) {
      return NextResponse.json({ success: false, message: "Đơn hàng không tồn tại" }, { status: 404 });
    }

    const rawAmount = Number(order.tong_tien);

    // ==========================================
    // 🚀 LUỒNG THANH TOÁN VNPAY
    // ==========================================
    if (type === 'vnpay') {
      if (rawAmount < 5000) {
        return NextResponse.json({ success: false, message: "Số tiền tối thiểu cho VNPay là 5,000đ" }, { status: 400 });
      }

      const tmnCode = process.env.VNP_TMN_CODE || "YOUR_TMN_CODE"; 
      const hashSecret = process.env.VNP_HASH_SECRET || "YOUR_HASH_SECRET";
      const vnpUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
      const returnUrl = "http://localhost:3000/payment/check";

      const createDate = format(new Date(), "yyyyMMddHHmmss");
      const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";

      let vnp_Params: any = {
        vnp_Version: "2.1.0",
        vnp_Command: "pay",
        vnp_TmnCode: tmnCode,
        vnp_Locale: "vn",
        vnp_CurrCode: "VND",
        vnp_TxnRef: order.id.toString(),
        vnp_OrderInfo: `Thanh toan don hang #${order.id}`,
        vnp_OrderType: "other",
        vnp_Amount: Math.round(rawAmount * 100).toString(),
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: ip,
        vnp_CreateDate: createDate,
      };

      vnp_Params = Object.keys(vnp_Params).sort().reduce((obj: any, key) => {
        obj[key] = vnp_Params[key];
        return obj;
      }, {});

      const signData = new URLSearchParams(vnp_Params).toString();
      const hmac = crypto.createHmac("sha512", hashSecret);
      const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

      return NextResponse.json({ 
        success: true, 
        paymentUrl: `${vnpUrl}?${signData}&vnp_SecureHash=${signed}` 
      });
    } 
   
    // 🚀 LUỒNG THANH TOÁN MOMO
    // ==========================================
   // ==========================================
   
    else if (type === 'momo') {
      // Dùng bộ Key Test siêu ổn định của MoMo
      const partnerCode = "MOMOBKUN20180529";
      const accessKey = "klm05TvNCzjOaHU1";
      const secretKey = "at67qH6mk8w5Y1nAwMovdPTlcjTA21kH";
      
      const momoApiUrl = "https://test-payment.momo.vn/v2/gateway/api/create";
      const redirectUrl = "http://localhost:3000/payment/check";
      const ipnUrl = "http://localhost:3000/api/store/payment/momo-ipn";

      const momoOrderId = orderId.toString() + "_" + Date.now();
      const requestId = momoOrderId; 
      
      // QUAN TRỌNG NHẤT Ở ĐÂY: Phân biệt String và Number
      const amountNumber = Math.round(Number(rawAmount)); 
      const amountString = amountNumber.toString(); 
      
      const orderInfo = `Thanh toan don hang ${order.id}`; 
      const requestType = "captureWallet";
      const extraData = ""; 

      // 1. Tạo chữ ký (dùng amountString)
      const rawSignature = `accessKey=${accessKey}&amount=${amountString}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${momoOrderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
      
      const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

      // 2. Gói Data gửi đi (dùng amountNumber)
      const requestBody = {
        partnerCode: partnerCode,
        accessKey: accessKey,
        requestId: requestId,
        amount: amountNumber, // BẮT BUỘC LÀ NUMBER
        orderId: momoOrderId,
        orderInfo: orderInfo,
        redirectUrl: redirectUrl,
        ipnUrl: ipnUrl,
        extraData: extraData,
        requestType: requestType,
        signature: signature,
        lang: "vi"
      };

      const momoRes = await fetch(momoApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const momoData = await momoRes.json();
      
      if (momoData.resultCode === 0) {
         return NextResponse.json({ success: true, paymentUrl: momoData.payUrl });
      } else {
         console.error("❌ MOMO ERROR:", momoData);
         return NextResponse.json({ success: false, message: momoData.message });
      }
    }

    return NextResponse.json({ success: false, message: "Phương thức không hỗ trợ" });

  } catch (error: any) {
    console.error("🔥 LỖI THANH TOÁN:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}