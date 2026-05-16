import prisma from "../src/lib/prisma";
async function main() {
  // Khách hàng + đơn đã giao + sản phẩm trong đơn
  const orders = await prisma.don_hang.findMany({
    where: { trang_thai: "DA_GIAO", ma_nguoi_dung: { not: null } },
    select: {
      id: true,
      ma_nguoi_dung: true,
      nguoi_dung: { select: { email: true, ho_so_nguoi_dung: { select: { ho_ten: true } } } },
      chi_tiet_don_hang: {
        select: {
          bien_the_san_pham: { select: { ma_san_pham: true, san_pham: { select: { ten_san_pham: true } } } }
        }
      }
    }
  });
  for (const o of orders) {
    console.log(`Đơn #${o.id} - user #${o.ma_nguoi_dung} (${o.nguoi_dung?.ho_so_nguoi_dung?.ho_ten || o.nguoi_dung?.email})`);
    for (const ct of o.chi_tiet_don_hang) {
      console.log(`  · SP #${ct.bien_the_san_pham?.ma_san_pham} - ${ct.bien_the_san_pham?.san_pham?.ten_san_pham}`);
    }
  }
  // 4 khách hàng
  const customers = await prisma.nguoi_dung.findMany({
    where: { vai_tro_nguoi_dung: { some: { vai_tro: { ten_vai_tro: "KHACH_HANG" } } } },
    select: { id: true, email: true, ho_so_nguoi_dung: { select: { ho_ten: true } } }
  });
  console.log("\nKhách hàng:");
  customers.forEach(c => console.log(`  #${c.id} ${c.ho_so_nguoi_dung?.ho_ten || c.email}`));
}
main().catch(console.error).finally(() => prisma.$disconnect());
