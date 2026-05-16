import * as dotenv from 'dotenv';
dotenv.config();

import prisma from '../src/lib/prisma';
import { seedCategoriesAndProducts1 } from './seed-categories';
import { seedProducts2 } from './seed-products-2';
import { seedProducts3 } from './seed-products-3';

async function main() {
  console.log("🚀 Đang xóa dữ liệu danh mục và sản phẩm cũ...");

  await prisma.anh_san_pham.deleteMany();
  await prisma.chung_chi_san_pham.deleteMany();
  await prisma.the_san_pham.deleteMany();
  await prisma.san_pham_yeu_thich.deleteMany();
  await prisma.chi_tiet_gio_hang.deleteMany();
  await prisma.chi_tiet_don_hang.deleteMany();
  await prisma.chi_tiet_phieu_nhap.deleteMany();
  await prisma.chi_tiet_phieu_xuat.deleteMany();
  await prisma.canh_bao_lo_hang.deleteMany();
  await prisma.ton_kho_tong.deleteMany();
  await prisma.kien_hang_chi_tiet.deleteMany();
  await prisma.lo_hang.deleteMany();
  await prisma.ncc_san_pham.deleteMany();
  await prisma.bien_the_san_pham.deleteMany();
  await prisma.san_pham.deleteMany();
  await prisma.danh_muc.deleteMany();

  console.log("✅ Đã xóa sạch dữ liệu cũ.");
  console.log("");
  console.log("🌱 Bắt đầu seed 15 danh mục + 300 sản phẩm...");
  console.log("");

  // Step 1: Create 15 categories + 100 products (categories 1-5)
  console.log("📦 [1/3] Tạo 15 danh mục + 100 sản phẩm (danh mục 1-5)...");
  const categories = await seedCategoriesAndProducts1();
  console.log("✅ [1/3] Hoàn thành!");
  console.log("");

  // Step 2: Create 100 products (categories 6-10)
  console.log("📦 [2/3] Tạo 100 sản phẩm (danh mục 6-10)...");
  await seedProducts2({
    giaViTuoi: categories.giaViTuoi.id,
    hatDau: categories.hatDau.id,
    traHoa: categories.traHoa.id,
    matOng: categories.matOng.id,
    dacSanKho: categories.dacSanKho.id,
  });
  console.log("✅ [2/3] Hoàn thành!");
  console.log("");

  // Step 3: Create 100 products (categories 11-15)
  console.log("📦 [3/3] Tạo 100 sản phẩm (danh mục 11-15)...");
  await seedProducts3({
    huuCo: categories.nongSanHuuCo.id,
    rauGiaVi: categories.rauGiaVi.id,
    cuQuaAnQua: categories.cuQuaAnQua.id,
    cheBien: categories.sanPhamCheBien.id,
    suaHat: categories.suaHat.id,
  });
  console.log("✅ [3/3] Hoàn thành!");
  console.log("");

  console.log("═══════════════════════════════════════════");
  console.log("🎉 HOÀN TẤT! Đã tạo thành công:");
  console.log("   • 15 danh mục nông sản");
  console.log("   • 300 sản phẩm (20 SP/danh mục)");
  console.log("   • 300 ảnh sản phẩm");
  console.log("   • 600 biến thể (2/SP)");
  console.log("═══════════════════════════════════════════");
}

main()
  .catch((e) => {
    console.error("❌ Lỗi khi seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
