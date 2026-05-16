import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { ensureOrderIssueTicket } from "@/lib/warehouse-issue";

// VNPay redirect user's browser here after payment
export async function GET(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001";

  try {
    const { searchParams } = new URL(req.url);

    // Lay toan bo params tu VNPay
    const vnpParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      vnpParams[key] = value;
    });

    const secureHash = vnpParams["vnp_SecureHash"];
    const responseCode = vnpParams["vnp_ResponseCode"];
    const txnRef = vnpParams["vnp_TxnRef"];

    if (!secureHash || !txnRef) {
      console.error("[VNPay Return] Missing secureHash or txnRef");
      return NextResponse.redirect(new URL("/payment/check?status=failed&reason=missing_params", baseUrl));
    }

    // === BUOC 1: VERIFY CHU KY VNPAY ===
    const secretKey = process.env.VNPAY_SECRET_KEY;
    if (!secretKey) {
      console.error("[VNPay Return] VNPAY_SECRET_KEY is not configured");
      return NextResponse.redirect(new URL("/payment/check?status=failed&reason=server_config_error", baseUrl));
    }

    // Xoa hash params truoc khi verify (VNPay khong dua chung vao hash)
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

    // So sanh hash - case insensitive vi hex co the la upper hoac lower
    if (secureHash.toLowerCase() !== expectedHash.toLowerCase()) {
      console.error("[VNPay Return] Signature mismatch!");
      console.error("[VNPay Return] Received:", secureHash);
      console.error("[VNPay Return] Expected:", expectedHash);
      console.error("[VNPay Return] SignData:", signData);
      return NextResponse.redirect(new URL("/payment/check?status=failed&reason=invalid_signature", baseUrl));
    }

    // === BUOC 2: LAY ORDER ID THUC ===
    const realOrderId = parseInt(txnRef.split("_")[0]);
    if (isNaN(realOrderId)) {
      console.error("[VNPay Return] Invalid order ID from txnRef:", txnRef);
      return NextResponse.redirect(new URL("/payment/check?status=failed&reason=invalid_order", baseUrl));
    }

    // Kiem tra don hang co ton tai khong
    const order = await prisma.don_hang.findUnique({
      where: { id: realOrderId },
    });

    if (!order) {
      console.error(`[VNPay Return] Order #${realOrderId} not found`);
      return NextResponse.redirect(new URL("/payment/check?status=failed&reason=order_not_found", baseUrl));
    }

    // === BUOC 3: IDEMPOTENCY GUARD ===
    const orderStatus = (order as any).trang_thai;

    // Neu don da thanh toan roi thi khong xu ly lai
    if (orderStatus === "DA_THANH_TOAN" || orderStatus === "CHO_GIAO_HANG") {
      console.log(`[VNPay Return] Order #${realOrderId} already paid, skipping`);
      return NextResponse.redirect(new URL(`/payment/check?orderId=${realOrderId}&status=success&method=vnpay`, baseUrl));
    }

    // Neu don da bi huy hoac that bai roi thi khong xu ly lai (tranh hoan kho 2 lan)
    if (orderStatus === "DA_HUY" || orderStatus === "THANH_TOAN_THAT_BAI") {
      console.log(`[VNPay Return] Order #${realOrderId} already ${orderStatus}, skipping`);
      return NextResponse.redirect(new URL(`/payment/check?orderId=${realOrderId}&status=failed&method=vnpay&code=${responseCode}`, baseUrl));
    }

    // === BUOC 4: CAP NHAT TRANG THAI DON HANG ===
    if (responseCode === "00") {
      // THANH CONG - Dung atomic update voi WHERE condition de tranh race condition
      const updated = await prisma.don_hang.updateMany({
        where: { id: realOrderId, trang_thai: "CHO_XAC_NHAN" },
        data: { trang_thai: "CHO_XU_LY" } as any,
      });

      if (updated.count === 0) {
        // Don hang da bi thay doi trang thai boi handler khac (da huy, etc.)
        console.warn(`[VNPay Return] Order #${realOrderId} could not be marked as paid (status already changed)`);
        return NextResponse.redirect(new URL(`/payment/check?orderId=${realOrderId}&status=failed&method=vnpay&code=order_status_conflict`, baseUrl));
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

      console.log(`[VNPay Return] Order #${realOrderId} paid successfully, moved to CHO_XU_LY`);
      return NextResponse.redirect(new URL(`/payment/check?orderId=${realOrderId}&status=success&method=vnpay`, baseUrl));
    } else {
      // THAT BAI - Dung atomic update de chi hoan kho 1 lan duy nhat
      const updated = await prisma.don_hang.updateMany({
        where: { id: realOrderId, trang_thai: "CHO_XAC_NHAN" },
        data: { trang_thai: "THANH_TOAN_THAT_BAI" } as any,
      });

      if (updated.count === 0) {
        // Don hang da duoc xu ly boi handler khac (IPN hoac cancel-unpaid)
        console.log(`[VNPay Return] Order #${realOrderId} already processed by another handler, skipping stock restore`);
        return NextResponse.redirect(new URL(`/payment/check?orderId=${realOrderId}&status=failed&method=vnpay&code=${responseCode}`, baseUrl));
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

      console.log(`[VNPay Return] Order #${realOrderId} payment failed. Code: ${responseCode}. Stock restored.`);
      return NextResponse.redirect(new URL(`/payment/check?orderId=${realOrderId}&status=failed&method=vnpay&code=${responseCode}`, baseUrl));
    }

  } catch (error: any) {
    console.error("[VNPay Return] Server Error:", error);
    return NextResponse.redirect(new URL("/payment/check?status=failed&reason=server_error", baseUrl));
  }
}
