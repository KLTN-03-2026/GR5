/**
 * Bổ sung kiện hàng chi tiết cho tất cả lô hàng có tồn kho
 * Đảm bảo số kiện hàng TRONG_KHO >= số lượng tồn kho
 *
 * Lệnh:
 *   npx ts-node --compiler-options "{\"module\":\"CommonJS\"}" prisma/seed-kien-hang.ts
 */

import * as dotenv from 'dotenv';
dotenv.config();

import prisma from '../src/lib/prisma';

async function main() {
  console.log('📦 Bổ sung kiện hàng chi tiết cho tất cả lô...\n');

  const tonKhos = await prisma.ton_kho_tong.findMany({
    where: { so_luong: { gt: 0 } },
    include: { lo_hang: true },
  });

  let totalCreated = 0;

  for (const tk of tonKhos) {
    if (!tk.lo_hang) continue;

    const existingCount = await prisma.kien_hang_chi_tiet.count({
      where: { ma_lo_hang: tk.lo_hang.id, trang_thai: 'TRONG_KHO' },
    });

    const needed = (tk.so_luong ?? 0) - existingCount;
    if (needed <= 0) continue;

    const data = Array.from({ length: needed }, (_, i) => ({
      ma_lo_hang: tk.lo_hang!.id,
      ma_vi_tri: tk.ma_vi_tri,
      ma_vach_quet: `QR-${tk.lo_hang!.ma_lo_hang}-${existingCount + i + 1}`,
      trang_thai: 'TRONG_KHO',
    }));

    await prisma.kien_hang_chi_tiet.createMany({ data });
    totalCreated += needed;
    console.log(`  ✅ Lô ${tk.lo_hang.ma_lo_hang}: +${needed} kiện (có ${existingCount} -> ${existingCount + needed})`);
  }

  console.log(`\n✅ Tổng tạo: ${totalCreated} kiện hàng chi tiết`);
}

main()
  .catch((e) => { console.error('❌ Lỗi:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
