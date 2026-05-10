/**
 * Seed dữ liệu tỉnh/huyện/xã Việt Nam từ API miễn phí
 * Source: https://provinces.open-api.vn/api/
 * Chạy: npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed-address.ts
 */

import prisma from "../src/lib/prisma";

const API_BASE = "https://provinces.open-api.vn/api";

async function fetchJSON(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed: ${url} → ${res.status}`);
  return res.json();
}

async function main() {
  console.log("⏳ Đang tải dữ liệu tỉnh thành...");

  const [provinces, districts, wards] = await Promise.all([
    fetchJSON(`${API_BASE}/p/`),
    fetchJSON(`${API_BASE}/d/`),
    fetchJSON(`${API_BASE}/w/`),
  ]);

  console.log(`📦 Tải xong: ${provinces.length} tỉnh, ${districts.length} huyện, ${wards.length} xã`);

  // 1. Insert tỉnh thành
  console.log("⏳ Insert tỉnh thành...");
  await prisma.tinh_thanh.createMany({
    data: provinces.map((p: any) => ({
      id: p.code,
      ten: p.name,
      loai: p.division_type,
      ma_dien_thoai: p.phone_code || null,
    })),
    skipDuplicates: true,
  });
  console.log(`✅ ${provinces.length} tỉnh/thành phố`);

  // 2. Insert quận huyện
  console.log("⏳ Insert quận huyện...");
  await prisma.quan_huyen.createMany({
    data: districts.map((d: any) => ({
      id: d.code,
      ten: d.name,
      loai: d.division_type,
      ma_tinh: d.province_code,
    })),
    skipDuplicates: true,
  });
  console.log(`✅ ${districts.length} quận/huyện`);

  // 3. Insert phường xã (chia chunk vì số lượng lớn ~11.000)
  console.log("⏳ Insert phường xã...");
  const CHUNK = 1000;
  for (let i = 0; i < wards.length; i += CHUNK) {
    const chunk = wards.slice(i, i + CHUNK);
    await prisma.phuong_xa.createMany({
      data: chunk.map((w: any) => ({
        id: w.code,
        ten: w.name,
        loai: w.division_type,
        ma_quan_huyen: w.district_code,
      })),
      skipDuplicates: true,
    });
    console.log(`   ... ${Math.min(i + CHUNK, wards.length)}/${wards.length}`);
  }
  console.log(`✅ ${wards.length} phường/xã`);

  console.log("\n🎉 Seed dữ liệu địa chỉ hoàn tất!");
}

main()
  .catch((e) => {
    console.error("❌ Lỗi:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
