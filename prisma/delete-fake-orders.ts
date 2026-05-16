/**
 * Xoá đơn hàng fake (do seed tạo).
 *
 * Tiêu chí "fake": sdt_nguoi_nhan khớp pattern số seed:
 *   - 10 ký tự, bắt đầu bằng 0, sau đó 9 chữ số GIỐNG NHAU hoàn toàn
 *   - VD: 0911111111, 0922222222 ... 0988888888
 *
 * Cascade DELETE đã được set sẵn ở các bảng liên quan:
 *   chi_tiet_don_hang, don_van_chuyen, lich_su_don_hang,
 *   giao_dich_thanh_toan (→ lich_su_hoan_tien),
 *   yeu_cau_doi_tra (→ chi_tiet_doi_tra, lich_su_hoan_tien),
 *   nhiem_vu_cong_viec
 *
 * Riêng phieu_xuat_kho.ma_don_hang KHÔNG cascade → set NULL trước.
 *
 * Cách chạy:
 *   npx ts-node -P tsconfig.seed.json prisma/delete-fake-orders.ts
 *   npx ts-node -P tsconfig.seed.json prisma/delete-fake-orders.ts --execute
 *
 * Không có --execute → chỉ in số lượng (dry-run).
 */

import prisma from "../src/lib/prisma";

// Khớp: bắt đầu "09" + 1 chữ số lặp lại 7 lần (tổng 8 chữ số giống)
// VD: 0911111111, 0922222222 ... 0988888888
const FAKE_PHONE_RE = /^09(\d)\1{7}$/;

async function main() {
  const execute = process.argv.includes("--execute");

  const allOrders = await prisma.don_hang.findMany({
    select: {
      id: true,
      sdt_nguoi_nhan: true,
      ho_ten_nguoi_nhan: true,
      tong_tien: true,
      ngay_tao: true,
    },
  });

  const fakeOrders = allOrders.filter(
    (o) => o.sdt_nguoi_nhan && FAKE_PHONE_RE.test(o.sdt_nguoi_nhan),
  );
  const fakeIds = fakeOrders.map((o) => o.id);

  console.log(`Tổng đơn hàng trong DB:   ${allOrders.length}`);
  console.log(`Đơn fake (SĐT pattern):   ${fakeOrders.length}`);
  console.log(`Đơn thật giữ lại:         ${allOrders.length - fakeOrders.length}`);

  if (fakeOrders.length > 0) {
    const sample = fakeOrders.slice(0, 5).map(
      (o) =>
        `  #${o.id} · ${o.ho_ten_nguoi_nhan ?? "?"} · ${o.sdt_nguoi_nhan} · ${o.tong_tien}đ`,
    );
    console.log("\nMẫu (tối đa 5):");
    console.log(sample.join("\n"));
  }

  if (!execute) {
    console.log("\n[DRY-RUN] Thêm cờ --execute để thực sự xoá.");
    return;
  }

  if (fakeIds.length === 0) {
    console.log("\nKhông có gì để xoá.");
    return;
  }

  console.log("\n⚙️  Đang xoá...");

  await prisma.$transaction(async (tx) => {
    await tx.phieu_xuat_kho.updateMany({
      where: { ma_don_hang: { in: fakeIds } },
      data: { ma_don_hang: null },
    });

    const result = await tx.don_hang.deleteMany({
      where: { id: { in: fakeIds } },
    });

    console.log(`✅ Đã xoá ${result.count} đơn hàng fake (cascade các bảng phụ).`);
  });
}

main()
  .catch((e) => {
    console.error("❌ Lỗi:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
