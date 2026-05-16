import prisma from "../src/lib/prisma";
async function main() {
  const totalReviews = await prisma.danh_gia_san_pham.count();
  const totalProducts = await prisma.san_pham.count();
  const totalCustomers = await prisma.nguoi_dung.count({
    where: { vai_tro_nguoi_dung: { some: { vai_tro: { ten_vai_tro: "KHACH_HANG" } } } }
  });
  const deliveredOrders = await prisma.don_hang.count({ where: { trang_thai: "DA_GIAO" } });
  const sampleProducts = await prisma.san_pham.findMany({
    take: 5, select: { id: true, ten_san_pham: true }
  });
  console.log("Reviews:", totalReviews);
  console.log("Products:", totalProducts);
  console.log("Customers:", totalCustomers);
  console.log("Delivered orders:", deliveredOrders);
  console.log("Sample products:", sampleProducts);
}
main().catch(console.error).finally(() => prisma.$disconnect());
