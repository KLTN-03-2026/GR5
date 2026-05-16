/**
 * SEED TỒN KHO ĐẦY ĐỦ - Đảm bảo TOÀN BỘ biến thể đều có tồn kho
 * Chạy SAU khi đã seed-full.ts
 *
 * Lệnh:
 *   npx ts-node --compiler-options "{\"module\":\"CommonJS\"}" prisma/seed-inventory.ts
 */

import * as dotenv from 'dotenv';
dotenv.config();

import prisma from '../src/lib/prisma';

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

async function main() {
  console.log('🏬 Bắt đầu seed tồn kho đầy đủ cho tất cả biến thể...\n');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // ── Lấy kho hiện có ──────────────────────────────────────────────
  let kho = await prisma.kho_hang.findFirst({ where: { ten_kho: { contains: 'Đà Nẵng' } } });
  let kho2 = await prisma.kho_hang.findFirst({ where: { ten_kho: { contains: 'HCM' } } });

  if (!kho) {
    kho = await prisma.kho_hang.create({
      data: { ten_kho: 'Tổng Kho Đà Nẵng', dia_chi: 'Hòa Khánh, Liên Chiểu, Đà Nẵng' },
    });
    console.log('  ➕ Tạo Tổng Kho Đà Nẵng');
  }
  if (!kho2) {
    kho2 = await prisma.kho_hang.create({
      data: { ten_kho: 'Kho Lạnh HCM', dia_chi: 'KCN Tân Bình, Quận Tân Phú, HCM' },
    });
    console.log('  ➕ Tạo Kho Lạnh HCM');
  }

  // ── Lấy / tạo vị trí kho ─────────────────────────────────────────
  const getOrCreateVt = async (
    maKho: number,
    khuVuc: string,
    day: string,
    ke: string,
    tang: string,
    sucChua = 200,
    ghiChu?: string
  ) => {
    const existing = await prisma.vi_tri_kho.findFirst({
      where: { ma_kho: maKho, khu_vuc: khuVuc, day, ke, tang },
    });
    if (existing) return existing;
    return prisma.vi_tri_kho.create({
      data: { ma_kho: maKho, khu_vuc: khuVuc, day, ke, tang, suc_chua_toi_da: sucChua, ghi_chu: ghiChu },
    });
  };

  const vtA1  = await getOrCreateVt(kho.id,  'Khu A', 'D1', 'K1', 'T1', 200);
  const vtA2  = await getOrCreateVt(kho.id,  'Khu A', 'D1', 'K2', 'T1', 200);
  const vtA3  = await getOrCreateVt(kho.id,  'Khu A', 'D2', 'K1', 'T1', 200);
  const vtB1  = await getOrCreateVt(kho.id,  'Khu B', 'D1', 'K1', 'T1', 200);
  const vtB2  = await getOrCreateVt(kho.id,  'Khu B', 'D1', 'K2', 'T1', 200);
  const vtB3  = await getOrCreateVt(kho.id,  'Khu B', 'D2', 'K1', 'T1', 200);
  const vtC1  = await getOrCreateVt(kho.id,  'Khu C', 'D1', 'K1', 'T1', 300);
  const vtC2  = await getOrCreateVt(kho.id,  'Khu C', 'D1', 'K2', 'T1', 300);
  const vtC3  = await getOrCreateVt(kho.id,  'Khu C', 'D2', 'K1', 'T1', 300);
  const vtLanh1 = await getOrCreateVt(kho2.id, 'Khu Lạnh', 'D1', 'K1', 'T1', 100, 'Nhiệt độ 2-8°C');
  const vtLanh2 = await getOrCreateVt(kho2.id, 'Khu Lạnh', 'D1', 'K2', 'T1', 100, 'Nhiệt độ 2-8°C');

  const allVt = [vtA1, vtA2, vtA3, vtB1, vtB2, vtB3, vtC1, vtC2, vtC3, vtLanh1, vtLanh2];
  console.log(`  ✓ Đã chuẩn bị ${allVt.length} vị trí kho`);

  // ── Lấy NCC để gán ──────────────────────────────────────────────
  const ncc1 = await prisma.nha_cung_cap.findFirst({ where: { ma_ncc: 'NCC-001' } });
  const ncc2 = await prisma.nha_cung_cap.findFirst({ where: { ma_ncc: 'NCC-002' } });
  const ncc3 = await prisma.nha_cung_cap.findFirst({ where: { ma_ncc: 'NCC-003' } });
  const ncc4 = await prisma.nha_cung_cap.findFirst({ where: { ma_ncc: 'NCC-004' } });
  const ncc5 = await prisma.nha_cung_cap.findFirst({ where: { ma_ncc: 'NCC-005' } });

  if (!ncc1 || !ncc2 || !ncc3 || !ncc4 || !ncc5) {
    throw new Error('Chưa có NCC! Hãy chạy seed-full.ts trước.');
  }

  // ── Lấy tất cả biến thể ──────────────────────────────────────────
  const allBienThe = await prisma.bien_the_san_pham.findMany({
    include: { san_pham: true },
    orderBy: { id: 'asc' },
  });

  console.log(`  ✓ Tìm thấy ${allBienThe.length} biến thể sản phẩm`);

  // ── Mapping SKU prefix -> NCC + thông tin lô hàng ────────────────
  type LoConfig = {
    nccId: number;
    hanSuDung: Date;   // ngày hết hạn
    ngayThuHoach: Date;
    viTri: typeof vtA1;
    soLuong: number;   // tồn kho
  };

  const getLoConfig = (sku: string): LoConfig => {
    const s = sku?.toLowerCase() ?? '';

    // Rau lá, củ tươi -> HSD ngắn
    if (s.startsWith('rmuong') || s.startsWith('kale'))
      return { nccId: ncc1.id, hanSuDung: addDays(today, 7),  ngayThuHoach: addDays(today, -1), viTri: vtLanh1, soLuong: 120 };
    if (s.startsWith('cachua') || s.startsWith('broccoli'))
      return { nccId: ncc1.id, hanSuDung: addDays(today, 10), ngayThuHoach: addDays(today, -2), viTri: vtLanh1, soLuong: 100 };
    if (s.startsWith('nghe'))
      return { nccId: ncc2.id, hanSuDung: addDays(today, 30), ngayThuHoach: addDays(today, -5), viTri: vtB1, soLuong: 80 };

    // Trái cây -> HSD trung bình
    if (s.startsWith('dautay'))
      return { nccId: ncc1.id, hanSuDung: addDays(today, 5),  ngayThuHoach: addDays(today, -1), viTri: vtLanh2, soLuong: 60 };
    if (s.startsWith('xoai'))
      return { nccId: ncc4.id, hanSuDung: addDays(today, 14), ngayThuHoach: addDays(today, -3), viTri: vtB2, soLuong: 90 };
    if (s.startsWith('bo-') || s.startsWith('bo1') || s === 'bo-1kg' || s === 'bo-10kg')
      return { nccId: ncc2.id, hanSuDung: addDays(today, 14), ngayThuHoach: addDays(today, -4), viTri: vtB3, soLuong: 75 };
    if (s.startsWith('chuoi'))
      return { nccId: ncc2.id, hanSuDung: addDays(today, 10), ngayThuHoach: addDays(today, -3), viTri: vtA3, soLuong: 60 };
    if (s.startsWith('khoailang'))
      return { nccId: ncc4.id, hanSuDung: addDays(today, 30), ngayThuHoach: addDays(today, -7), viTri: vtB1, soLuong: 80 };

    // Gạo, hạt, nấm khô -> HSD dài
    if (s.startsWith('st25'))
      return { nccId: ncc3.id, hanSuDung: addDays(today, 365), ngayThuHoach: addDays(today, -30), viTri: vtC1, soLuong: 200 };
    if (s.startsWith('gaolut'))
      return { nccId: ncc3.id, hanSuDung: addDays(today, 365), ngayThuHoach: addDays(today, -20), viTri: vtC2, soLuong: 150 };
    if (s.startsWith('namdg'))
      return { nccId: ncc1.id, hanSuDung: addDays(today, 7),  ngayThuHoach: addDays(today, -1), viTri: vtLanh1, soLuong: 70 };
    if (s.startsWith('namlc'))
      return { nccId: ncc1.id, hanSuDung: addDays(today, 730), ngayThuHoach: addDays(today, -60), viTri: vtA1, soLuong: 50 };

    // Gia vị, mật ong, tiêu
    if (s.startsWith('matong'))
      return { nccId: ncc5.id, hanSuDung: addDays(today, 720), ngayThuHoach: addDays(today, -90), viTri: vtA2, soLuong: 40 };
    if (s.startsWith('tieu'))
      return { nccId: ncc5.id, hanSuDung: addDays(today, 365), ngayThuHoach: addDays(today, -45), viTri: vtA2, soLuong: 80 };

    // Hạt, đậu
    if (s.startsWith('dauden'))
      return { nccId: ncc3.id, hanSuDung: addDays(today, 365), ngayThuHoach: addDays(today, -20), viTri: vtC3, soLuong: 100 };
    if (s.startsWith('dieu'))
      return { nccId: ncc4.id, hanSuDung: addDays(today, 180), ngayThuHoach: addDays(today, -15), viTri: vtC3, soLuong: 80 };

    // Trà, hoa
    if (s.startsWith('tra'))
      return { nccId: ncc1.id, hanSuDung: addDays(today, 365), ngayThuHoach: addDays(today, -30), viTri: vtB2, soLuong: 60 };
    if (s.startsWith('hoacuc'))
      return { nccId: ncc1.id, hanSuDung: addDays(today, 365), ngayThuHoach: addDays(today, -30), viTri: vtB3, soLuong: 50 };

    // Default fallback
    return { nccId: ncc1.id, hanSuDung: addDays(today, 90), ngayThuHoach: addDays(today, -7), viTri: vtC1, soLuong: 50 };
  };

  // ── Tạo lô hàng + tồn kho cho từng biến thể ────────────────────
  let created = 0;
  let skipped = 0;

  for (const bt of allBienThe) {
    if (!bt.ma_sku) {
      console.log(`  ⚠️  Biến thể id=${bt.id} (${bt.san_pham?.ten_san_pham}) không có SKU, bỏ qua`);
      skipped++;
      continue;
    }

    const cfg = getLoConfig(bt.ma_sku);
    const maLoHang = `LO-${bt.ma_sku}-FULL`;

    // Kiểm tra lô đã tồn tại chưa
    const existingLo = await prisma.lo_hang.findUnique({ where: { ma_lo_hang: maLoHang } });
    if (existingLo) {
      // Cập nhật tồn kho nếu đã có lô
      const existingTon = await prisma.ton_kho_tong.findFirst({ where: { ma_lo_hang: existingLo.id } });
      if (!existingTon) {
        await prisma.ton_kho_tong.create({
          data: { ma_lo_hang: existingLo.id, ma_vi_tri: cfg.viTri.id, so_luong: cfg.soLuong },
        });
        console.log(`  ✓ Thêm tồn kho cho lô đã có: ${maLoHang} (${cfg.soLuong} sp)`);
        created++;
      } else {
        // Đảm bảo số lượng đủ lớn
        if ((existingTon.so_luong ?? 0) < 10) {
          await prisma.ton_kho_tong.update({
            where: { id: existingTon.id },
            data: { so_luong: cfg.soLuong },
          });
          console.log(`  🔄 Cập nhật tồn kho: ${maLoHang} -> ${cfg.soLuong} sp`);
        }
        skipped++;
      }
      continue;
    }

    // Tạo lô hàng mới
    const lo = await prisma.lo_hang.create({
      data: {
        ma_lo_hang: maLoHang,
        ma_bien_the: bt.id,
        ma_ncc: cfg.nccId,
        ngay_thu_hoach: cfg.ngayThuHoach,
        han_su_dung: cfg.hanSuDung,
        ngay_nhap_kho: addDays(today, -2),
        trang_thai: 'BINH_THUONG',
      },
    });

    // Tạo tồn kho
    await prisma.ton_kho_tong.create({
      data: {
        ma_lo_hang: lo.id,
        ma_vi_tri: cfg.viTri.id,
        so_luong: cfg.soLuong,
      },
    });

    // Tạo 2 kiện hàng chi tiết (barcode mẫu)
    await prisma.kien_hang_chi_tiet.createMany({
      data: [
        { ma_lo_hang: lo.id, ma_vi_tri: cfg.viTri.id, ma_vach_quet: `QR-${maLoHang}-001`, trang_thai: 'TRONG_KHO' },
        { ma_lo_hang: lo.id, ma_vi_tri: cfg.viTri.id, ma_vach_quet: `QR-${maLoHang}-002`, trang_thai: 'TRONG_KHO' },
      ],
    });

    console.log(
      `  ✅ ${bt.ma_sku.padEnd(18)} | ${bt.san_pham?.ten_san_pham?.slice(0, 30).padEnd(30)} | tồn: ${cfg.soLuong} | HSD: ${cfg.hanSuDung.toISOString().slice(0, 10)}`
    );
    created++;
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`✅ HOÀN THÀNH SEED TỒN KHO`);
  console.log(`${'═'.repeat(60)}`);
  console.log(`  • Tổng biến thể: ${allBienThe.length}`);
  console.log(`  • Tạo mới: ${created}`);
  console.log(`  • Đã có sẵn / bỏ qua: ${skipped}`);
  console.log(`\n  📦 Bây giờ mọi sản phẩm đều có tồn kho để test!`);
}

main()
  .catch((e) => {
    console.error('❌ Lỗi:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
