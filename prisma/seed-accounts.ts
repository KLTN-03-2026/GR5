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

  // Upsert role ADMIN theo tên (không dùng id hardcode)
  const adminRole = await prisma.vai_tro.upsert({
    where: { ten_vai_tro: "ADMIN" },
    create: { ten_vai_tro: "ADMIN", mo_ta: "Quản trị viên" },
    update: {},
  });
  await prisma.vai_tro_nguoi_dung.upsert({
    where: { ma_nguoi_dung_ma_vai_tro: { ma_nguoi_dung: admin.id, ma_vai_tro: adminRole.id } },
    create: { ma_nguoi_dung: admin.id, ma_vai_tro: adminRole.id },
    update: {},
  });

  console.log(`✅ ADMIN: admin@nongsan.vn / 123456 (id=${admin.id}, role_id=${adminRole.id})`);

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

  // Upsert role STAFF theo tên
  const staffRole = await prisma.vai_tro.upsert({
    where: { ten_vai_tro: "STAFF" },
    create: { ten_vai_tro: "STAFF", mo_ta: "Nhân viên vận hành" },
    update: {},
  });
  await prisma.vai_tro_nguoi_dung.upsert({
    where: { ma_nguoi_dung_ma_vai_tro: { ma_nguoi_dung: staff.id, ma_vai_tro: staffRole.id } },
    create: { ma_nguoi_dung: staff.id, ma_vai_tro: staffRole.id },
    update: {},
  });

  console.log(`✅ STAFF: staff@nongsan.vn / 123456 (id=${staff.id}, role_id=${staffRole.id})`);
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

  // ── 4. Tài khoản quochungisme ────────────────────────────────────────────────
  const hung = await prisma.nguoi_dung.upsert({
    where: { email: "quochungisme@gmail.com" },
    create: { email: "quochungisme@gmail.com", mat_khau: password, trang_thai: 1 },
    update: { mat_khau: password },
  });

  await prisma.ho_so_nguoi_dung.upsert({
    where: { ma_nguoi_dung: hung.id },
    create: { ma_nguoi_dung: hung.id, ho_ten: "Quoc Hung" },
    update: {},
  });

  console.log(`✅ USER: quochungisme@gmail.com / 123456 (id=${hung.id})`);
  console.log("\n🎉 Tạo tài khoản thành công!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
