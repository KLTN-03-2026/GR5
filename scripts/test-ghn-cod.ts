/**
 * Test thử payload GHN cho đơn COD vs đơn online.
 * Chạy: npx tsx scripts/test-ghn-cod.ts
 */
import "dotenv/config";

const GHN_BASE = process.env.GHN_BASE_URL || "https://dev-online-gateway.ghn.vn/shiip/public-api";
const GHN_TOKEN = process.env.GHN_TOKEN!;
const GHN_SHOP_ID = process.env.GHN_SHOP_ID!;
const FROM_DISTRICT = Number(process.env.GHN_FROM_DISTRICT_ID || 1526);
const FROM_WARD = process.env.GHN_FROM_WARD_CODE || "550113";

// Đơn mẫu: 2 SP, mỗi cái 150k, ship 30k → tong_tien = 330k, phi_van_chuyen = 30k
const SAMPLE = {
  tong_tien: 330_000,
  phi_van_chuyen: 30_000,
  to_name: "Nguyễn Văn Test",
  to_phone: "0901234567",
  to_address: "12 Hải Phòng, Phường Thạch Thang, Quận Hải Châu, Đà Nẵng",
  to_ward_code: "40101",          // Phường Thạch Thang, Hải Châu, Đà Nẵng (từ seed)
  to_district_id: 1527,           // Quận Hải Châu
  items: [
    { name: "Rau cải xanh 500g", quantity: 1, price: 150_000 },
    { name: "Cà chua bi 1kg", quantity: 1, price: 150_000 },
  ],
};

function buildPayload(isCOD: boolean) {
  const codAmount = isCOD
    ? Math.max(0, Math.round(SAMPLE.tong_tien - SAMPLE.phi_van_chuyen))
    : 0;
  return {
    from_district_id: FROM_DISTRICT,
    from_ward_code: FROM_WARD,
    to_name: SAMPLE.to_name,
    to_phone: SAMPLE.to_phone,
    to_address: SAMPLE.to_address,
    to_ward_code: SAMPLE.to_ward_code,
    to_district_id: SAMPLE.to_district_id,
    cod_amount: codAmount,
    weight: Math.max(SAMPLE.items.length * 500, 200),
    service_type_id: 2,
    payment_type_id: isCOD ? 2 : 1,
    required_note: "CHOXEMHANGKHONGTHU",
    note: "Test payload",
    items: SAMPLE.items,
  };
}

async function callGhn(label: string, payload: any) {
  console.log(`\n=== ${label} ===`);
  console.log("payment_type_id:", payload.payment_type_id, "(", payload.payment_type_id === 2 ? "khách trả ship" : "shop trả ship", ")");
  console.log("cod_amount:", payload.cod_amount.toLocaleString("vi-VN"), "đ");

  const res = await fetch(`${GHN_BASE}/v2/shipping-order/preview`, {
    method: "POST",
    headers: {
      Token: GHN_TOKEN,
      ShopId: GHN_SHOP_ID,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();

  if (data.code === 200) {
    console.log("✓ GHN OK");
    console.log("  total_fee:", Number(data.data?.total_fee || 0).toLocaleString("vi-VN"), "đ");
    console.log("  expected_delivery_time:", data.data?.expected_delivery_time);
  } else {
    console.log("✗ GHN báo lỗi:");
    console.log(" ", data.code, data.code_message_value || data.message);
    if (data.data) console.log("  data:", JSON.stringify(data.data, null, 2));
  }
  return data;
}

(async () => {
  if (!GHN_TOKEN || !GHN_SHOP_ID) {
    console.error("Thiếu GHN_TOKEN / GHN_SHOP_ID trong .env");
    process.exit(1);
  }
  console.log("FROM district:", FROM_DISTRICT, "ward:", FROM_WARD);
  console.log("TO  district:", SAMPLE.to_district_id, "ward:", SAMPLE.to_ward_code);

  await callGhn("Đơn COD (payment_type_id=2)", buildPayload(true));
  await callGhn("Đơn online đã thanh toán (payment_type_id=1)", buildPayload(false));

  // So sánh: cùng địa chỉ ĐN → ĐN, nhưng đổi FROM ward sang ward thật của Hải Châu
  const realDaNangPayload = {
    ...buildPayload(true),
    from_district_id: 1527,
    from_ward_code: "40101", // Phường Thạch Thang, Hải Châu
  };
  await callGhn("So sánh: FROM = Đà Nẵng thật (1527/40101)", realDaNangPayload);
})();
