/**
 * Seed bình luận sản phẩm dựa trên data THẬT trong DB.
 *
 * Nguyên tắc:
 *   1. Ưu tiên bình luận từ khách đã mua (có don_hang DA_GIAO) — đúng nghiệp vụ
 *   2. Bổ sung thêm review từ khách thật khác để admin có data đa dạng demo
 *   3. Mix star (3-5), trạng thái (DA_DUYET / CHO_DUYET / DA_AN), có/không admin reply
 *   4. Mỗi (KH, SP) chỉ 1 review (theo business rule)
 *
 * Cách chạy:
 *   npx ts-node -P tsconfig.seed.json prisma/seed-reviews.ts
 *   npx ts-node -P tsconfig.seed.json prisma/seed-reviews.ts --execute
 */

import prisma from "../src/lib/prisma";

// Pool nội dung bình luận thực tế cho nông sản
const REVIEW_POOL: Record<number, string[]> = {
  5: [
    "Sản phẩm rất tươi, đóng gói cẩn thận. Mình sẽ mua lại lần sau!",
    "Chất lượng tuyệt vời, đúng như mô tả. Rau xanh, giòn, không dập.",
    "Giao hàng nhanh, sản phẩm tươi ngon. Cả nhà ăn rất thích.",
    "Hài lòng 100%, hàng organic đảm bảo, giá hợp lý.",
    "Tươi, sạch, đóng gói chỉn chu. Shop tư vấn nhiệt tình.",
    "Rất ngon, nấu canh ngọt nước. Ủng hộ nông sản Việt!",
    "Mua nhiều lần rồi, lần nào cũng chất lượng ổn định. Cảm ơn shop.",
    "Hàng đẹp, không thuốc trừ sâu, ăn yên tâm cho cả nhà.",
  ],
  4: [
    "Sản phẩm khá tươi, đóng gói tốt. Sẽ tiếp tục ủng hộ.",
    "Hàng đẹp, giao nhanh. Có vài lá hơi héo nhưng chấp nhận được.",
    "Chất lượng ổn so với giá tiền. Mình thấy hài lòng.",
    "Rau tươi nhưng số lượng hơi ít hơn kỳ vọng một chút.",
    "Giao đúng hẹn, sản phẩm tươi. Sẽ thử mua thêm sản phẩm khác.",
    "Tổng thể ổn, mong shop giữ chất lượng đều đặn.",
  ],
  3: [
    "Sản phẩm tạm ổn, không tươi bằng kỳ vọng. Hy vọng lần sau cải thiện.",
    "Hàng nhận có vài chỗ dập nhẹ, vẫn dùng được.",
    "Bình thường, không nổi bật. Giá hơi cao so với chợ.",
    "Giao chậm hơn dự kiến, sản phẩm vẫn dùng được nhưng không tươi lắm.",
  ],
};

const ADMIN_REPLIES = [
  "Cảm ơn anh/chị đã ủng hộ shop! Hẹn gặp lại trong lần mua tiếp theo.",
  "Cảm ơn đánh giá tích cực của anh/chị. Shop sẽ tiếp tục giữ chất lượng.",
  "Shop ghi nhận phản hồi và sẽ cải thiện quy trình đóng gói.",
  "Xin lỗi vì trải nghiệm chưa trọn vẹn. Shop sẽ kiểm tra lại lô hàng.",
  "Cảm ơn anh/chị đã góp ý. Shop sẽ làm tốt hơn ở những đơn sau.",
];

function randPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randDateWithinDays(days: number): Date {
  const now = Date.now();
  const past = now - Math.random() * days * 24 * 3600 * 1000;
  return new Date(past);
}

async function main() {
  const execute = process.argv.includes("--execute");

  // 1. Lấy data thật
  const customers = await prisma.nguoi_dung.findMany({
    where: {
      vai_tro_nguoi_dung: { some: { vai_tro: { ten_vai_tro: "KHACH_HANG" } } },
    },
    select: {
      id: true,
      email: true,
      ho_so_nguoi_dung: { select: { ho_ten: true } },
    },
  });

  const products = await prisma.san_pham.findMany({
    select: { id: true, ten_san_pham: true },
  });

  const deliveredOrders = await prisma.don_hang.findMany({
    where: { trang_thai: "DA_GIAO", ma_nguoi_dung: { not: null } },
    select: {
      ma_nguoi_dung: true,
      chi_tiet_don_hang: {
        select: {
          bien_the_san_pham: { select: { ma_san_pham: true } },
        },
      },
    },
  });

  // 2. Tập (user_id → set sản phẩm đã mua)
  const boughtMap = new Map<number, Set<number>>();
  for (const o of deliveredOrders) {
    if (!o.ma_nguoi_dung) continue;
    if (!boughtMap.has(o.ma_nguoi_dung)) boughtMap.set(o.ma_nguoi_dung, new Set());
    for (const ct of o.chi_tiet_don_hang) {
      const sp = ct.bien_the_san_pham?.ma_san_pham;
      if (sp) boughtMap.get(o.ma_nguoi_dung)!.add(sp);
    }
  }

  // 3. Build review plan
  type Plan = {
    ma_san_pham: number;
    ma_nguoi_dung: number;
    so_sao: number;
    noi_dung: string;
    trang_thai: "DA_DUYET" | "CHO_DUYET" | "DA_AN";
    phan_hoi_admin?: string;
    ngay_phan_hoi?: Date;
    ngay_tao: Date;
  };
  const plans: Plan[] = [];

  // (a) Review từ khách thật đã mua (đúng nghiệp vụ)
  for (const [userId, productSet] of boughtMap.entries()) {
    for (const productId of productSet) {
      const star = randPick([5, 5, 5, 4, 4, 3]);
      const content = randPick(REVIEW_POOL[star]);
      const hasReply = Math.random() < 0.6;
      const ngayTao = randDateWithinDays(30);
      plans.push({
        ma_san_pham: productId,
        ma_nguoi_dung: userId,
        so_sao: star,
        noi_dung: content,
        trang_thai: "DA_DUYET",
        ...(hasReply
          ? {
              phan_hoi_admin: randPick(ADMIN_REPLIES),
              ngay_phan_hoi: new Date(ngayTao.getTime() + 6 * 3600 * 1000),
            }
          : {}),
        ngay_tao: ngayTao,
      });
    }
  }

  // (b) Bổ sung thêm để admin có data đa dạng: mỗi KH thêm ~5 review trên SP khác
  const trangThaiPool: Plan["trang_thai"][] = [
    "DA_DUYET",
    "DA_DUYET",
    "DA_DUYET",
    "CHO_DUYET",
    "CHO_DUYET",
    "DA_AN",
  ];

  const seen = new Set<string>();
  for (const p of plans) seen.add(`${p.ma_nguoi_dung}-${p.ma_san_pham}`);

  for (const c of customers) {
    let added = 0;
    const shuffled = [...products].sort(() => Math.random() - 0.5);
    for (const p of shuffled) {
      if (added >= 5) break;
      const key = `${c.id}-${p.id}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const star = randPick([5, 5, 4, 4, 3]);
      const status = randPick(trangThaiPool);
      const hasReply = status === "DA_DUYET" && Math.random() < 0.4;
      const ngayTao = randDateWithinDays(60);

      plans.push({
        ma_san_pham: p.id,
        ma_nguoi_dung: c.id,
        so_sao: star,
        noi_dung: randPick(REVIEW_POOL[star]),
        trang_thai: status,
        ...(hasReply
          ? {
              phan_hoi_admin: randPick(ADMIN_REPLIES),
              ngay_phan_hoi: new Date(ngayTao.getTime() + 12 * 3600 * 1000),
            }
          : {}),
        ngay_tao: ngayTao,
      });
      added++;
    }
  }

  // 4. Báo cáo
  const byStatus: Record<string, number> = {};
  const byStar: Record<number, number> = {};
  for (const p of plans) {
    byStatus[p.trang_thai] = (byStatus[p.trang_thai] || 0) + 1;
    byStar[p.so_sao] = (byStar[p.so_sao] || 0) + 1;
  }

  console.log(`Tổng review sẽ tạo: ${plans.length}`);
  console.log(`  Theo trạng thái:`, byStatus);
  console.log(`  Theo số sao:    `, byStar);
  console.log(`  Có phản hồi admin: ${plans.filter((p) => p.phan_hoi_admin).length}`);

  console.log("\nMẫu 5 review đầu:");
  for (const p of plans.slice(0, 5)) {
    const cust = customers.find((c) => c.id === p.ma_nguoi_dung);
    const prod = products.find((s) => s.id === p.ma_san_pham);
    console.log(
      `  ${p.so_sao}★ [${p.trang_thai}] ${cust?.ho_so_nguoi_dung?.ho_ten ?? cust?.email} → ${prod?.ten_san_pham}: "${p.noi_dung.slice(0, 60)}..."`,
    );
  }

  if (!execute) {
    console.log("\n[DRY-RUN] Thêm --execute để thực sự insert.");
    return;
  }

  console.log("\n⚙️  Đang insert...");
  for (const p of plans) {
    await prisma.danh_gia_san_pham.create({
      data: {
        ma_san_pham: p.ma_san_pham,
        ma_nguoi_dung: p.ma_nguoi_dung,
        so_sao: p.so_sao,
        noi_dung: p.noi_dung,
        trang_thai: p.trang_thai,
        phan_hoi_admin: p.phan_hoi_admin,
        ngay_phan_hoi: p.ngay_phan_hoi,
        ngay_tao: p.ngay_tao,
      },
    });
  }
  console.log(`✅ Đã insert ${plans.length} review.`);
}

main()
  .catch((e) => {
    console.error("❌ Lỗi:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
