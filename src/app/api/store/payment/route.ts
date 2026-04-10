  import { NextResponse } from "next/server";
  import prisma from "@/lib/prisma";
  import crypto from "crypto";
  import { format } from "date-fns";
  import qs from "qs"; // Thư viện cực kỳ quan trọng để fix lỗi 97 của VNPay

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
    // 🚀 LUỒNG THANH TOÁN VNPAY (BẢN CHUẨN CUỐI CÙNG - KHÔNG THƯ VIỆN)
    // ==========================================
    if (type === 'vnpay') {
      const rawAmount = Number(order.tong_tien);
      if (rawAmount < 5000) {
        return NextResponse.json({ success: false, message: "Số tiền tối thiểu là 5,000đ" }, { status: 400 });
      }

      // 1. KEY VÀ CẤU HÌNH (Dùng đúng Key bạn đang test)
      const tmnCode = "N2FLX63Y";
      const secretKey = "GM2XYUP38PA43ASTS8YU4MD2AT22JL8N";
      const vnpUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
      const returnUrl = "http://localhost:3000/payment/check";

      const createDate = format(new Date(), "yyyyMMddHHmmss");
      const txnRef = `${order.id}_${Date.now()}`;

      // 2. KHAI BÁO THAM SỐ GỐC
      let vnp_Params: any = {
        vnp_Amount: Math.round(rawAmount * 100).toString(),
        vnp_Command: "pay",
        vnp_CreateDate: createDate,
        vnp_CurrCode: "VND",
        vnp_IpAddr: "127.0.0.1",
        vnp_Locale: "vn",
        vnp_OrderInfo: `Thanh toan don hang ${order.id}`,
        vnp_OrderType: "other",
        vnp_ReturnUrl: returnUrl,
        vnp_TmnCode: tmnCode,
        vnp_TxnRef: txnRef,
        vnp_Version: "2.1.0"
      };

      // 3. HÀM MÃ HÓA VÀ SẮP XẾP ĐỘC QUYỀN CỦA VNPAY
      const sortObject = (obj: any) => {
        let sorted: any = {};
        let str = [];
        let key;
        for (key in obj) {
          if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
          }
        }
        str.sort();
        for (key = 0; key < str.length; key++) {
          // Mã hóa Value và thay thế khoảng trắng thành dấu +
          sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
        }
        return sorted;
      };

      // 4. TIẾN HÀNH XỬ LÝ (Tuyệt đối không dùng thư viện qs)
      vnp_Params = sortObject(vnp_Params);

      // Tự nối chuỗi bằng tay để đảm bảo chuỗi băm và chuỗi URL giống nhau 100%
      const signData = Object.keys(vnp_Params)
        .map(key => `${key}=${vnp_Params[key]}`)
        .join('&');

      // Tạo chữ ký từ chuỗi đã nối
      const hmac = crypto.createHmac("sha512", secretKey);
      const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

      // 5. TẠO URL CUỐI CÙNG
      const finalUrl = `${vnpUrl}?${signData}&vnp_SecureHash=${signed}`;

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
        const partnerCode = process.env.MOMO_PARTNER_CODE || "MOMOBKUN20180529";
        const accessKey = process.env.MOMO_ACCESS_KEY || "klm05TvNCzjOaHU1";
        const secretKey = process.env.MOMO_SECRET_KEY || "at67qH6mk8w5Y1nAwMovdPTlcjTA21kH";
        
        const momoApiUrl = "https://test-payment.momo.vn/v2/gateway/api/create";
        const redirectUrl = "http://localhost:3000/payment/check";
        const ipnUrl = "http://localhost:3000/api/store/payment/momo-ipn";

        const momoOrderId = orderId.toString() + "_" + Date.now();
        const requestId = momoOrderId; 
        
        // Xử lý kiểu dữ liệu tiền tệ
        const amountNumber = Math.round(Number(rawAmount)); 
        const amountString = amountNumber.toString(); 
        
        const orderInfo = `Thanh toan don hang ${order.id}`; 
        const requestType = "captureWallet";
        const extraData = ""; 

        // Tạo chữ ký (BẮT BUỘC ĐÚNG THỨ TỰ A-Z)
        const rawSignature = `accessKey=${accessKey}&amount=${amountString}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${momoOrderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
        const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

        const requestBody = {
          partnerCode: partnerCode,
          accessKey: accessKey,
          requestId: requestId,
          amount: amountNumber, // JSON yêu cầu dạng Number
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