import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const GHN_BASE = process.env.GHN_BASE_URL || "https://dev-online-gateway.ghn.vn/shiip/public-api";
const GHN_TOKEN = process.env.GHN_TOKEN || "";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { order_code, orderId } = await req.json();

    // Nếu truyền orderId thay vì order_code, tự tìm mã vận đơn
    let trackingCode = order_code;
    if (!trackingCode && orderId) {
      const shipment = await prisma.don_van_chuyen.findFirst({
        where: { ma_don_hang: Number(orderId) },
        select: { ma_van_don: true },
      });
      trackingCode = shipment?.ma_van_don;
    }

    if (!trackingCode) {
      return NextResponse.json({ error: "Không tìm thấy mã vận đơn" }, { status: 404 });
    }

    const res = await fetch(`${GHN_BASE}/v2/shipping-order/detail`, {
      method: "POST",
      headers: { Token: GHN_TOKEN, "Content-Type": "application/json" },
      body: JSON.stringify({ order_code: trackingCode }),
    });

    const data = await res.json();

    if (data.code !== 200) {
      return NextResponse.json({ error: data.message || "GHN lỗi" }, { status: 400 });
    }

    return NextResponse.json({
      order_code: trackingCode,
      status: data.data?.status,
      status_name: data.data?.status_name,
      from_name: data.data?.from_name,
      to_name: data.data?.to_name,
      to_address: data.data?.to_address,
      expected_delivery_time: data.data?.expected_delivery_time,
      log: (data.data?.log || []).map((l: any) => ({
        status: l.status,
        updated_date: l.updated_date,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
