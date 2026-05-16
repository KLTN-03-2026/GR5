import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { ensureOrderIssueTicket } from "@/lib/warehouse-issue";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const vnpParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      vnpParams[key] = value;
    });

    const secureHash = vnpParams["vnp_SecureHash"];
    const responseCode = vnpParams["vnp_ResponseCode"];
    const txnRef = vnpParams["vnp_TxnRef"];
    const amount = vnpParams["vnp_Amount"];

    if (!secureHash || !txnRef) {
      return NextResponse.json({ RspCode: "99", Message: "Missing params" });
    }

    const secretKey = process.env.VNPAY_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ RspCode: "99", Message: "Server config error" });
    }

    delete vnpParams["vnp_SecureHash"];
    delete vnpParams["vnp_SecureHashType"];

    const sortedParams: Record<string, string> = {};
    const sortedKeys = Object.keys(vnpParams)
      .filter(k => vnpParams[k] !== null && vnpParams[k] !== undefined && vnpParams[k] !== '')
      .map(k => encodeURIComponent(k))
      .sort();
    for (const key of sortedKeys) {
      sortedParams[key] = encodeURIComponent(vnpParams[decodeURIComponent(key)]).replace(/%20/g, '+');
    }

    const signData = Object.keys(sortedParams)
      .map(key => `${key}=${sortedParams[key]}`)
      .join("&");
    const expectedHash = crypto
      .createHmac("sha512", secretKey)
      .update(Buffer.from(signData, "utf-8"))
      .digest("hex");

    if (secureHash.toLowerCase() !== expectedHash.toLowerCase()) {
      console.error("[VNPay IPN] Signature mismatch");
      return NextResponse.json({ RspCode: "97", Message: "Invalid signature" });
    }

    const realOrderId = parseInt(txnRef.split("_")[0]);
    if (isNaN(realOrderId)) {
      return NextResponse.json({ RspCode: "01", Message: "Order not found" });
    }

    const order = await prisma.don_hang.findUnique({
      where: { id: realOrderId },
    });

    if (!order) {
      return NextResponse.json({ RspCode: "01", Message: "Order not found" });
    }

    const orderAmount = Math.round(Number(order.tong_tien) * 100).toString();
    if (amount && amount !== orderAmount) {
      return NextResponse.json({ RspCode: "04", Message: "Invalid amount" });
    }

    // === IDEMPOTENCY GUARD ===
    const orderStatus = (order as any).trang_thai;

    if (orderStatus === "DA_THANH_TOAN" || orderStatus === "CHO_GIAO_HANG") {
      return NextResponse.json({ RspCode: "02", Message: "Order already confirmed" });
    }

    // Neu don da bi huy hoac that bai roi thi khong xu ly lai (tranh hoan kho 2 lan)
    if (orderStatus === "DA_HUY" || orderStatus === "THANH_TOAN_THAT_BAI") {
      console.log(`[VNPay IPN] Order #${realOrderId} already ${orderStatus}, skipping`);
      return NextResponse.json({ RspCode: "02", Message: "Order already processed" });
    }

    if (responseCode === "00") {
      // THANH CONG - Dung atomic update voi WHERE condition de tranh race condition
      const updated = await prisma.don_hang.updateMany({
        where: { id: realOrderId, trang_thai: "CHO_XAC_NHAN" },
        data: { trang_thai: "CHO_XU_LY" } as any,
      });

      if (updated.count === 0) {
        // Don hang da bi thay doi trang thai boi handler khac
        console.warn(`[VNPay IPN] Order #${realOrderId} could not be marked as paid (status already changed)`);
        return NextResponse.json({ RspCode: "02", Message: "Order status already changed" });
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

      console.log(`[VNPay IPN] Order #${realOrderId} paid successfully, moved to CHO_XU_LY`);
    } else {
      // THAT BAI - Dung atomic update de chi hoan kho 1 lan duy nhat
      const updated = await prisma.don_hang.updateMany({
        where: { id: realOrderId, trang_thai: "CHO_XAC_NHAN" },
        data: { trang_thai: "THANH_TOAN_THAT_BAI" } as any,
      });

      if (updated.count === 0) {
        // Don hang da duoc xu ly boi handler khac (return hoac cancel-unpaid)
        console.log(`[VNPay IPN] Order #${realOrderId} already processed by another handler, skipping stock restore`);
        return NextResponse.json({ RspCode: "00", Message: "Confirm Success" });
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

        await tx.lich_su_don_hang.create({
          data: { ma_don_hang: realOrderId, trang_thai: "THANH_TOAN_THAT_BAI" }
        });
      });

      console.log(`[VNPay IPN] Order #${realOrderId} payment failed. Code: ${responseCode}. Stock restored.`);
    }

    return NextResponse.json({ RspCode: "00", Message: "Confirm Success" });

  } catch (error: any) {
    console.error("[VNPay IPN] Error:", error);
    return NextResponse.json({ RspCode: "99", Message: "Unknown error" });
  }
}
