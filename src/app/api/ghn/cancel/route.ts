import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    const shipment = await prisma.don_van_chuyen.findFirst({
      where: { ma_don_hang: Number(orderId) },
    });

    if (!shipment?.ma_van_don) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy mã vận đơn" },
        { status: 404 }
      );
    }

    const ghnRes = await fetch(
      `${process.env.GHN_BASE_URL}/v2/switch-status/cancel`,
      {
        method: "POST",
        headers: {
          Token: process.env.GHN_TOKEN!,
          ShopId: process.env.GHN_SHOP_ID!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_codes: [shipment.ma_van_don],
        }),
      }
    );

    const ghnData = await ghnRes.json();

    await prisma.don_van_chuyen.update({
      where: { id: shipment.id },
      data: { trang_thai: "cancel" },
    });

    return NextResponse.json({ success: true, data: ghnData });
  } catch (error: any) {
    console.error("Lỗi hủy vận đơn GHN:", error.message);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
