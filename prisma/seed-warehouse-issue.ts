/**
 * SEED DỮ LIỆU CHO LUỒNG XUẤT KHO (warehouse/issue)
 * Tạo đơn hàng CHO_GIAO_HANG + phiếu xuất DANG_SOAN + kiện hàng TRONG_KHO
 *
 * Chạy SAU khi đã seed-full.ts và seed-inventory.ts
 *
 * Lệnh:
 *   npx ts-node --compiler-options "{\"module\":\"CommonJS\"}" prisma/seed-warehouse-issue.ts
 */

import * as dotenv from 'dotenv';
dotenv.config();

import prisma from '../src/lib/prisma';

async function main() {
  console.log('📦 Bắt đầu seed dữ liệu cho luồng xuất kho...\n');

  // Lấy kho
  const kho = await prisma.kho_hang.findFirst();
  if (!kho) throw new Error('Chưa có kho! Hãy chạy seed-full.ts trước.');

  // Lấy user (để gán người tạo)
  const user = await prisma.nguoi_dung.findFirst({
    where: { vai_tro_nguoi_dung: { some: { vai_tro: { ten_vai_tro: 'Quản trị viên' } } } },
  });
  const userId = user?.id ?? null;

  // Lấy các biến thể có tồn kho
  const bienThes = await prisma.bien_the_san_pham.findMany({
    where: {
      lo_hang: { some: { ton_kho_tong: { some: { so_luong: { gt: 0 } } } } },
    },
    include: { san_pham: true, lo_hang: { include: { ton_kho_tong: true } } },
    take: 10,
  });

  if (bienThes.length < 3) {
    throw new Error('Không đủ biến thể có tồn kho! Hãy chạy seed-inventory.ts trước.');
  }

  console.log(`  ✓ Tìm thấy ${bienThes.length} biến thể có tồn kho`);

  // Tạo các đơn hàng mẫu với trạng thái CHO_GIAO_HANG
  const donHangConfigs = [
    {
      ho_ten: 'Nguyễn Văn Minh',
      sdt: '0901234567',
      dia_chi: '123 Nguyễn Văn Linh, Hải Châu, Đà Nẵng',
      ma_tinh_ghn: 203, ma_quan_huyen_ghn: 1526, ma_phuong_xa_ghn: '40113',
      items: [{ btIdx: 0, soLuong: 3 }, { btIdx: 1, soLuong: 2 }],
    },
    {
      ho_ten: 'Trần Thị Hoa',
      sdt: '0912345678',
      dia_chi: '456 Lê Duẩn, Tp Huế, Thừa Thiên Huế',
      ma_tinh_ghn: 223, ma_quan_huyen_ghn: 1585, ma_phuong_xa_ghn: '90814',
      items: [{ btIdx: 2, soLuong: 5 }, { btIdx: 3, soLuong: 2 }],
    },
    {
      ho_ten: 'Lê Hoàng Nam',
      sdt: '0923456789',
      dia_chi: '789 Trần Hưng Đạo, Q1, TP.HCM',
      ma_tinh_ghn: 202, ma_quan_huyen_ghn: 1442, ma_phuong_xa_ghn: '20110',
      items: [{ btIdx: 4, soLuong: 4 }, { btIdx: 5, soLuong: 3 }],
    },
    {
      ho_ten: 'Phạm Quốc Anh',
      sdt: '0934567890',
      dia_chi: '12 Bạch Đằng, Thanh Khê, Đà Nẵng',
      ma_tinh_ghn: 203, ma_quan_huyen_ghn: 1527, ma_phuong_xa_ghn: '40210',
      items: [{ btIdx: 6, soLuong: 2 }, { btIdx: 7, soLuong: 1 }],
    },
    {
      ho_ten: 'Võ Thị Lan',
      sdt: '0945678901',
      dia_chi: '88 Phan Chu Trinh, Tam Kỳ, Quảng Nam',
      ma_tinh_ghn: 243, ma_quan_huyen_ghn: 1631, ma_phuong_xa_ghn: '340113',
      items: [{ btIdx: 8, soLuong: 3 }, { btIdx: 9, soLuong: 2 }],
    },
  ];

  let created = 0;

  for (const cfg of donHangConfigs) {
    // Kiểm tra đủ biến thể
    const validItems = cfg.items.filter((it) => it.btIdx < bienThes.length);
    if (validItems.length === 0) continue;

    // Tính tổng tiền
    const tongTien = validItems.reduce((sum, it) => {
      const bt = bienThes[it.btIdx];
      return sum + Number(bt.gia_ban) * it.soLuong;
    }, 0);

    // Tạo đơn hàng
    const donHang = await prisma.don_hang.create({
      data: {
        ma_nguoi_dung: userId,
        tong_tien: tongTien,
        phi_van_chuyen: 30000,
        trang_thai: 'CHO_GIAO_HANG',
        ho_ten_nguoi_nhan: cfg.ho_ten,
        sdt_nguoi_nhan: cfg.sdt,
        dia_chi_giao_hang: cfg.dia_chi,
        ma_tinh_ghn: cfg.ma_tinh_ghn,
        ma_quan_huyen_ghn: cfg.ma_quan_huyen_ghn,
        ma_phuong_xa_ghn: cfg.ma_phuong_xa_ghn,
        chi_tiet_don_hang: {
          create: validItems.map((it) => ({
            ma_bien_the: bienThes[it.btIdx].id,
            so_luong: it.soLuong,
            don_gia: bienThes[it.btIdx].gia_ban,
          })),
        },
      },
    });

    // Tạo phiếu xuất kho DANG_SOAN
    const phieuXuat = await prisma.phieu_xuat_kho.create({
      data: {
        ma_nguoi_tao: userId,
        ma_kho: kho.id,
        ma_don_hang: donHang.id,
        ly_do_xuat: 'XUAT_THEO_DON_HANG',
        trang_thai: 'DANG_SOAN',
        chi_tiet_phieu_xuat: {
          create: validItems.map((it) => ({
            ma_bien_the: bienThes[it.btIdx].id,
            so_luong_yeu_cau: it.soLuong,
            so_luong_thuc_xuat: 0,
          })),
        },
      },
    });

    // Đảm bảo có đủ kiện hàng TRONG_KHO cho mỗi biến thể
    for (const it of validItems) {
      const bt = bienThes[it.btIdx];
      const loHang = bt.lo_hang.find((l) => l.ton_kho_tong.some((tk) => (tk.so_luong ?? 0) > 0));
      if (!loHang) continue;

      const viTriId = loHang.ton_kho_tong[0]?.ma_vi_tri;

      // Đếm kiện hàng hiện có
      const existingCount = await prisma.kien_hang_chi_tiet.count({
        where: { ma_lo_hang: loHang.id, trang_thai: 'TRONG_KHO' },
      });

      // Tạo thêm kiện hàng nếu thiếu
      const canThem = Math.max(0, it.soLuong - existingCount);
      if (canThem > 0) {
        const kienHangData = Array.from({ length: canThem }, (_, idx) => ({
          ma_lo_hang: loHang.id,
          ma_vi_tri: viTriId,
          ma_vach_quet: `QR-ISSUE-${donHang.id}-${bt.id}-${idx + 1}-${Date.now()}`,
          trang_thai: 'TRONG_KHO',
        }));
        await prisma.kien_hang_chi_tiet.createMany({ data: kienHangData });
      }
    }

    console.log(
      `  ✅ Đơn #${donHang.id} | ${cfg.ho_ten} | ${cfg.dia_chi.slice(0, 40)} | Phiếu xuất #${phieuXuat.id}`
    );
    created++;
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`✅ HOÀN THÀNH SEED XUẤT KHO`);
  console.log(`${'═'.repeat(60)}`);
  console.log(`  • Tạo ${created} đơn hàng CHO_GIAO_HANG + phiếu xuất DANG_SOAN`);
  console.log(`  • Các đơn bao gồm: GẦN (Đà Nẵng), TRUNG (Huế, Quảng Nam), XA (HCM)`);
  console.log(`\n  🚀 Truy cập http://localhost:3001/staff/warehouse/issue để test!`);
}

main()
  .catch((e) => {
    console.error('❌ Lỗi:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
