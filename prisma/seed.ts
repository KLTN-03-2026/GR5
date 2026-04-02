import { PrismaClient } from '../src/app/generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const adapter = new PrismaMariaDb({
  host: 'localhost',
  port: 3307,
  user: 'root',
  password: 'rootpassword',
  database: 'agri_db',
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Bắt đầu dọn dẹp dữ liệu cũ...');
  // Xóa theo thứ tự từ con lên cha để không lỗi khóa ngoại
  await prisma.chi_tiet_luan_chuyen_kho.deleteMany();
  await prisma.kien_hang_da_xuat.deleteMany();
  await prisma.kien_hang_chi_tiet.deleteMany();
  await prisma.ton_kho_tong.deleteMany();
  await prisma.canh_bao_lo_hang.deleteMany();
  await prisma.lo_hang.deleteMany();
  await prisma.vi_tri_kho.deleteMany();
  await prisma.kho_hang.deleteMany();
  await prisma.bien_the_san_pham.deleteMany();
  await prisma.san_pham.deleteMany();
  await prisma.nha_cung_cap.deleteMany();

  console.log('Tạo dữ liệu Nhà cung cấp...');
  const ncc1 = await prisma.nha_cung_cap.create({ data: { ten_ncc: 'Nông trại Đà Lạt', so_dien_thoai: '0901234567' } });
  const ncc2 = await prisma.nha_cung_cap.create({ data: { ten_ncc: 'HTX Rau Sạch', so_dien_thoai: '0987654321' } });

  console.log('Tạo dữ liệu Sản phẩm & Biến thể...');
  const sp1 = await prisma.san_pham.create({ data: { ten_san_pham: 'Rau muống', trang_thai: 'DANG_BAN' } });
  const bt1 = await prisma.bien_the_san_pham.create({ data: { ma_san_pham: sp1.id, ma_sku: 'RM-1KG', ten_bien_the: 'Rau muống 1kg', don_vi_tinh: 'Thùng', gia_ban: 50000 } });

  const sp2 = await prisma.san_pham.create({ data: { ten_san_pham: 'Cải thảo', trang_thai: 'DANG_BAN' } });
  const bt2 = await prisma.bien_the_san_pham.create({ data: { ma_san_pham: sp2.id, ma_sku: 'CT-2KG', ten_bien_the: 'Cải thảo 2kg', don_vi_tinh: 'Thùng', gia_ban: 80000 } });

  const sp3 = await prisma.san_pham.create({ data: { ten_san_pham: 'Cà rốt Đà Lạt', trang_thai: 'DANG_BAN' } });
  const bt3 = await prisma.bien_the_san_pham.create({ data: { ma_san_pham: sp3.id, ma_sku: 'CR-1KG', ten_bien_the: 'Cà rốt 1kg', don_vi_tinh: 'Thùng', gia_ban: 45000 } });

  console.log('Tạo dữ liệu Kho & Vị trí...');
  const kho = await prisma.kho_hang.create({ data: { ten_kho: 'Kho Tổng TP.HCM', dia_chi: 'Quận 12' } });
  
  const viTriA11 = await prisma.vi_tri_kho.create({ data: { ma_kho: kho.id, khu_vuc: 'Khu A', day: 'Dãy 1', ke: 'Kệ 1' } });
  const viTriA12 = await prisma.vi_tri_kho.create({ data: { ma_kho: kho.id, khu_vuc: 'Khu A', day: 'Dãy 1', ke: 'Kệ 2' } });
  const viTriB21 = await prisma.vi_tri_kho.create({ data: { ma_kho: kho.id, khu_vuc: 'Khu B', day: 'Dãy 2', ke: 'Kệ 1' } });

  console.log('Tạo dữ liệu Lô hàng...');
  // Lô 1: Đã hết hạn (HSD: 01/04/2026)
  const lo1 = await prisma.lo_hang.create({ data: { ma_bien_the: bt1.id, ma_ncc: ncc1.id, ma_lo_hang: 'LO-001', ngay_thu_hoach: new Date('2026-03-25'), ngay_nhap_kho: new Date('2026-03-26'), han_su_dung: new Date('2026-04-01') } });
  // Lô 2: Còn 2 ngày (HSD: 04/04/2026)
  const lo2 = await prisma.lo_hang.create({ data: { ma_bien_the: bt2.id, ma_ncc: ncc2.id, ma_lo_hang: 'LO-002', ngay_thu_hoach: new Date('2026-03-28'), ngay_nhap_kho: new Date('2026-03-29'), han_su_dung: new Date('2026-04-04') } });
  // Lô 3: Bình thường (HSD: 10/04/2026)
  const lo3 = await prisma.lo_hang.create({ data: { ma_bien_the: bt3.id, ma_ncc: ncc1.id, ma_lo_hang: 'LO-003', ngay_thu_hoach: new Date('2026-04-01'), ngay_nhap_kho: new Date('2026-04-02'), han_su_dung: new Date('2026-04-10') } });

  console.log('Tạo dữ liệu Tồn kho tổng...');
  await prisma.ton_kho_tong.createMany({
    data: [
      { ma_lo_hang: lo1.id, ma_vi_tri: viTriA11.id, so_luong: 3 }, // 3 thùng Rau muống ở Kệ 1
      { ma_lo_hang: lo2.id, ma_vi_tri: viTriA12.id, so_luong: 2 }, // 2 thùng Cải thảo ở Kệ 2
      { ma_lo_hang: lo3.id, ma_vi_tri: viTriB21.id, so_luong: 5 }, // 5 thùng Cà rốt ở Khu B
    ]
  });

  console.log('Tạo dữ liệu Cảnh báo hết hạn...');
  await prisma.canh_bao_lo_hang.createMany({
    data: [
      { ma_lo_hang: lo1.id, loai_canh_bao: 'DA_HET_HAN', so_ngay_con: 0, da_xu_ly: false },
      { ma_lo_hang: lo2.id, loai_canh_bao: 'CON_2_NGAY', so_ngay_con: 2, da_xu_ly: false },
    ]
  });

  console.log('Tạo dữ liệu Kiện hàng chi tiết (Thùng hàng thật có QR)...');
  // 10 Thùng hàng
  const qrCodes = [
    { ma_lo_hang: lo1.id, ma_vi_tri: viTriA11.id, ma_vach_quet: 'QR-RM-001' },
    { ma_lo_hang: lo1.id, ma_vi_tri: viTriA11.id, ma_vach_quet: 'QR-RM-002' },
    { ma_lo_hang: lo1.id, ma_vi_tri: viTriA11.id, ma_vach_quet: 'QR-RM-003' },
    { ma_lo_hang: lo2.id, ma_vi_tri: viTriA12.id, ma_vach_quet: 'QR-CT-004' },
    { ma_lo_hang: lo2.id, ma_vi_tri: viTriA12.id, ma_vach_quet: 'QR-CT-005' },
    { ma_lo_hang: lo3.id, ma_vi_tri: viTriB21.id, ma_vach_quet: 'QR-CR-006' },
    { ma_lo_hang: lo3.id, ma_vi_tri: viTriB21.id, ma_vach_quet: 'QR-CR-007' },
    { ma_lo_hang: lo3.id, ma_vi_tri: viTriB21.id, ma_vach_quet: 'QR-CR-008' },
    { ma_lo_hang: lo3.id, ma_vi_tri: viTriB21.id, ma_vach_quet: 'QR-CR-009' },
    { ma_lo_hang: lo3.id, ma_vi_tri: viTriB21.id, ma_vach_quet: 'QR-CR-010' },
  ];

  await prisma.kien_hang_chi_tiet.createMany({ data: qrCodes });

  console.log('✅ Bơm dữ liệu thành công!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });