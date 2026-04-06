import { PrismaClient } from '../src/app/generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

// Cấu hình Adapter theo đúng yêu cầu của bạn
const adapter = new PrismaMariaDb({
  host: 'localhost',
  port: 3307,
  user: 'root',
  password: 'rootpassword',
  database: 'agri_db',
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Đang bắt đầu bơm (seed) dữ liệu cho Module Kho...');

  // ==========================================
  // 1. TẠO DATA CƠ BẢN (Nhà cung cấp, Danh mục, Sản phẩm)
  // ==========================================
  const ncc = await prisma.nha_cung_cap.create({
    data: { ten_ncc: 'Nông Trại Đà Lạt', so_dien_thoai: '0901234567', email: 'contact@dalatfarm.vn' }
  });

  const danhMuc = await prisma.danh_muc.create({
    data: { ten_danh_muc: 'Rau củ quả sạch' }
  });

  const sanPham = await prisma.san_pham.create({
    data: { ten_san_pham: 'Rau Muống Thủy Canh', ma_danh_muc: danhMuc.id, trang_thai: 'DANG_BAN' }
  });

  const bienThe = await prisma.bien_the_san_pham.create({
    data: { 
      ma_san_pham: sanPham.id, 
      ma_sku: `RM-500G-${Date.now()}`, 
      ten_bien_the: 'Rau Muống Thủy Canh (Gói 500g)', 
      don_vi_tinh: 'Gói', 
      gia_ban: 15000 
    }
  });

  // ==========================================
  // 2. TẠO KHO HÀNG & VỊ TRÍ
  // ==========================================
  const kho = await prisma.kho_hang.create({
    data: { ten_kho: 'Tổng Kho Đà Nẵng', dia_chi: 'Hòa Khánh, Liên Chiểu, Đà Nẵng' }
  });

  const viTriA = await prisma.vi_tri_kho.create({ data: { ma_kho: kho.id, khu_vuc: 'Khu A', day: 'D1', ke: 'K1', tang: 'T1' }});
  const viTriB = await prisma.vi_tri_kho.create({ data: { ma_kho: kho.id, khu_vuc: 'Khu B', day: 'D2', ke: 'K1', tang: 'T1' }});

  // ==========================================
  // 3. TẠO LÔ HÀNG 1 (Bình thường - Tồn kho nhiều)
  // ==========================================
  const loHang1 = await prisma.lo_hang.create({
    data: {
      ma_lo_hang: `LO-RM-SAFE-${Date.now()}`,
      ma_ncc: ncc.id,
      ma_bien_the: bienThe.id,
      ngay_nhap_kho: new Date(),
      han_su_dung: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // HSD: 30 ngày tới
    }
  });

  await prisma.ton_kho_tong.create({
    data: { ma_lo_hang: loHang1.id, ma_vi_tri: viTriA.id, so_luong: 80 }
  });

  // Đẻ 5 mã QR mẫu cho lô này
  for(let i=1; i<=5; i++) {
    await prisma.kien_hang_chi_tiet.create({
      data: { ma_lo_hang: loHang1.id, ma_vi_tri: viTriA.id, ma_vach_quet: `QR-${loHang1.ma_lo_hang}-00${i}`, trang_thai: 'TRONG_KHO' }
    });
  }

  // ==========================================
  // 4. TẠO LÔ HÀNG 2 (Sắp hết hạn - Để test chuông cảnh báo)
  // ==========================================
  const loHang2 = await prisma.lo_hang.create({
    data: {
      ma_lo_hang: `LO-RM-WARNING-${Date.now()}`,
      ma_ncc: ncc.id,
      ma_bien_the: bienThe.id,
      ngay_nhap_kho: new Date(),
      han_su_dung: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // HSD: Chỉ còn 2 ngày
    }
  });

  await prisma.ton_kho_tong.create({
    data: { ma_lo_hang: loHang2.id, ma_vi_tri: viTriB.id, so_luong: 25 }
  });

  for(let i=1; i<=3; i++) {
    await prisma.kien_hang_chi_tiet.create({
      data: { ma_lo_hang: loHang2.id, ma_vi_tri: viTriB.id, ma_vach_quet: `QR-${loHang2.ma_lo_hang}-00${i}`, trang_thai: 'TRONG_KHO' }
    });
  }

  // Đẻ 1 record vào bảng cảnh báo
  await prisma.canh_bao_lo_hang.create({
    data: { ma_lo_hang: loHang2.id, loai_canh_bao: 'CON_2_NGAY', da_xu_ly: false, so_ngay_con: 2 }
  });

  // ==========================================
  // 5. TẠO LỊCH SỬ XUẤT KHO MẪU
  // ==========================================
  const phieuXuat = await prisma.phieu_xuat_kho.create({
    data: { ma_kho: kho.id, ly_do_xuat: 'Xuất giao hàng Winmart', trang_thai: 'HOAN_THANH' }
  });

  await prisma.kien_hang_da_xuat.createMany({
    data: [
      { ma_phieu_xuat: phieuXuat.id, ma_vach_quet: `QR-OLD-001`, ma_bien_the: bienThe.id, ngay_xuat: new Date() },
      { ma_phieu_xuat: phieuXuat.id, ma_vach_quet: `QR-OLD-002`, ma_bien_the: bienThe.id, ngay_xuat: new Date(Date.now() - 3600000) } // Xuất cách đây 1 tiếng
    ]
  });

  console.log('✅ Seed dữ liệu Kho thành công! Mọi thứ đã sẵn sàng!');
}

main()
  .catch((e) => {
    console.error('❌ Có lỗi xảy ra trong lúc seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });