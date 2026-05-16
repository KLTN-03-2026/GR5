import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

  export async function POST(req: Request) {
    try {
      const body = await req.json();
      const { orderId, type } = body;

      // KIEM TRA DAU VAO
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
    // LUONG THANH TOAN VNPAY (THEO TAI LIEU CHINH THUC)
    // ==========================================
    if (type === 'vnpay') {
      if (rawAmount < 5000) {
        return NextResponse.json({ success: false, message: "Số tiền tối thiểu là 5,000đ" }, { status: 400 });
      }

      const tmnCode = process.env.VNPAY_TMN_CODE;
      const secretKey = process.env.VNPAY_SECRET_KEY;
      const vnpUrl = process.env.VNPAY_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
      const returnUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001"}/api/store/payment/vnpay-return`;

      if (!tmnCode || !secretKey) {
        console.error("[VNPay] VNPAY_TMN_CODE or VNPAY_SECRET_KEY is not configured in .env");
        return NextResponse.json({ success: false, message: "Cấu hình thanh toán VNPay chưa đúng" }, { status: 500 });
      }

      const now = new Date();
      const formatDate = (d: Date) => [
        d.getFullYear(),
        String(d.getMonth() + 1).padStart(2, '0'),
        String(d.getDate()).padStart(2, '0'),
        String(d.getHours()).padStart(2, '0'),
        String(d.getMinutes()).padStart(2, '0'),
        String(d.getSeconds()).padStart(2, '0'),
      ].join('');

      const createDate = formatDate(now);
      const expireDate = formatDate(new Date(now.getTime() + 15 * 60000));

      const txnRef = `${order.id}_${Date.now()}`;

      const forwarded = req.headers.get("x-forwarded-for");
      let ip = forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip") || "127.0.0.1";
      if (ip === "::1" || ip === "::ffff:127.0.0.1" || ip.includes(":")) {
        ip = "127.0.0.1";
      }

      const vnp_Params: Record<string, string> = {
        vnp_Version: "2.1.0",
        vnp_Command: "pay",
        vnp_TmnCode: tmnCode,
        vnp_Amount: Math.round(rawAmount * 100).toString(),
        vnp_CurrCode: "VND",
        vnp_TxnRef: txnRef,
        vnp_OrderInfo: `Thanh toan don hang ${order.id}`,
        vnp_OrderType: "other",
        vnp_Locale: "vn",
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: ip,
        vnp_CreateDate: createDate,
        vnp_ExpireDate: expireDate,
      };

      function vnpaySortObject(obj: Record<string, string>) {
        const sorted: Record<string, string> = {};
        const keys = Object.keys(obj)
          .filter(k => obj[k] !== null && obj[k] !== undefined && obj[k] !== '')
          .map(k => encodeURIComponent(k))
          .sort();
        for (const key of keys) {
          sorted[key] = encodeURIComponent(obj[decodeURIComponent(key)]).replace(/%20/g, '+');
        }
        return sorted;
      }

      const sortedParams = vnpaySortObject(vnp_Params);

      const signData = Object.keys(sortedParams)
        .map(key => `${key}=${sortedParams[key]}`)
        .join("&");

      const signed = crypto
        .createHmac("sha512", secretKey)
        .update(Buffer.from(signData, "utf-8"))
        .digest("hex");

      const finalUrl = `${vnpUrl}?${signData}&vnp_SecureHash=${signed}`;

      console.log(`[VNPay] Payment URL created for order #${order.id}, amount=${rawAmount}, txnRef=${txnRef}`);

      return NextResponse.json({
        success: true,
        paymentUrl: finalUrl
      });
    }
      
      // ==========================================
      // 🚀 LUỒNG THANH TOÁN MOMO
      // ==========================================
      else if (type === 'momo') {
        // Ưu tiên lấy từ .env, nếu không có thì dùng Key Test
        const partnerCode = process.env.MOMO_PARTNER_CODE || "MOMO";
        const accessKey = process.env.MOMO_ACCESS_KEY || "F8BBA842ECF85";
        const secretKey = process.env.MOMO_SECRET_KEY || "K951B6PE1waDMi640xX08PD3vg6EkVlz";
        
        const momoApiUrl = "https://test-payment.momo.vn/v2/gateway/api/create";
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001";
        const redirectUrl = `${baseUrl}/payment/check`;
        const ipnUrl = `${baseUrl}/api/store/payment/momo-ipn`;

        const momoOrderId = orderId.toString() + "_" + Date.now();
        const requestId = momoOrderId;

        const amountNumber = Math.round(Number(rawAmount));
        const amountString = amountNumber.toString();

        const orderInfo = `Payment for order ${order.id}`;
        const requestType = "payWithMethod";
        const extraData = "";

        // rawSignature fields MUST be in EXACT alphabetical order
        const rawSignature = `accessKey=${accessKey}&amount=${amountString}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${momoOrderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

        console.log("MOMO rawSignature:", rawSignature);
        const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');
        console.log("MOMO signature:", signature);

        const requestBody = {
          partnerCode: partnerCode,
          accessKey: accessKey,
          requestId: requestId,
          amount: amountNumber,
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

      return NextResponse.json({ success: false, message: "Phương thức thanh toán không hợp lệ" }, { status: 400 });

    } catch (error: any) {
      console.error("🔥 LỖI THANH TOÁN SERVER:", error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }