/**
 * Xoá phân ca TUẦN NÀY và tự xếp lịch lại cho toàn bộ nhân viên (STAFF + THU_KHO).
 *
 * Tuần này: Thứ 2 → Chủ nhật, tính dựa trên ngày `today` được set thủ công cho an toàn
 *   (today = 2026-05-16 → tuần này: 2026-05-11 (Mon) → 2026-05-17 (Sun))
 *
 * Nguyên tắc xếp lịch:
 *   - Mỗi NV làm 5 ca/tuần (2 ngày nghỉ)
 *   - Mỗi (ngày × ca) phải có ≥ 2 NV
 *   - Phân bổ đều giữa Ca sáng / chiều / tối, tránh 1 NV làm liên tiếp 2 ca trong cùng ngày
 *   - Mỗi NV được nghỉ Chủ nhật theo lượt
 *
 * Cách chạy:
 *   npx ts-node -P tsconfig.seed.json prisma/reseed-shifts-this-week.ts
 *   npx ts-node -P tsconfig.seed.json prisma/reseed-shifts-this-week.ts --execute
 */

import prisma from "../src/lib/prisma";

// Tuần hiện tại — set cứng để tránh sai khác giữa các môi trường
const WEEK_START = new Date("2026-05-11T00:00:00Z"); // Thứ 2
const WEEK_END = new Date("2026-05-17T23:59:59Z"); // Chủ nhật
const DAY_COUNT = 7;

const DAYS = (() => {
  const out: Date[] = [];
  for (let i = 0; i < DAY_COUNT; i++) {
    const d = new Date(WEEK_START);
    d.setUTCDate(d.getUTCDate() + i);
    out.push(d);
  }
  return out;
})();

const DAY_LABEL = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

function fmtDate(d: Date) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

async function main() {
  const execute = process.argv.includes("--execute");

  // 1. Lấy nhân viên
  const staff = await prisma.nguoi_dung.findMany({
    where: {
      vai_tro_nguoi_dung: {
        some: { vai_tro: { ten_vai_tro: { in: ["STAFF", "THU_KHO"] } } },
      },
    },
    select: {
      id: true,
      email: true,
      ho_so_nguoi_dung: { select: { ho_ten: true, chuc_vu: true } },
    },
    orderBy: { id: "asc" },
  });

  // 2. Lấy ca làm việc
  const cas = await prisma.ca_lam_viec.findMany({ orderBy: { id: "asc" } });
  if (cas.length === 0) {
    console.error("❌ Không có ca làm việc trong DB. Hãy seed ca trước.");
    return;
  }

  const caSang = cas.find((c) => c.ten_ca?.toLowerCase().includes("sáng")) ?? cas[0];
  const caChieu = cas.find((c) => c.ten_ca?.toLowerCase().includes("chiều")) ?? cas[1] ?? cas[0];
  const caToi = cas.find((c) => c.ten_ca?.toLowerCase().includes("tối")) ?? cas[2] ?? cas[0];
  const ALL_CAS = [caSang, caChieu, caToi];

  console.log(`Nhân viên: ${staff.length}`);
  console.log(`Ca: Sáng #${caSang.id}, Chiều #${caChieu.id}, Tối #${caToi.id}`);
  console.log(`Tuần: ${fmtDate(WEEK_START)} → ${fmtDate(WEEK_END)}`);

  // 3. Đếm phân ca hiện tại tuần này
  const existing = await prisma.lich_phan_cong_ca.count({
    where: { ngay_lam_viec: { gte: WEEK_START, lte: WEEK_END } },
  });
  console.log(`Phân ca hiện có tuần này: ${existing} (sẽ xoá)`);

  // 4. Xếp lịch tự động
  // Mỗi NV nghỉ 2 ngày cố định: ngày off lần lượt theo index để rải đều
  // Ngày làm: 5 ca/tuần — mỗi ngày làm 1 ca duy nhất, ca xoay vòng
  type Assignment = { ma_nguoi_dung: number; ma_ca_lam: number; ngay_lam_viec: Date };
  const assignments: Assignment[] = [];

  staff.forEach((nv, nvIdx) => {
    // 2 ngày off cách nhau 3-4 ngày để rải đều
    const off1 = nvIdx % DAY_COUNT;
    const off2 = (nvIdx + 3) % DAY_COUNT;
    const offSet = new Set([off1, off2]);

    let caRotation = nvIdx % 3; // điểm khởi đầu xoay ca
    for (let day = 0; day < DAY_COUNT; day++) {
      if (offSet.has(day)) continue;
      const ca = ALL_CAS[caRotation % 3];
      caRotation++;
      assignments.push({
        ma_nguoi_dung: nv.id,
        ma_ca_lam: ca.id,
        ngay_lam_viec: DAYS[day],
      });
    }
  });

  // 5. Đảm bảo mỗi (ngày × ca) có ≥ 2 NV — bổ sung nếu cần
  const coverageKey = (day: number, caId: number) => `${day}-${caId}`;
  const coverage = new Map<string, number>();
  for (const a of assignments) {
    const dayIdx = DAYS.findIndex((d) => d.getTime() === a.ngay_lam_viec.getTime());
    const k = coverageKey(dayIdx, a.ma_ca_lam);
    coverage.set(k, (coverage.get(k) ?? 0) + 1);
  }

  const MIN_PER_SLOT = 2;
  for (let day = 0; day < DAY_COUNT; day++) {
    for (const ca of ALL_CAS) {
      const k = coverageKey(day, ca.id);
      let count = coverage.get(k) ?? 0;
      while (count < MIN_PER_SLOT) {
        // Tìm NV chưa được phân ca này ngày này và đang được nghỉ → cho thêm
        const dayAssignments = assignments.filter(
          (a) => a.ngay_lam_viec.getTime() === DAYS[day].getTime(),
        );
        const assignedToday = new Set(dayAssignments.map((a) => a.ma_nguoi_dung));
        const candidates = staff.filter((nv) => !assignedToday.has(nv.id));
        if (candidates.length === 0) break;
        const pick = candidates[Math.floor(Math.random() * candidates.length)];
        assignments.push({
          ma_nguoi_dung: pick.id,
          ma_ca_lam: ca.id,
          ngay_lam_viec: DAYS[day],
        });
        count++;
        coverage.set(k, count);
      }
    }
  }

  // 6. Thống kê
  console.log(`\nTổng phân ca sẽ tạo: ${assignments.length}`);
  console.log("\nBảng phân bổ (theo nhân viên):");
  for (const nv of staff) {
    const mine = assignments.filter((a) => a.ma_nguoi_dung === nv.id);
    const labels = DAYS.map((d, idx) => {
      const got = mine.find((a) => a.ngay_lam_viec.getTime() === d.getTime());
      if (!got) return DAY_LABEL[idx] + ":nghỉ";
      const caName = got.ma_ca_lam === caSang.id ? "S" : got.ma_ca_lam === caChieu.id ? "C" : "T";
      return DAY_LABEL[idx] + ":" + caName;
    }).join(" ");
    console.log(`  #${nv.id} ${nv.ho_so_nguoi_dung?.ho_ten ?? nv.email}: ${labels}`);
  }

  console.log("\nCoverage theo ngày × ca:");
  for (let day = 0; day < DAY_COUNT; day++) {
    const parts = ALL_CAS.map((ca) => {
      const c = coverage.get(coverageKey(day, ca.id)) ?? 0;
      const nameInitial = ca === caSang ? "S" : ca === caChieu ? "C" : "T";
      return `${nameInitial}=${c}`;
    });
    console.log(`  ${DAY_LABEL[day]} ${fmtDate(DAYS[day])}:  ${parts.join("  ")}`);
  }

  if (!execute) {
    console.log("\n[DRY-RUN] Thêm --execute để xoá phân ca cũ + insert lịch mới.");
    return;
  }

  // 7. Thực thi
  console.log("\n⚙️  Xoá phân ca cũ tuần này...");
  const del = await prisma.lich_phan_cong_ca.deleteMany({
    where: { ngay_lam_viec: { gte: WEEK_START, lte: WEEK_END } },
  });
  console.log(`   Đã xoá ${del.count} bản ghi.`);

  console.log("⚙️  Insert lịch mới...");
  await prisma.lich_phan_cong_ca.createMany({
    data: assignments.map((a) => ({
      ma_nguoi_dung: a.ma_nguoi_dung,
      ma_ca_lam: a.ma_ca_lam,
      ngay_lam_viec: a.ngay_lam_viec,
    })),
  });
  console.log(`✅ Đã insert ${assignments.length} phân ca cho tuần ${fmtDate(WEEK_START)} → ${fmtDate(WEEK_END)}.`);
}

main()
  .catch((e) => {
    console.error("❌ Lỗi:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
