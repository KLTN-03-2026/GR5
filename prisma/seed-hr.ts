/**
 * Seed HR: 30 nhân viên, 3 ca làm việc, phân ca 30 ngày, chấm công lịch sử
 * Chạy: npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed-hr.ts
 */
import prisma from "../src/lib/prisma";
import bcrypt from "bcryptjs";

// ─── Dữ liệu nhân viên mẫu ───────────────────────────────────────────────────
const NHAN_VIEN_DATA = [
  // Thủ kho (3 người)
  { ho_ten: "Nguyễn Minh Khôi",   email: "nv01@nongsan.vn", cccd: "079099010001", phone: "0901001001", chuc_vu: "Trưởng kho",        bo_phan: "Kho Tổng",     luong: 45000, ngay_sinh: "1990-03-15", loai_hop_dong: "CHINH_THUC", hop_dong_het_han: "2027-03-14", vai_tro: "THU_KHO" },
  { ho_ten: "Trần Thị Lan",        email: "nv02@nongsan.vn", cccd: "079099010002", phone: "0901001002", chuc_vu: "Thủ kho phụ",       bo_phan: "Kho Tổng",     luong: 38000, ngay_sinh: "1993-07-22", loai_hop_dong: "CHINH_THUC", hop_dong_het_han: "2026-12-31", vai_tro: "THU_KHO" },
  { ho_ten: "Lê Quốc Hùng",        email: "nv03@nongsan.vn", cccd: "079099010003", phone: "0901001003", chuc_vu: "Thủ kho ca đêm",    bo_phan: "Kho Tổng",     luong: 40000, ngay_sinh: "1988-11-08", loai_hop_dong: "CHINH_THUC", hop_dong_het_han: "2026-06-15", vai_tro: "THU_KHO" },

  // Nhân viên bốc xếp (8 người)
  { ho_ten: "Phạm Văn Đức",        email: "nv04@nongsan.vn", cccd: "079099010004", phone: "0901001004", chuc_vu: "NV bốc xếp",        bo_phan: "Bốc Xếp",      luong: 28000, ngay_sinh: "1995-02-14", loai_hop_dong: "CHINH_THUC", hop_dong_het_han: "2026-09-30", vai_tro: "STAFF" },
  { ho_ten: "Hoàng Văn Bình",      email: "nv05@nongsan.vn", cccd: "079099010005", phone: "0901001005", chuc_vu: "NV bốc xếp",        bo_phan: "Bốc Xếp",      luong: 28000, ngay_sinh: "1997-05-30", loai_hop_dong: "CHINH_THUC", hop_dong_het_han: "2026-11-30", vai_tro: "STAFF" },
  { ho_ten: "Vũ Mạnh Tuấn",        email: "nv06@nongsan.vn", cccd: "079099010006", phone: "0901001006", chuc_vu: "NV bốc xếp",        bo_phan: "Bốc Xếp",      luong: 28000, ngay_sinh: "1996-09-18", loai_hop_dong: "CHINH_THUC", hop_dong_het_han: "2027-01-31", vai_tro: "STAFF" },
  { ho_ten: "Đinh Công Thành",     email: "nv07@nongsan.vn", cccd: "079099010007", phone: "0901001007", chuc_vu: "NV bốc xếp",        bo_phan: "Bốc Xếp",      luong: 27000, ngay_sinh: "1998-12-03", loai_hop_dong: "PART_TIME",   hop_dong_het_han: "2026-05-31", vai_tro: "STAFF" },
  { ho_ten: "Ngô Thị Hà",          email: "nv08@nongsan.vn", cccd: "079099010008", phone: "0901001008", chuc_vu: "NV bốc xếp",        bo_phan: "Bốc Xếp",      luong: 27000, ngay_sinh: "1999-04-25", loai_hop_dong: "PART_TIME",   hop_dong_het_han: "2026-08-31", vai_tro: "STAFF" },
  { ho_ten: "Bùi Tiến Dũng",       email: "nv09@nongsan.vn", cccd: "079099010009", phone: "0901001009", chuc_vu: "NV bốc xếp",        bo_phan: "Bốc Xếp",      luong: 28000, ngay_sinh: "1994-08-11", loai_hop_dong: "CHINH_THUC", hop_dong_het_han: "2027-05-20", vai_tro: "STAFF" },
  { ho_ten: "Đặng Văn Hiếu",       email: "nv10@nongsan.vn", cccd: "079099010010", phone: "0901001010", chuc_vu: "Tổ trưởng bốc xếp", bo_phan: "Bốc Xếp",      luong: 33000, ngay_sinh: "1991-01-07", loai_hop_dong: "CHINH_THUC", hop_dong_het_han: "2027-07-10", vai_tro: "STAFF" },
  { ho_ten: "Lý Văn Phong",        email: "nv11@nongsan.vn", cccd: "079099010011", phone: "0901001011", chuc_vu: "NV bốc xếp",        bo_phan: "Bốc Xếp",      luong: 27000, ngay_sinh: "2000-06-19", loai_hop_dong: "THU_VIEC",   hop_dong_het_han: "2026-05-15", vai_tro: "STAFF" },

  // Nhân viên kiểm hàng (6 người)
  { ho_ten: "Nguyễn Thị Phương",   email: "nv12@nongsan.vn", cccd: "079099010012", phone: "0901001012", chuc_vu: "NV kiểm hàng",      bo_phan: "Kiểm Hàng",    luong: 30000, ngay_sinh: "1992-10-29", loai_hop_dong: "CHINH_THUC", hop_dong_het_han: "2027-02-28", vai_tro: "STAFF" },
  { ho_ten: "Trần Văn Nam",         email: "nv13@nongsan.vn", cccd: "079099010013", phone: "0901001013", chuc_vu: "NV kiểm hàng",      bo_phan: "Kiểm Hàng",    luong: 30000, ngay_sinh: "1995-03-16", loai_hop_dong: "CHINH_THUC", hop_dong_het_han: "2026-10-15", vai_tro: "STAFF" },
  { ho_ten: "Phùng Thị Thảo",      email: "nv14@nongsan.vn", cccd: "079099010014", phone: "0901001014", chuc_vu: "NV kiểm hàng",      bo_phan: "Kiểm Hàng",    luong: 30000, ngay_sinh: "1997-07-04", loai_hop_dong: "CHINH_THUC", hop_dong_het_han: "2027-04-30", vai_tro: "STAFF" },
  { ho_ten: "Cao Minh Nhật",        email: "nv15@nongsan.vn", cccd: "079099010015", phone: "0901001015", chuc_vu: "Tổ trưởng KH",      bo_phan: "Kiểm Hàng",    luong: 35000, ngay_sinh: "1989-12-22", loai_hop_dong: "CHINH_THUC", hop_dong_het_han: "2027-12-21", vai_tro: "STAFF" },
  { ho_ten: "Phan Thị Ngọc",        email: "nv16@nongsan.vn", cccd: "079099010016", phone: "0901001016", chuc_vu: "NV kiểm hàng",      bo_phan: "Kiểm Hàng",    luong: 29000, ngay_sinh: "1998-02-09", loai_hop_dong: "PART_TIME",   hop_dong_het_han: "2026-07-31", vai_tro: "STAFF" },
  { ho_ten: "Trịnh Văn Lộc",        email: "nv17@nongsan.vn", cccd: "079099010017", phone: "0901001017", chuc_vu: "NV kiểm hàng",      bo_phan: "Kiểm Hàng",    luong: 30000, ngay_sinh: "1993-05-13", loai_hop_dong: "CHINH_THUC", hop_dong_het_han: "2026-08-12", vai_tro: "STAFF" },

  // Nhân viên đóng gói (7 người)
  { ho_ten: "Võ Thị Kim Chi",       email: "nv18@nongsan.vn", cccd: "079099010018", phone: "0901001018", chuc_vu: "NV đóng gói",       bo_phan: "Đóng Gói",     luong: 26000, ngay_sinh: "1996-11-28", loai_hop_dong: "CHINH_THUC", hop_dong_het_han: "2027-06-30", vai_tro: "STAFF" },
  { ho_ten: "Hồ Văn Tài",           email: "nv19@nongsan.vn", cccd: "079099010019", phone: "0901001019", chuc_vu: "NV đóng gói",       bo_phan: "Đóng Gói",     luong: 26000, ngay_sinh: "1999-08-17", loai_hop_dong: "CHINH_THUC", hop_dong_het_han: "2026-12-15", vai_tro: "STAFF" },
  { ho_ten: "Lê Thị Mỹ Duyên",     email: "nv20@nongsan.vn", cccd: "079099010020", phone: "0901001020", chuc_vu: "Tổ trưởng ĐG",      bo_phan: "Đóng Gói",     luong: 32000, ngay_sinh: "1990-04-02", loai_hop_dong: "CHINH_THUC", hop_dong_het_han: "2028-03-31", vai_tro: "STAFF" },
  { ho_ten: "Nguyễn Thành Long",    email: "nv21@nongsan.vn", cccd: "079099010021", phone: "0901001021", chuc_vu: "NV đóng gói",       bo_phan: "Đóng Gói",     luong: 26000, ngay_sinh: "2001-01-20", loai_hop_dong: "THU_VIEC",   hop_dong_het_han: "2026-06-19", vai_tro: "STAFF" },
  { ho_ten: "Phan Văn Quân",        email: "nv22@nongsan.vn", cccd: "079099010022", phone: "0901001022", chuc_vu: "NV đóng gói",       bo_phan: "Đóng Gói",     luong: 26000, ngay_sinh: "1997-09-05", loai_hop_dong: "CHINH_THUC", hop_dong_het_han: "2026-09-04", vai_tro: "STAFF" },
  { ho_ten: "Đỗ Thị Hồng",          email: "nv23@nongsan.vn", cccd: "079099010023", phone: "0901001023", chuc_vu: "NV đóng gói",       bo_phan: "Đóng Gói",     luong: 25000, ngay_sinh: "2000-03-30", loai_hop_dong: "PART_TIME",   hop_dong_het_han: "2026-08-29", vai_tro: "STAFF" },
  { ho_ten: "Chu Văn Sơn",          email: "nv24@nongsan.vn", cccd: "079099010024", phone: "0901001024", chuc_vu: "NV đóng gói",       bo_phan: "Đóng Gói",     luong: 26000, ngay_sinh: "1996-06-14", loai_hop_dong: "CHINH_THUC", hop_dong_het_han: "2027-03-13", vai_tro: "STAFF" },

  // Nhân viên xuất kho / giao hàng (6 người)
  { ho_ten: "Lê Văn Hải",           email: "nv25@nongsan.vn", cccd: "079099010025", phone: "0901001025", chuc_vu: "NV xuất kho",       bo_phan: "Xuất Kho",     luong: 29000, ngay_sinh: "1994-07-23", loai_hop_dong: "CHINH_THUC", hop_dong_het_han: "2027-01-22", vai_tro: "STAFF" },
  { ho_ten: "Trần Thị Thu Thủy",    email: "nv26@nongsan.vn", cccd: "079099010026", phone: "0901001026", chuc_vu: "NV xuất kho",       bo_phan: "Xuất Kho",     luong: 29000, ngay_sinh: "1995-10-08", loai_hop_dong: "CHINH_THUC", hop_dong_het_han: "2026-10-07", vai_tro: "STAFF" },
  { ho_ten: "Huỳnh Văn Toản",       email: "nv27@nongsan.vn", cccd: "079099010027", phone: "0901001027", chuc_vu: "Tổ trưởng XK",      bo_phan: "Xuất Kho",     luong: 34000, ngay_sinh: "1988-02-17", loai_hop_dong: "CHINH_THUC", hop_dong_het_han: "2027-08-16", vai_tro: "STAFF" },
  { ho_ten: "Nguyễn Văn Tứ",        email: "nv28@nongsan.vn", cccd: "079099010028", phone: "0901001028", chuc_vu: "NV xuất kho",       bo_phan: "Xuất Kho",     luong: 28000, ngay_sinh: "1998-05-11", loai_hop_dong: "CHINH_THUC", hop_dong_het_han: "2026-11-10", vai_tro: "STAFF" },
  { ho_ten: "Kiều Thị Mai",          email: "nv29@nongsan.vn", cccd: "079099010029", phone: "0901001029", chuc_vu: "NV xuất kho",       bo_phan: "Xuất Kho",     luong: 28000, ngay_sinh: "1999-12-26", loai_hop_dong: "PART_TIME",   hop_dong_het_han: "2026-06-25", vai_tro: "STAFF" },
  { ho_ten: "Tô Văn Nghĩa",          email: "nv30@nongsan.vn", cccd: "079099010030", phone: "0901001030", chuc_vu: "NV xuất kho",       bo_phan: "Xuất Kho",     luong: 28000, ngay_sinh: "1997-08-31", loai_hop_dong: "CHINH_THUC", hop_dong_het_han: "2027-09-30", vai_tro: "STAFF" },
];

// Ngày vào làm ngẫu nhiên trong 2-3 năm trước
const NGAY_VAO_LAM = [
  "2022-01-10","2022-03-01","2022-06-15","2022-09-01","2023-01-15",
  "2023-04-01","2023-07-10","2023-10-01","2024-01-08","2024-03-20",
  "2024-06-01","2024-09-15","2025-01-06","2025-03-01","2025-06-02",
  "2025-09-01","2025-11-01","2026-01-15","2026-02-01","2026-03-10",
];

async function main() {
  console.log("🧹 Dọn dẹp dữ liệu HR cũ...");

  // Xóa theo thứ tự phụ thuộc
  await prisma.don_xin_nghi.deleteMany();
  await prisma.lich_su_cham_cong.deleteMany();
  await prisma.lich_phan_cong_ca.deleteMany();
  await prisma.ca_lam_viec.deleteMany();

  // Xóa 30 nhân viên cũ theo email pattern nv01..nv30
  const emails = NHAN_VIEN_DATA.map((nv) => nv.email);
  const oldUsers = await prisma.nguoi_dung.findMany({ where: { email: { in: emails } }, select: { id: true } });
  const oldIds = oldUsers.map((u) => u.id);
  if (oldIds.length > 0) {
    await prisma.ho_so_nguoi_dung.deleteMany({ where: { ma_nguoi_dung: { in: oldIds } } });
    await prisma.vai_tro_nguoi_dung.deleteMany({ where: { ma_nguoi_dung: { in: oldIds } } });
    await prisma.nguoi_dung.deleteMany({ where: { id: { in: oldIds } } });
  }

  console.log("🏗️  Tạo 3 ca làm việc...");
  const password = await bcrypt.hash("123456", 10);

  const caSang = await prisma.ca_lam_viec.create({
    data: { ten_ca: "Ca Sáng", gio_bat_dau: new Date("1970-01-01T06:00:00.000Z"), gio_ket_thuc: new Date("1970-01-01T14:00:00.000Z") },
  });
  const caChieu = await prisma.ca_lam_viec.create({
    data: { ten_ca: "Ca Chiều", gio_bat_dau: new Date("1970-01-01T14:00:00.000Z"), gio_ket_thuc: new Date("1970-01-01T22:00:00.000Z") },
  });
  const caToi = await prisma.ca_lam_viec.create({
    data: { ten_ca: "Ca Tối", gio_bat_dau: new Date("1970-01-01T22:00:00.000Z"), gio_ket_thuc: new Date("1970-01-02T06:00:00.000Z") },
  });
  const cacCa = [caSang, caChieu, caToi];

  console.log("👥 Tạo 30 nhân viên...");

  // Đảm bảo roles tồn tại
  const staffRole = await prisma.vai_tro.upsert({ where: { ten_vai_tro: "STAFF" }, create: { ten_vai_tro: "STAFF", mo_ta: "Nhân viên vận hành" }, update: {} });
  const thuKhoRole = await prisma.vai_tro.upsert({ where: { ten_vai_tro: "THU_KHO" }, create: { ten_vai_tro: "THU_KHO", mo_ta: "Thủ kho" }, update: {} });
  const roleMap: Record<string, number> = { STAFF: staffRole.id, THU_KHO: thuKhoRole.id };

  const userIds: number[] = [];

  for (let i = 0; i < NHAN_VIEN_DATA.length; i++) {
    const nv = NHAN_VIEN_DATA[i];
    const user = await prisma.nguoi_dung.create({
      data: { email: nv.email, mat_khau: password, trang_thai: 1 },
    });

    await prisma.ho_so_nguoi_dung.create({
      data: {
        ma_nguoi_dung: user.id,
        ho_ten: nv.ho_ten,
        so_dien_thoai: nv.phone,
        cccd: nv.cccd,
        chuc_vu: nv.chuc_vu,
        bo_phan: nv.bo_phan,
        luong_theo_gio: nv.luong,
        loai_hop_dong: nv.loai_hop_dong,
        hop_dong_het_han: new Date(nv.hop_dong_het_han),
        ngay_vao_lam: new Date(NGAY_VAO_LAM[i % NGAY_VAO_LAM.length]),
        ngay_sinh: new Date(nv.ngay_sinh),
        gioi_tinh: i % 3 === 1 ? "Nữ" : "Nam",
      },
    });

    await prisma.vai_tro_nguoi_dung.create({
      data: { ma_nguoi_dung: user.id, ma_vai_tro: roleMap[nv.vai_tro] },
    });

    userIds.push(user.id);
    process.stdout.write(`   ✓ ${nv.ho_ten}\n`);
  }

  // ─── Phân chia nhân viên theo ca cố định (xoay vòng đều) ───────────────────
  // 30 NV → 3 nhóm × 10 người, xoay ca theo tuần (mỗi 7 ngày đổi ca)
  // Nhóm A (nv 0-9):  tuần 1 → Ca Sáng, tuần 2 → Ca Chiều, tuần 3 → Ca Tối
  // Nhóm B (nv 10-19): tuần 1 → Ca Chiều, tuần 2 → Ca Tối, tuần 3 → Ca Sáng
  // Nhóm C (nv 20-29): tuần 1 → Ca Tối, tuần 2 → Ca Sáng, tuần 3 → Ca Chiều
  const nhomA = userIds.slice(0, 10);
  const nhomB = userIds.slice(10, 20);
  const nhomC = userIds.slice(20, 30);

  console.log("\n📅 Phân ca 30 ngày tới (bắt đầu từ hôm nay)...");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lichPhanCongData: { ma_nguoi_dung: number; ma_ca_lam: number; ngay_lam_viec: Date }[] = [];

  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    const ngay = new Date(today);
    ngay.setDate(today.getDate() + dayOffset);

    const tuan = Math.floor(dayOffset / 7); // 0..4

    // Xoay ca: (base + tuần) % 3
    const caChoNhomA = cacCa[(0 + tuan) % 3];
    const caChoNhomB = cacCa[(1 + tuan) % 3];
    const caChoNhomC = cacCa[(2 + tuan) % 3];

    for (const uid of nhomA) lichPhanCongData.push({ ma_nguoi_dung: uid, ma_ca_lam: caChoNhomA.id, ngay_lam_viec: ngay });
    for (const uid of nhomB) lichPhanCongData.push({ ma_nguoi_dung: uid, ma_ca_lam: caChoNhomB.id, ngay_lam_viec: ngay });
    for (const uid of nhomC) lichPhanCongData.push({ ma_nguoi_dung: uid, ma_ca_lam: caChoNhomC.id, ngay_lam_viec: ngay });
  }

  await prisma.lich_phan_cong_ca.createMany({ data: lichPhanCongData });
  console.log(`   ✓ Đã tạo ${lichPhanCongData.length} lịch phân công`);

  // ─── Chấm công lịch sử: 29 ngày qua + hôm nay ─────────────────────────────
  console.log("\n🕐 Tạo lịch sử chấm công 30 ngày qua...");

  // Cũng làm lịch sử 29 ngày trước, dùng cùng pattern xoay ca
  const lichSuChamCongData: {
    ma_nguoi_dung: number;
    ma_ca_lam: number;
    gio_vao: Date;
    gio_ra: Date | null;
    trang_thai: string;
    so_phut_tre: number;
  }[] = [];

  // Ca sáng bắt đầu 6h, Ca chiều 14h, Ca tối 22h
  const CA_GIO_BAT_DAU: Record<number, { h: number; m: number }> = {
    [caSang.id]:  { h: 6,  m: 0 },
    [caChieu.id]: { h: 14, m: 0 },
    [caToi.id]:   { h: 22, m: 0 },
  };
  const CA_GIO_KET_THUC: Record<number, { h: number; m: number }> = {
    [caSang.id]:  { h: 14, m: 0 },
    [caChieu.id]: { h: 22, m: 0 },
    [caToi.id]:   { h: 6,  m: 0 }, // qua đêm
  };

  // Xác suất phân bố cho từng ngày quá khứ
  function randomTrangThai(nvIndex: number, dayOffset: number): "DUNG_GIO" | "DI_TRE" | "VANG" {
    // NV trưởng ca (index 0, 9, 14, 19, 24, 26) → chuyên cần cao
    const isTruong = [0, 9, 14, 19, 24, 26].includes(nvIndex);
    const seed = (nvIndex * 31 + dayOffset * 7) % 100;
    if (isTruong) {
      if (seed < 88) return "DUNG_GIO";
      if (seed < 96) return "DI_TRE";
      return "VANG";
    }
    if (seed < 72) return "DUNG_GIO";
    if (seed < 88) return "DI_TRE";
    return "VANG";
  }

  const nowHour = new Date().getHours();

  for (let dayOffset = -29; dayOffset <= 0; dayOffset++) {
    const ngay = new Date(today);
    ngay.setDate(today.getDate() + dayOffset);

    const tuan = Math.floor((dayOffset + 29) / 7);

    for (let nvIdx = 0; nvIdx < userIds.length; nvIdx++) {
      const uid = userIds[nvIdx];
      const nhom = nvIdx < 10 ? 0 : nvIdx < 20 ? 1 : 2;
      const caId = cacCa[(nhom + tuan) % 3].id;
      const batDau = CA_GIO_BAT_DAU[caId];
      const ketThuc = CA_GIO_KET_THUC[caId];

      const trangThai = randomTrangThai(nvIdx, Math.abs(dayOffset));
      if (trangThai === "VANG") continue;

      // Hôm nay: chỉ chấm công cho ca đã bắt đầu
      if (dayOffset === 0) {
        const caStartHour = batDau.h;
        // Ca tối bắt đầu 22h, nếu giờ hiện tại < 22 thì bỏ qua
        if (caStartHour > nowHour && !(caId === caToi.id && nowHour < 6)) continue;
      }

      const phutTre = trangThai === "DI_TRE" ? 5 + ((nvIdx * 3 + Math.abs(dayOffset) * 7) % 40) : 0;

      // Gio vào
      const gioVao = new Date(ngay);
      gioVao.setHours(batDau.h, batDau.m + phutTre, Math.floor(Math.random() * 59), 0);

      // Ca tối (22h-6h sáng hôm sau): gio vào là ngày hôm đó lúc 22h
      // Ca tối không adjust ngày

      // Gio ra
      let gioRa: Date | null = null;
      // Hôm nay và ca chưa kết thúc → chưa ra
      if (dayOffset === 0) {
        const caEndHour = ketThuc.h;
        // Ca tối kết thúc 6h sáng hôm sau → luôn chưa ra nếu hôm nay
        if (caId === caToi.id) {
          gioRa = null;
        } else if (nowHour < caEndHour) {
          gioVao.setHours(batDau.h, batDau.m + phutTre, 20, 0); // đã vào ca
          gioRa = null;
        } else {
          gioRa = new Date(ngay);
          gioRa.setHours(ketThuc.h, ketThuc.m - Math.floor(Math.random() * 10), 0, 0);
        }
      } else {
        // Ngày quá khứ: luôn có gio ra
        if (caId === caToi.id) {
          // Ca tối kết thúc ngày hôm sau
          gioRa = new Date(ngay);
          gioRa.setDate(gioRa.getDate() + 1);
          gioRa.setHours(6, Math.floor(Math.random() * 5), 0, 0);
        } else {
          gioRa = new Date(ngay);
          gioRa.setHours(ketThuc.h, ketThuc.m - Math.floor(Math.random() * 10), 0, 0);
        }
      }

      lichSuChamCongData.push({
        ma_nguoi_dung: uid,
        ma_ca_lam: caId,
        gio_vao: gioVao,
        gio_ra: gioRa,
        trang_thai: trangThai === "DI_TRE" ? "DI_TRE" : "DUNG_GIO",
        so_phut_tre: phutTre,
      });
    }
  }

  // Insert theo batch để tránh timeout
  const BATCH = 200;
  for (let i = 0; i < lichSuChamCongData.length; i += BATCH) {
    await prisma.lich_su_cham_cong.createMany({ data: lichSuChamCongData.slice(i, i + BATCH) });
  }
  console.log(`   ✓ Đã tạo ${lichSuChamCongData.length} bản ghi chấm công`);

  // ─── Đơn xin nghỉ mẫu ──────────────────────────────────────────────────────
  console.log("\n📋 Tạo đơn xin nghỉ mẫu...");

  const donNghiData = [
    // Chờ duyệt
    { uid: userIds[3],  loai: "PHEP_NAM",       start: addDays(today, 3),  end: addDays(today, 4),  ly_do: "Về quê thăm gia đình", trang_thai: "CHO_DUYET" },
    { uid: userIds[7],  loai: "NGHI_BENH",       start: addDays(today, 1),  end: addDays(today, 2),  ly_do: "Đau dạ dày, có giấy bệnh viện", trang_thai: "CHO_DUYET" },
    { uid: userIds[15], loai: "VIEC_RIENG",       start: addDays(today, 5),  end: addDays(today, 5),  ly_do: "Đăng ký xe máy", trang_thai: "CHO_DUYET" },
    { uid: userIds[22], loai: "PHEP_NAM",         start: addDays(today, 7),  end: addDays(today, 9),  ly_do: "Nghỉ lễ gia đình", trang_thai: "CHO_DUYET" },
    // Đã duyệt
    { uid: userIds[1],  loai: "NGHI_BENH",       start: addDays(today, -5), end: addDays(today, -4), ly_do: "Sốt cao, nghỉ 2 ngày", trang_thai: "DA_DUYET" },
    { uid: userIds[10], loai: "PHEP_NAM",         start: addDays(today, -3), end: addDays(today, -2), ly_do: "Cưới anh trai", trang_thai: "DA_DUYET" },
    { uid: userIds[18], loai: "VIEC_RIENG",       start: addDays(today, -7), end: addDays(today, -7), ly_do: "Khám sức khỏe định kỳ", trang_thai: "DA_DUYET" },
    // Từ chối
    { uid: userIds[5],  loai: "NGHI_KHONG_LUONG", start: addDays(today, -1), end: addDays(today, 1),  ly_do: "Muốn đi du lịch", trang_thai: "TU_CHOI" },
  ];

  for (const d of donNghiData) {
    await prisma.don_xin_nghi.create({
      data: {
        ma_nguoi_dung: d.uid,
        loai_nghi: d.loai,
        ngay_bat_dau: d.start,
        ngay_ket_thuc: d.end,
        ly_do: d.ly_do,
        trang_thai: d.trang_thai,
        ngay_tao: addDays(d.start, -3),
      },
    });
  }
  console.log(`   ✓ Đã tạo ${donNghiData.length} đơn xin nghỉ`);

  console.log("\n✅ SEED HR HOÀN THÀNH!");
  console.log(`   • 30 nhân viên (3 thủ kho + 27 staff)`);
  console.log(`   • 3 ca làm việc (Sáng 6-14h / Chiều 14-22h / Tối 22-6h)`);
  console.log(`   • ${lichPhanCongData.length} lịch phân công (30 ngày tới)`);
  console.log(`   • ${lichSuChamCongData.length} bản ghi chấm công (30 ngày qua)`);
  console.log(`   • ${donNghiData.length} đơn xin nghỉ mẫu`);
  console.log(`   • Tài khoản: nv01@nongsan.vn ... nv30@nongsan.vn / 123456`);
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
