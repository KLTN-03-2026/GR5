import * as dotenv from 'dotenv';
dotenv.config();

import prisma from '../src/lib/prisma';

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Logic phân khu:
 * - Khu A: Rau ăn lá, Rau gia vị, Gia vị tươi (rau lá mềm, cần thoáng)
 * - Khu B: Rau củ, Củ quả ăn quả, Gạo & ngũ cốc, Hạt & đậu (hàng nặng, bền)
 * - Khu C: Trái cây, Mật ong, Trà & hoa, Đặc sản khô, Sản phẩm chế biến, Sữa hạt
 * - Khu Lạnh: Nấm tươi, Nông sản hữu cơ (cần bảo quản lạnh 2-8°C)
 *
 * Logic NCC:
 * - NCC001 Nông trại Xanh Đà Lạt → Rau ăn lá, Nông sản hữu cơ
 * - NCC002 HTX Nông nghiệp Gia Lai → Rau củ, Củ quả ăn quả
 * - NCC003 HTX Lúa Gạo Sóc Trăng → Gạo & ngũ cốc
 * - NCC004 Trang trại Trái cây Tiền Giang → Trái cây
 * - NCC005 HTX Nấm Đồng Nai → Nấm tươi
 * - NCC006 Nông trại Gia vị Tây Nguyên → Gia vị tươi, Rau gia vị
 * - NCC007 HTX Hạt điều Bình Phước → Hạt & đậu, Đặc sản khô
 * - NCC008 Nông trại Trà Hà Giang → Trà & hoa, Mật ong, Sữa hạt, SP chế biến
 */

async function main() {
  console.log('🏬 Seed tồn kho theo đúng logic khu vực + NCC...\n');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const allNcc = await prisma.nha_cung_cap.findMany({ select: { id: true, ma_ncc: true } });
  const nccMap: Record<string, number> = {};
  allNcc.forEach(n => { nccMap[n.ma_ncc!] = n.id; });

  const viTriAll = await prisma.vi_tri_kho.findMany({ where: { ma_kho: 11 }, select: { id: true, khu_vuc: true } });
  const viTriByKhu: Record<string, number[]> = {};
  viTriAll.forEach(v => {
    const k = v.khu_vuc || 'A';
    if (!viTriByKhu[k]) viTriByKhu[k] = [];
    viTriByKhu[k].push(v.id);
  });

  console.log('  Khu vực:', Object.keys(viTriByKhu).map(k => `${k}(${viTriByKhu[k].length})`).join(', '));

  const danhMucMap: Record<number, { khuVuc: string; nccCode: string; hanSuDungNgay: number; soLuongMin: number; soLuongMax: number }> = {
    10050: { khuVuc: 'A', nccCode: 'NCC001', hanSuDungNgay: 5, soLuongMin: 40, soLuongMax: 80 },
    10051: { khuVuc: 'B', nccCode: 'NCC002', hanSuDungNgay: 14, soLuongMin: 50, soLuongMax: 100 },
    10052: { khuVuc: 'C', nccCode: 'NCC004', hanSuDungNgay: 7, soLuongMin: 30, soLuongMax: 70 },
    10053: { khuVuc: 'B', nccCode: 'NCC003', hanSuDungNgay: 365, soLuongMin: 80, soLuongMax: 200 },
    10054: { khuVuc: 'Lạnh', nccCode: 'NCC005', hanSuDungNgay: 5, soLuongMin: 20, soLuongMax: 50 },
    10055: { khuVuc: 'A', nccCode: 'NCC006', hanSuDungNgay: 10, soLuongMin: 30, soLuongMax: 60 },
    10056: { khuVuc: 'B', nccCode: 'NCC007', hanSuDungNgay: 180, soLuongMin: 60, soLuongMax: 120 },
    10057: { khuVuc: 'C', nccCode: 'NCC008', hanSuDungNgay: 365, soLuongMin: 40, soLuongMax: 80 },
    10058: { khuVuc: 'C', nccCode: 'NCC008', hanSuDungNgay: 730, soLuongMin: 30, soLuongMax: 60 },
    10059: { khuVuc: 'C', nccCode: 'NCC007', hanSuDungNgay: 180, soLuongMin: 50, soLuongMax: 100 },
    10060: { khuVuc: 'Lạnh', nccCode: 'NCC001', hanSuDungNgay: 5, soLuongMin: 25, soLuongMax: 55 },
    10061: { khuVuc: 'A', nccCode: 'NCC006', hanSuDungNgay: 7, soLuongMin: 35, soLuongMax: 70 },
    10062: { khuVuc: 'B', nccCode: 'NCC002', hanSuDungNgay: 10, soLuongMin: 40, soLuongMax: 80 },
    10063: { khuVuc: 'C', nccCode: 'NCC008', hanSuDungNgay: 90, soLuongMin: 40, soLuongMax: 80 },
    10064: { khuVuc: 'C', nccCode: 'NCC008', hanSuDungNgay: 30, soLuongMin: 30, soLuongMax: 60 },
  };

  const allBienThe = await prisma.bien_the_san_pham.findMany({
    include: { san_pham: { select: { ma_danh_muc: true, ten_san_pham: true } } },
    orderBy: { id: 'asc' },
  });

  console.log(`  Tổng biến thể: ${allBienThe.length}\n`);

  let created = 0;
  const stats: Record<string, number> = { A: 0, B: 0, C: 0, 'Lạnh': 0 };

  for (const bt of allBienThe) {
    const maDanhMuc = bt.san_pham?.ma_danh_muc;
    if (!maDanhMuc) continue;

    const config = danhMucMap[maDanhMuc];
    if (!config) continue;

    const khuVuc = config.khuVuc;
    const viTriList = viTriByKhu[khuVuc];
    if (!viTriList || viTriList.length === 0) continue;

    const nccId = nccMap[config.nccCode];
    if (!nccId) continue;

    const viTriId = viTriList[bt.id % viTriList.length];
    const soLuong = config.soLuongMin + (bt.id % (config.soLuongMax - config.soLuongMin + 1));
    const hanSuDung = addDays(today, config.hanSuDungNgay + (bt.id % 5));
    const maLoHang = `LO-${khuVuc.replace('ạ', 'a')}-BT${bt.id}`;

    const lo = await prisma.lo_hang.create({
      data: {
        ma_lo_hang: maLoHang,
        ma_bien_the: bt.id,
        ma_ncc: nccId,
        ngay_thu_hoach: addDays(today, -(1 + (bt.id % 5))),
        han_su_dung: hanSuDung,
        ngay_nhap_kho: addDays(today, -(bt.id % 3)),
        trang_thai: 'BINH_THUONG',
      },
    });

    await prisma.ton_kho_tong.create({
      data: {
        ma_lo_hang: lo.id,
        ma_vi_tri: viTriId,
        so_luong: soLuong,
      },
    });

    stats[khuVuc] = (stats[khuVuc] || 0) + 1;
    created++;

    if (created % 100 === 0) {
      console.log(`  ✓ ${created}/${allBienThe.length}...`);
    }
  }

  console.log(`\n${'═'.repeat(55)}`);
  console.log('✅ HOÀN THÀNH SEED TỒN KHO');
  console.log(`${'═'.repeat(55)}`);
  console.log(`  Tổng lô hàng tạo: ${created}`);
  console.log(`  Khu A (Rau lá, Gia vị): ${stats['A']} lô`);
  console.log(`  Khu B (Rau củ, Gạo, Hạt): ${stats['B']} lô`);
  console.log(`  Khu C (Trái cây, Trà, Mật ong, Khô): ${stats['C']} lô`);
  console.log(`  Khu Lạnh (Nấm, Hữu cơ): ${stats['Lạnh']} lô`);
  console.log('\n  Liên kết NCC:');
  console.log('    NCC001 Đà Lạt → Rau ăn lá + Hữu cơ');
  console.log('    NCC002 Gia Lai → Rau củ + Củ quả');
  console.log('    NCC003 Sóc Trăng → Gạo & ngũ cốc');
  console.log('    NCC004 Tiền Giang → Trái cây');
  console.log('    NCC005 Đồng Nai → Nấm tươi');
  console.log('    NCC006 Tây Nguyên → Gia vị + Rau gia vị');
  console.log('    NCC007 Bình Phước → Hạt & đậu + Đặc sản khô');
  console.log('    NCC008 Hà Giang → Trà, Mật ong, Sữa hạt, SP chế biến');
}

main()
  .catch((e) => { console.error('❌ Lỗi:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
