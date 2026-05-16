/**
 * Xoá khách hàng fake không có chi tiêu.
 *
 * Tiêu chí "fake":
 *   - role = KHACH_HANG
 *   - SĐT match pattern seed:
 *       (a) "09" + 1 chữ số lặp 7 lần (VD: 0911111111, 0988888888)
 *       (b) "09" + 8 chữ số tăng dần liên tiếp (VD: 0912345678, 0945678901)
 *   - tổng chi tiêu = 0 (không có don_hang nào còn lại, kể cả DA_HUY)
 *
 * Cascade tự động (đã set onDelete: Cascade trong schema):
 *   ho_so_nguoi_dung, dia_chi_nguoi_dung, gio_hang, vai_tro_nguoi_dung,
 *   du_lieu_khuon_mat, san_pham_yeu_thich, thong_bao, lich_su_dang_nhap,
 *   lich_su_nhan_hang, danh_gia_san_pham, yeu_cau_doi_tra, nhiem_vu_cong_viec
 *
 * KHÔNG cascade (set NULL trước khi xoá):
 *   don_hang.ma_nguoi_dung, phien_chat_ai.ma_nguoi_dung
 *
 * Cách chạy:
 *   npx ts-node -P tsconfig.seed.json prisma/delete-fake-customers.ts
 *   npx ts-node -P tsconfig.seed.json prisma/delete-fake-customers.ts --execute
 */

import prisma from "../src/lib/prisma";

// Pattern 1: "09" + 1 chữ số lặp lại 7 lần. VD: 0911111111, 0988888888
const REPEATED_PHONE_RE = /^09(\d)\1{7}$/;

// Pattern 2: "09" + 8 chữ số tăng dần liên tiếp (mod 10).
// VD: 0912345678, 0923456789, 0934567890, 0945678901
function isSequentialPhone(phone: string): boolean {
  if (!/^09\d{8}$/.test(phone)) return false;
  const digits = phone.slice(2);
  for (let i = 1; i < digits.length; i++) {
    const expected = (Number(digits[i - 1]) + 1) % 10;
    if (Number(digits[i]) !== expected) return false;
  }
  return true;
}

function isFakePhone(phone: string): boolean {
  return REPEATED_PHONE_RE.test(phone) || isSequentialPhone(phone);
}

async function main() {
  const execute = process.argv.includes("--execute");

  const customers = await prisma.nguoi_dung.findMany({
    where: {
      vai_tro_nguoi_dung: {
        some: { vai_tro: { ten_vai_tro: "KHACH_HANG" } },
      },
    },
    select: {
      id: true,
      email: true,
      ho_so_nguoi_dung: { select: { ho_ten: true, so_dien_thoai: true } },
      don_hang: { select: { id: true, tong_tien: true } },
    },
  });

  const fakeNoSpend = customers.filter((c) => {
    const phone = c.ho_so_nguoi_dung?.so_dien_thoai ?? "";
    if (!isFakePhone(phone)) return false;
    const totalSpent = c.don_hang.reduce(
      (s, d) => s + Number(d.tong_tien ?? 0),
      0,
    );
    return totalSpent === 0;
  });

  console.log(`Tổng khách hàng:           ${customers.length}`);
  console.log(`Khách fake không chi tiêu: ${fakeNoSpend.length}`);
  console.log(`Khách thật giữ lại:        ${customers.length - fakeNoSpend.length}`);

  if (fakeNoSpend.length > 0) {
    console.log("\nDanh sách sẽ xoá:");
    for (const c of fakeNoSpend) {
      console.log(
        `  #${c.id} · ${c.ho_so_nguoi_dung?.ho_ten ?? "?"} · ${c.ho_so_nguoi_dung?.so_dien_thoai ?? "?"} · ${c.email}`,
      );
    }
  }

  if (!execute) {
    console.log("\n[DRY-RUN] Thêm --execute để thực sự xoá.");
    return;
  }

  if (fakeNoSpend.length === 0) {
    console.log("\nKhông có gì để xoá.");
    return;
  }

  const ids = fakeNoSpend.map((c) => c.id);

  console.log("\n⚙️  Đang xoá...");

  await prisma.$transaction(async (tx) => {
    // Set NULL các bảng không cascade
    await tx.don_hang.updateMany({
      where: { ma_nguoi_dung: { in: ids } },
      data: { ma_nguoi_dung: null },
    });
    await tx.phien_chat_ai.updateMany({
      where: { ma_nguoi_dung: { in: ids } },
      data: { ma_nguoi_dung: null },
    });

    const result = await tx.nguoi_dung.deleteMany({
      where: { id: { in: ids } },
    });

    console.log(`✅ Đã xoá ${result.count} khách hàng fake (cascade các bảng phụ).`);
  });
}

main()
  .catch((e) => {
    console.error("❌ Lỗi:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
