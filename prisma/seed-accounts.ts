/**
 * Script tạo 2 tài khoản mock: admin & staff
 * Chạy: npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed-accounts.ts
 */

import prisma from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const password = await bcrypt.hash("123456", 10);

  // ── 1. Tài khoản ADMIN ────────────────────────────────────────────────────
  const admin = await prisma.nguoi_dung.upsert({
    where: { email: "admin@nongsan.vn" },
    create: {
      email: "admin@nongsan.vn",
      mat_khau: password,
      trang_thai: 1,
    },
    update: { mat_khau: password },
  });

  await prisma.ho_so_nguoi_dung.upsert({
    where: { ma_nguoi_dung: admin.id },
    create: {
      ma_nguoi_dung: admin.id,
      ho_ten: "Admin Hệ Thống",
      chuc_vu: "Quản Trị Viên",
      bo_phan: "Ban Giám Đốc",
    },
    update: {},
  });

  // Gán role ADMIN (id=1)
  await prisma.vai_tro_nguoi_dung.upsert({
    where: { ma_nguoi_dung_ma_vai_tro: { ma_nguoi_dung: admin.id, ma_vai_tro: 1 } },
    create: { ma_nguoi_dung: admin.id, ma_vai_tro: 1 },
    update: {},
  });

  console.log(`✅ ADMIN: admin@nongsan.vn / 123456 (id=${admin.id})`);

  // ── 2. Tài khoản STAFF ────────────────────────────────────────────────────
  const staff = await prisma.nguoi_dung.upsert({
    where: { email: "staff@nongsan.vn" },
    create: {
      email: "staff@nongsan.vn",
      mat_khau: password,
      trang_thai: 1,
    },
    update: { mat_khau: password },
  });

  await prisma.ho_so_nguoi_dung.upsert({
    where: { ma_nguoi_dung: staff.id },
    create: {
      ma_nguoi_dung: staff.id,
      ho_ten: "Staff Vận Hành",
      chuc_vu: "Nhân Viên Kho",
      bo_phan: "Kho Vận",
    },
    update: {},
  });

  // Gán role STAFF (id=2)
  await prisma.vai_tro_nguoi_dung.upsert({
    where: { ma_nguoi_dung_ma_vai_tro: { ma_nguoi_dung: staff.id, ma_vai_tro: 2 } },
    create: { ma_nguoi_dung: staff.id, ma_vai_tro: 2 },
    update: {},
  });

  console.log(`✅ STAFF: staff@nongsan.vn / 123456 (id=${staff.id})`);
  // ── 3. Tài khoản THU_KHO ────────────────────────────────────────────────────
  const thukho = await prisma.nguoi_dung.upsert({
    where: { email: "thukho@nongsan.vn" },
    create: {
      email: "thukho@nongsan.vn",
      mat_khau: password,
      trang_thai: 1,
    },
    update: { mat_khau: password },
  });

  await prisma.ho_so_nguoi_dung.upsert({
    where: { ma_nguoi_dung: thukho.id },
    create: {
      ma_nguoi_dung: thukho.id,
      ho_ten: "Thủ Kho Kiêm Kế Toán",
      chuc_vu: "Thủ Kho",
      bo_phan: "Kho Vận & Kế Toán",
    },
    update: {},
  });

  // Đảm bảo ROLE ID=3 là THU_KHO, nếu chưa có thì seed có thể chèn cứng hoặc tự nối
  const thuKhoRole = await prisma.vai_tro.upsert({
    where: { ten_vai_tro: "THU_KHO" },
    create: { ten_vai_tro: "THU_KHO", mo_ta: "Thủ kho kiêm kế toán" },
    update: {},
  });

  await prisma.vai_tro_nguoi_dung.upsert({
    where: { ma_nguoi_dung_ma_vai_tro: { ma_nguoi_dung: thukho.id, ma_vai_tro: thuKhoRole.id } },
    create: { ma_nguoi_dung: thukho.id, ma_vai_tro: thuKhoRole.id },
    update: {},
  });

  console.log(`✅ THU KHO: thukho@nongsan.vn / 123456 (id=${thukho.id})`);
  console.log("\n🎉 Tạo tài khoản thành công!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
