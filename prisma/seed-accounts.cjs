const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('123456', 10);

  // ADMIN account
  const admin = await prisma.nguoi_dung.upsert({
    where: { email: 'admin@nongsan.vn' },
    create: { email: 'admin@nongsan.vn', mat_khau: password, trang_thai: 1 },
    update: { mat_khau: password }
  });
  await prisma.ho_so_nguoi_dung.upsert({
    where: { ma_nguoi_dung: admin.id },
    create: { ma_nguoi_dung: admin.id, ho_ten: 'Admin He Thong', chuc_vu: 'Quan Tri Vien', bo_phan: 'Ban Giam Doc' },
    update: {}
  });
  await prisma.vai_tro_nguoi_dung.upsert({
    where: { ma_nguoi_dung_ma_vai_tro: { ma_nguoi_dung: admin.id, ma_vai_tro: 1 } },
    create: { ma_nguoi_dung: admin.id, ma_vai_tro: 1 },
    update: {}
  });
  console.log('OK ADMIN id=' + admin.id + ' email=admin@nongsan.vn pass=123456');

  // STAFF account
  const staff = await prisma.nguoi_dung.upsert({
    where: { email: 'staff@nongsan.vn' },
    create: { email: 'staff@nongsan.vn', mat_khau: password, trang_thai: 1 },
    update: { mat_khau: password }
  });
  await prisma.ho_so_nguoi_dung.upsert({
    where: { ma_nguoi_dung: staff.id },
    create: { ma_nguoi_dung: staff.id, ho_ten: 'Staff Van Hanh', chuc_vu: 'Nhan Vien Kho', bo_phan: 'Kho Van' },
    update: {}
  });
  await prisma.vai_tro_nguoi_dung.upsert({
    where: { ma_nguoi_dung_ma_vai_tro: { ma_nguoi_dung: staff.id, ma_vai_tro: 2 } },
    create: { ma_nguoi_dung: staff.id, ma_vai_tro: 2 },
    update: {}
  });
  console.log('OK STAFF  id=' + staff.id + ' email=staff@nongsan.vn  pass=123456');
}

main().catch(console.error).finally(() => prisma.$disconnect());
