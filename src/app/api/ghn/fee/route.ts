import { NextResponse } from "next/server";

const GHN_BASE = process.env.GHN_BASE_URL || "https://dev-online-gateway.ghn.vn/shiip/public-api";
const GHN_TOKEN = process.env.GHN_TOKEN || "";
const GHN_SHOP_ID = process.env.GHN_SHOP_ID || "";

// District ID của kho hàng (shop) — cấu hình trong .env nếu cần
const FROM_DISTRICT_ID = Number(process.env.GHN_FROM_DISTRICT_ID || 1542);

export async function POST(req: Request) {
  try {
    const { to_district_id, to_ward_code, weight = 1000, insurance_value = 0 } = await req.json();

    if (!to_district_id || !to_ward_code) {
      return NextResponse.json({ error: "Thiếu to_district_id hoặc to_ward_code" }, { status: 400 });
    }

    const res = await fetch(`${GHN_BASE}/v2/shipping-order/fee`, {
      method: "POST",
      headers: {
        Token: GHN_TOKEN,
        ShopId: GHN_SHOP_ID,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        service_type_id: 2,
        from_district_id: FROM_DISTRICT_ID,
        to_district_id: Number(to_district_id),
        to_ward_code: String(to_ward_code),
        weight: Number(weight),
        insurance_value: Number(insurance_value),
      }),
    });

    const data = await res.json();

    if (data.code !== 200) {
      return NextResponse.json({ error: data.message || "GHN lỗi" }, { status: 400 });
    }

    return NextResponse.json({
      fee: data.data?.total || 0,
      service_fee: data.data?.service_fee || 0,
      insurance_fee: data.data?.insurance_fee || 0,
      expected_delivery_time: data.data?.expected_delivery_time,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
