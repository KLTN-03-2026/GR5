import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { ensureOrderIssueTicket } from "@/lib/warehouse-issue";

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
    const accessKey = process.env.MOMO_ACCESS_KEY || "F8BBA842ECF85";
    const secretKey = process.env.MOMO_SECRET_KEY || "K951B6PE1waDMi640xX08PD3vg6EkVlz";

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

    // === BƯỚC 3: IDEMPOTENCY GUARD ===
    const order = await prisma.don_hang.findUnique({
      where: { id: realOrderId },
    });

    if (!order) {
      return NextResponse.json({ resultCode: 1, message: "Order not found" });
    }

    const orderStatus = (order as any).trang_thai;

    // Neu don da thanh toan roi thi khong xu ly lai
    if (orderStatus === "DA_THANH_TOAN" || orderStatus === "CHO_GIAO_HANG") {
      console.log(`[MoMo IPN] Order #${realOrderId} already paid, skipping`);
      return NextResponse.json({ resultCode: 0, message: "success" });
    }

    // Neu don da bi huy hoac that bai roi thi khong xu ly lai (tranh hoan kho 2 lan)
    if (orderStatus === "DA_HUY" || orderStatus === "THANH_TOAN_THAT_BAI") {
      console.log(`[MoMo IPN] Order #${realOrderId} already ${orderStatus}, skipping`);
      return NextResponse.json({ resultCode: 0, message: "success" });
    }

    // === BƯỚC 4: CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG ===
    if (resultCode === 0) {
      // Thanh toán THÀNH CÔNG - Dung atomic update voi WHERE condition
      const updated = await prisma.don_hang.updateMany({
        where: { id: realOrderId, trang_thai: "CHO_XAC_NHAN" },
        data: { trang_thai: "CHO_XU_LY" } as any,
      });

      if (updated.count === 0) {
        console.warn(`[MoMo IPN] Order #${realOrderId} could not be marked as paid (status already changed)`);
        return NextResponse.json({ resultCode: 0, message: "success" });
      }

      // Cap nhat giao dich thanh toan
      await prisma.giao_dich_thanh_toan.updateMany({
        where: { ma_don_hang: realOrderId, trang_thai: "CHO_THANH_TOAN" },
        data: { trang_thai: "DA_THANH_TOAN" } as any,
      });

      await prisma.lich_su_don_hang.create({
        data: { ma_don_hang: realOrderId, trang_thai: "CHO_XU_LY" }
      });

      await ensureOrderIssueTicket(prisma, realOrderId);

      console.log(`[MoMo IPN] Order #${realOrderId} paid successfully, moved to CHO_XU_LY. TransId: ${transId}`);
    } else {
      // Thanh toán THẤT BẠI - Dung atomic update de chi hoan kho 1 lan duy nhat
      const updated = await prisma.don_hang.updateMany({
        where: { id: realOrderId, trang_thai: "CHO_XAC_NHAN" },
        data: { trang_thai: "THANH_TOAN_THAT_BAI" } as any,
      });

      if (updated.count === 0) {
        // Don hang da duoc xu ly boi handler khac (cancel-unpaid, etc.)
        console.log(`[MoMo IPN] Order #${realOrderId} already processed by another handler, skipping stock restore`);
        return NextResponse.json({ resultCode: 0, message: "success" });
      }

      // Chi hoan kho khi atomic update thanh cong (dam bao chi hoan 1 lan)
      await prisma.$transaction(async (tx) => {
        const chiTiet = await tx.chi_tiet_don_hang.findMany({
          where: { ma_don_hang: realOrderId }
        });

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

        // Cap nhat giao dich thanh toan
        await tx.giao_dich_thanh_toan.updateMany({
          where: { ma_don_hang: realOrderId, trang_thai: "CHO_THANH_TOAN" },
          data: { trang_thai: "THAT_BAI" } as any,
        });

        // Them lich su
        await tx.lich_su_don_hang.create({
          data: { ma_don_hang: realOrderId, trang_thai: "THANH_TOAN_THAT_BAI" }
        });
      });
      console.log(`[MoMo IPN] Order #${realOrderId} payment failed. ResultCode: ${resultCode}. Stock restored.`);
    }

    // === BƯỚC 4: PHẢN HỒI LẠI MOMO (BẮT BUỘC) ===
    return NextResponse.json({ resultCode: 0, message: "success" });

  } catch (error: any) {
    console.error("🔥 MoMo IPN Error:", error);
    return NextResponse.json({ resultCode: 1, message: error.message }, { status: 500 });
  }
}
