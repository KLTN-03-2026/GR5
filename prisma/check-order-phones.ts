import prisma from "../src/lib/prisma";

async function main() {
  const orders = await prisma.don_hang.findMany({
    select: {
      sdt_nguoi_nhan: true,
      ho_ten_nguoi_nhan: true,
    },
  });

  const phoneCount = new Map<string, number>();
  for (const o of orders) {
    const k = o.sdt_nguoi_nhan ?? "(null)";
    phoneCount.set(k, (phoneCount.get(k) ?? 0) + 1);
  }

  const sorted = [...phoneCount.entries()].sort((a, b) => b[1] - a[1]);
  console.log(`Tổng đơn: ${orders.length}`);
  console.log(`Số SĐT khác nhau: ${sorted.length}`);
  console.log("\nTop 30 SĐT (đếm số đơn):");
  for (const [phone, n] of sorted.slice(0, 30)) {
    console.log(`  ${phone.padEnd(15)} ${n}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
