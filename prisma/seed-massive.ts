/**
 * SEED KHỔNG LỒ - Đổ full data cho toàn bộ hệ thống
 * Chạy: npx ts-node -P tsconfig.seed.json prisma/seed-massive.ts
 */

import * as dotenv from 'dotenv';
dotenv.config();

import prisma from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function subtractDays(date: Date, days: number): Date {
  return addDays(date, -days);
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function createTime(hours: number, minutes: number): Date {
  const d = new Date('1970-01-01');
  d.setHours(hours, minutes, 0, 0);
  return d;
}

async function main() {
  console.log("🚀 Bắt đầu seed KHỔNG LỒ...\n");

  const password = await bcrypt.hash("123456", 10);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // ══════════════════════════════════════════════════════════════════
  // 0. XÓA TOÀN BỘ DỮ LIỆU CŨ
  // ══════════════════════════════════════════════════════════════════
  console.log("🧹 [0] Xóa dữ liệu cũ...");

  await prisma.nhiem_vu_kiem_dinh.deleteMany();
  await prisma.lich_su_nhan_hang.deleteMany();
  await prisma.anh_danh_gia.deleteMany();
  await prisma.chi_tiet_doi_tra.deleteMany();
  await prisma.lich_su_hoan_tien.deleteMany();
  await prisma.yeu_cau_doi_tra.deleteMany();
  await prisma.chi_tiet_gio_hang.deleteMany();
  await prisma.gio_hang.deleteMany();
  await prisma.san_pham_yeu_thich.deleteMany();
  await prisma.tin_nhan_chat_ai.deleteMany();
  await prisma.phien_chat_ai.deleteMany();
  await prisma.kien_hang_da_xuat.deleteMany();
  await prisma.chi_tiet_luan_chuyen_kho.deleteMany();
  await prisma.chi_tiet_phieu_xuat.deleteMany();
  await prisma.chi_tiet_phieu_nhap.deleteMany();
  await prisma.danh_gia_giao_hang_ncc.deleteMany();
  await prisma.phieu_xuat_kho.deleteMany();
  await prisma.phieu_nhap_kho.deleteMany();
  await prisma.phieu_kiem_ke_kho.deleteMany();
  await prisma.phieu_tra_nha_cung_cap.deleteMany();
  await prisma.canh_bao_lo_hang.deleteMany();
  await prisma.ton_kho_tong.deleteMany();
  await prisma.kien_hang_chi_tiet.deleteMany();
  await prisma.lo_hang.deleteMany();
  await prisma.vi_tri_kho.deleteMany();
  await prisma.kho_hang.deleteMany();
  await prisma.don_van_chuyen.deleteMany();
  await prisma.doi_tac_van_chuyen.deleteMany();
  await prisma.giao_dich_thanh_toan.deleteMany();
  await prisma.lich_su_don_hang.deleteMany();
  await prisma.nhiem_vu_cong_viec.deleteMany();
  await prisma.chi_tiet_don_hang.deleteMany();
  await prisma.don_hang.deleteMany();
  await prisma.ma_giam_gia.deleteMany();
  await prisma.phuong_thuc_thanh_toan.deleteMany();
  await prisma.danh_gia_san_pham.deleteMany();
  await prisma.the_san_pham.deleteMany();
  await prisma.the_tu_khoa.deleteMany();
  await prisma.chung_chi_san_pham.deleteMany();
  await prisma.anh_san_pham.deleteMany();
  await prisma.ncc_san_pham.deleteMany();
  await prisma.cong_no_ncc.deleteMany();
  await prisma.lich_dat_hang_ncc.deleteMany();
  await prisma.hop_dong_ncc.deleteMany();
  await prisma.bien_the_san_pham.deleteMany();
  await prisma.san_pham.deleteMany();
  await prisma.danh_muc.deleteMany();
  await prisma.nha_cung_cap.deleteMany();
  await prisma.banner_quang_cao.deleteMany();
  await prisma.thong_bao.deleteMany();
  await prisma.kho_tri_thuc_ai.deleteMany();
  await prisma.quan_ly_file_tai_len.deleteMany();
  await prisma.lich_su_dang_nhap.deleteMany();
  await prisma.bang_luong_thang.deleteMany();
  await prisma.don_xin_nghi.deleteMany();
  await prisma.lich_su_cham_cong.deleteMany();
  await prisma.lich_phan_cong_ca.deleteMany();
  await prisma.ca_lam_viec.deleteMany();
  await prisma.chi_tiet_phan_quyen.deleteMany();
  await prisma.chuc_nang_he_thong.deleteMany();
  await prisma.phan_he_he_thong.deleteMany();
  await prisma.quyen_han.deleteMany();
  await prisma.vai_tro_nguoi_dung.deleteMany();
  await prisma.vai_tro.deleteMany();
  await prisma.du_lieu_khuon_mat.deleteMany();
  await prisma.dia_chi_nguoi_dung.deleteMany();
  await prisma.ho_so_nguoi_dung.deleteMany();
  await prisma.nguoi_dung.deleteMany();
  await prisma.ma_otp.deleteMany();

  console.log("   ✓ Đã xóa sạch");

  // ══════════════════════════════════════════════════════════════════
  // 1. PHÂN HỆ, CHỨC NĂNG, QUYỀN HẠN
  // ══════════════════════════════════════════════════════════════════
  console.log("⚙️  [1] Phân hệ, chức năng, quyền hạn...");

  const phanHeList = await Promise.all([
    prisma.phan_he_he_thong.create({ data: { ten_phan_he: "Quản lý sản phẩm", mo_ta: "CRUD sản phẩm, danh mục, biến thể" } }),
    prisma.phan_he_he_thong.create({ data: { ten_phan_he: "Quản lý kho", mo_ta: "Nhập/xuất/kiểm kê kho hàng" } }),
    prisma.phan_he_he_thong.create({ data: { ten_phan_he: "Quản lý đơn hàng", mo_ta: "Xử lý đơn hàng, vận chuyển" } }),
    prisma.phan_he_he_thong.create({ data: { ten_phan_he: "Quản lý nhân sự", mo_ta: "Chấm công, phân ca, lương" } }),
    prisma.phan_he_he_thong.create({ data: { ten_phan_he: "Quản lý tài chính", mo_ta: "Thanh toán, hoàn tiền, công nợ" } }),
    prisma.phan_he_he_thong.create({ data: { ten_phan_he: "Quản lý NCC", mo_ta: "Nhà cung cấp, hợp đồng, đánh giá" } }),
    prisma.phan_he_he_thong.create({ data: { ten_phan_he: "Báo cáo & Thống kê", mo_ta: "Dashboard, báo cáo doanh thu" } }),
  ]);

  const chucNangList = await Promise.all([
    prisma.chuc_nang_he_thong.create({ data: { ma_phan_he: phanHeList[0].id, ten_chuc_nang: "Quản lý sản phẩm" } }),
    prisma.chuc_nang_he_thong.create({ data: { ma_phan_he: phanHeList[0].id, ten_chuc_nang: "Quản lý danh mục" } }),
    prisma.chuc_nang_he_thong.create({ data: { ma_phan_he: phanHeList[1].id, ten_chuc_nang: "Phiếu nhập kho" } }),
    prisma.chuc_nang_he_thong.create({ data: { ma_phan_he: phanHeList[1].id, ten_chuc_nang: "Phiếu xuất kho" } }),
    prisma.chuc_nang_he_thong.create({ data: { ma_phan_he: phanHeList[1].id, ten_chuc_nang: "Kiểm kê kho" } }),
    prisma.chuc_nang_he_thong.create({ data: { ma_phan_he: phanHeList[2].id, ten_chuc_nang: "Xử lý đơn hàng" } }),
    prisma.chuc_nang_he_thong.create({ data: { ma_phan_he: phanHeList[2].id, ten_chuc_nang: "Quản lý vận chuyển" } }),
    prisma.chuc_nang_he_thong.create({ data: { ma_phan_he: phanHeList[3].id, ten_chuc_nang: "Chấm công" } }),
    prisma.chuc_nang_he_thong.create({ data: { ma_phan_he: phanHeList[3].id, ten_chuc_nang: "Phân ca làm việc" } }),
    prisma.chuc_nang_he_thong.create({ data: { ma_phan_he: phanHeList[3].id, ten_chuc_nang: "Quản lý lương" } }),
    prisma.chuc_nang_he_thong.create({ data: { ma_phan_he: phanHeList[4].id, ten_chuc_nang: "Thanh toán" } }),
    prisma.chuc_nang_he_thong.create({ data: { ma_phan_he: phanHeList[4].id, ten_chuc_nang: "Hoàn tiền" } }),
    prisma.chuc_nang_he_thong.create({ data: { ma_phan_he: phanHeList[5].id, ten_chuc_nang: "Quản lý NCC" } }),
    prisma.chuc_nang_he_thong.create({ data: { ma_phan_he: phanHeList[6].id, ten_chuc_nang: "Xem báo cáo" } }),
  ]);

  const quyenHanList = await Promise.all([
    prisma.quyen_han.create({ data: { ma_quyen: "XEM", ten_quyen: "Xem" } }),
    prisma.quyen_han.create({ data: { ma_quyen: "THEM", ten_quyen: "Thêm mới" } }),
    prisma.quyen_han.create({ data: { ma_quyen: "SUA", ten_quyen: "Sửa" } }),
    prisma.quyen_han.create({ data: { ma_quyen: "XOA", ten_quyen: "Xóa" } }),
    prisma.quyen_han.create({ data: { ma_quyen: "DUYET", ten_quyen: "Duyệt" } }),
  ]);

  // Vai trò
  const adminRole = await prisma.vai_tro.create({ data: { ten_vai_tro: "ADMIN", mo_ta: "Quản trị viên toàn quyền" } });
  const staffRole = await prisma.vai_tro.create({ data: { ten_vai_tro: "STAFF", mo_ta: "Nhân viên vận hành" } });
  const thuKhoRole = await prisma.vai_tro.create({ data: { ten_vai_tro: "THU_KHO", mo_ta: "Thủ kho" } });
  const khachHangRole = await prisma.vai_tro.create({ data: { ten_vai_tro: "KHACH_HANG", mo_ta: "Khách hàng" } });
  const keToanRole = await prisma.vai_tro.create({ data: { ten_vai_tro: "KE_TOAN", mo_ta: "Kế toán" } });
  const quanLyRole = await prisma.vai_tro.create({ data: { ten_vai_tro: "QUAN_LY", mo_ta: "Quản lý" } });

  // Admin full quyền
  for (const cn of chucNangList) {
    for (const q of quyenHanList) {
      await prisma.chi_tiet_phan_quyen.create({ data: { ma_vai_tro: adminRole.id, ma_chuc_nang: cn.id, ma_quyen: q.id } });
    }
  }
  // Staff: XEM + THEM
  for (const cn of chucNangList) {
    await prisma.chi_tiet_phan_quyen.create({ data: { ma_vai_tro: staffRole.id, ma_chuc_nang: cn.id, ma_quyen: quyenHanList[0].id } });
    await prisma.chi_tiet_phan_quyen.create({ data: { ma_vai_tro: staffRole.id, ma_chuc_nang: cn.id, ma_quyen: quyenHanList[1].id } });
  }
  // Thu kho: full quyền kho
  for (const cn of chucNangList.filter((_, i) => i >= 2 && i <= 4)) {
    for (const q of quyenHanList) {
      await prisma.chi_tiet_phan_quyen.create({ data: { ma_vai_tro: thuKhoRole.id, ma_chuc_nang: cn.id, ma_quyen: q.id } });
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // 2. NGƯỜI DÙNG (20 người)
  // ══════════════════════════════════════════════════════════════════
  console.log("👥 [2] Tạo 20 người dùng...");

  const users: any[] = [];
  const userDataList = [
    { email: "admin@nongsan.vn", hoTen: "Nguyễn Văn Admin", chucVu: "Quản Trị Viên", boPhan: "Ban Giám Đốc", sdt: "0900000001", cccd: "079000000001", gioiTinh: "Nam", ngaySinh: "1985-05-20", ngayVaoLam: "2020-01-01", loaiHD: "CHINH_THUC", hetHan: "2030-12-31", luong: 120000, role: adminRole.id },
    { email: "admin2@nongsan.vn", hoTen: "Trần Thị Phương", chucVu: "Phó Giám Đốc", boPhan: "Ban Giám Đốc", sdt: "0900000002", cccd: "079000000002", gioiTinh: "Nữ", ngaySinh: "1987-03-15", ngayVaoLam: "2020-06-01", loaiHD: "CHINH_THUC", hetHan: "2030-12-31", luong: 110000, role: adminRole.id },
    { email: "staff.kho@nongsan.vn", hoTen: "Lê Minh Đức", chucVu: "Nhân Viên Kho", boPhan: "Kho Vận", sdt: "0900000003", cccd: "079000000003", gioiTinh: "Nam", ngaySinh: "1992-08-15", ngayVaoLam: "2023-03-01", loaiHD: "CHINH_THUC", hetHan: "2027-03-01", luong: 38000, role: staffRole.id },
    { email: "staff.banhang@nongsan.vn", hoTen: "Phạm Thị Hoa", chucVu: "Nhân Viên Bán Hàng", boPhan: "Kinh Doanh", sdt: "0900000004", cccd: "079000000004", gioiTinh: "Nữ", ngaySinh: "1994-11-20", ngayVaoLam: "2023-06-15", loaiHD: "CHINH_THUC", hetHan: "2027-06-15", luong: 35000, role: staffRole.id },
    { email: "staff.giaohang@nongsan.vn", hoTen: "Võ Văn Tùng", chucVu: "Nhân Viên Giao Hàng", boPhan: "Giao Vận", sdt: "0900000005", cccd: "079000000005", gioiTinh: "Nam", ngaySinh: "1996-02-28", ngayVaoLam: "2024-01-10", loaiHD: "THU_VIEC", hetHan: "2025-07-10", luong: 30000, role: staffRole.id },
    { email: "ketoan@nongsan.vn", hoTen: "Nguyễn Thị Lan Anh", chucVu: "Kế Toán", boPhan: "Tài Chính", sdt: "0900000006", cccd: "079000000006", gioiTinh: "Nữ", ngaySinh: "1990-07-10", ngayVaoLam: "2022-09-01", loaiHD: "CHINH_THUC", hetHan: "2028-09-01", luong: 50000, role: keToanRole.id },
    { email: "thukho1@nongsan.vn", hoTen: "Trần Văn Bảo", chucVu: "Thủ Kho", boPhan: "Kho Vận", sdt: "0900000007", cccd: "079000000007", gioiTinh: "Nam", ngaySinh: "1988-12-01", ngayVaoLam: "2022-06-01", loaiHD: "CHINH_THUC", hetHan: "2028-06-01", luong: 45000, role: thuKhoRole.id },
    { email: "thukho2@nongsan.vn", hoTen: "Đặng Thị Ngọc", chucVu: "Thủ Kho", boPhan: "Kho Vận", sdt: "0900000008", cccd: "079000000008", gioiTinh: "Nữ", ngaySinh: "1991-04-18", ngayVaoLam: "2023-01-15", loaiHD: "CHINH_THUC", hetHan: "2028-01-15", luong: 42000, role: thuKhoRole.id },
    // Khách hàng
    { email: "hong.le@gmail.com", hoTen: "Lê Thị Hồng", chucVu: null, boPhan: null, sdt: "0911111111", cccd: null, gioiTinh: "Nữ", ngaySinh: "1995-03-10", ngayVaoLam: null, loaiHD: null, hetHan: null, luong: null, role: khachHangRole.id },
    { email: "tuan.pham@gmail.com", hoTen: "Phạm Minh Tuấn", chucVu: null, boPhan: null, sdt: "0922222222", cccd: null, gioiTinh: "Nam", ngaySinh: "1990-07-25", ngayVaoLam: null, loaiHD: null, hetHan: null, luong: null, role: khachHangRole.id },
    { email: "lan.vo@gmail.com", hoTen: "Võ Thị Mai Lan", chucVu: null, boPhan: null, sdt: "0933333333", cccd: null, gioiTinh: "Nữ", ngaySinh: "1998-11-05", ngayVaoLam: null, loaiHD: null, hetHan: null, luong: null, role: khachHangRole.id },
    { email: "nam.nguyen@gmail.com", hoTen: "Nguyễn Hoàng Nam", chucVu: null, boPhan: null, sdt: "0944444444", cccd: null, gioiTinh: "Nam", ngaySinh: "1993-01-22", ngayVaoLam: null, loaiHD: null, hetHan: null, luong: null, role: khachHangRole.id },
    { email: "thao.tran@gmail.com", hoTen: "Trần Phương Thảo", chucVu: null, boPhan: null, sdt: "0955555555", cccd: null, gioiTinh: "Nữ", ngaySinh: "1997-06-14", ngayVaoLam: null, loaiHD: null, hetHan: null, luong: null, role: khachHangRole.id },
    { email: "duc.hoang@gmail.com", hoTen: "Hoàng Văn Đức", chucVu: null, boPhan: null, sdt: "0966666666", cccd: null, gioiTinh: "Nam", ngaySinh: "1985-09-30", ngayVaoLam: null, loaiHD: null, hetHan: null, luong: null, role: khachHangRole.id },
    { email: "mai.dang@gmail.com", hoTen: "Đặng Thị Mai", chucVu: null, boPhan: null, sdt: "0977777777", cccd: null, gioiTinh: "Nữ", ngaySinh: "2000-02-14", ngayVaoLam: null, loaiHD: null, hetHan: null, luong: null, role: khachHangRole.id },
    { email: "hieu.ly@gmail.com", hoTen: "Lý Quốc Hiếu", chucVu: null, boPhan: null, sdt: "0988888888", cccd: null, gioiTinh: "Nam", ngaySinh: "1988-12-25", ngayVaoLam: null, loaiHD: null, hetHan: null, luong: null, role: khachHangRole.id },
    { email: "yen.bui@gmail.com", hoTen: "Bùi Thanh Yến", chucVu: null, boPhan: null, sdt: "0912345678", cccd: null, gioiTinh: "Nữ", ngaySinh: "1996-08-08", ngayVaoLam: null, loaiHD: null, hetHan: null, luong: null, role: khachHangRole.id },
    { email: "khoa.do@gmail.com", hoTen: "Đỗ Anh Khoa", chucVu: null, boPhan: null, sdt: "0923456789", cccd: null, gioiTinh: "Nam", ngaySinh: "1992-04-17", ngayVaoLam: null, loaiHD: null, hetHan: null, luong: null, role: khachHangRole.id },
    { email: "linh.ngo@gmail.com", hoTen: "Ngô Khánh Linh", chucVu: null, boPhan: null, sdt: "0934567890", cccd: null, gioiTinh: "Nữ", ngaySinh: "1999-10-30", ngayVaoLam: null, loaiHD: null, hetHan: null, luong: null, role: khachHangRole.id },
    { email: "son.vu@gmail.com", hoTen: "Vũ Đình Sơn", chucVu: null, boPhan: null, sdt: "0945678901", cccd: null, gioiTinh: "Nam", ngaySinh: "1987-05-12", ngayVaoLam: null, loaiHD: null, hetHan: null, luong: null, role: khachHangRole.id },
  ];

  for (const u of userDataList) {
    const user = await prisma.nguoi_dung.create({ data: { email: u.email, mat_khau: password, trang_thai: 1 } });
    await prisma.ho_so_nguoi_dung.create({
      data: {
        ma_nguoi_dung: user.id,
        ho_ten: u.hoTen,
        so_dien_thoai: u.sdt,
        chuc_vu: u.chucVu,
        bo_phan: u.boPhan,
        cccd: u.cccd,
        gioi_tinh: u.gioiTinh,
        ngay_sinh: u.ngaySinh ? new Date(u.ngaySinh) : null,
        ngay_vao_lam: u.ngayVaoLam ? new Date(u.ngayVaoLam) : null,
        loai_hop_dong: u.loaiHD,
        hop_dong_het_han: u.hetHan ? new Date(u.hetHan) : null,
        luong_theo_gio: u.luong,
      },
    });
    await prisma.vai_tro_nguoi_dung.create({ data: { ma_nguoi_dung: user.id, ma_vai_tro: u.role } });
    users.push(user);
  }

  const [admin1, admin2, staffKho, staffBH, staffGH, ketoan, thukho1, thukho2, kh1, kh2, kh3, kh4, kh5, kh6, kh7, kh8, kh9, kh10, kh11, kh12] = users;

  // ══════════════════════════════════════════════════════════════════
  // 3. ĐỊA CHỈ NGƯỜI DÙNG
  // ══════════════════════════════════════════════════════════════════
  console.log("📍 [3] Địa chỉ người dùng...");

  await prisma.dia_chi_nguoi_dung.createMany({
    data: [
      { ma_nguoi_dung: kh1.id, ho_ten: "Lê Thị Hồng", so_dien_thoai: "0911111111", chi_tiet_dia_chi: "123 Nguyễn Huệ, P. Bến Nghé, Q.1", tinh_thanh: "Hồ Chí Minh", quan_huyen: "Quận 1", phuong_xa: "Phường Bến Nghé", ma_tinh_ghn: 202, ma_quan_huyen_ghn: 1442, ma_phuong_xa_ghn: "20305", la_mac_dinh: true },
      { ma_nguoi_dung: kh1.id, ho_ten: "Lê Thị Hồng", so_dien_thoai: "0911111111", chi_tiet_dia_chi: "456 Lê Lợi, P.6, Q.3", tinh_thanh: "Hồ Chí Minh", quan_huyen: "Quận 3", phuong_xa: "Phường 6", ma_tinh_ghn: 202, ma_quan_huyen_ghn: 1444, ma_phuong_xa_ghn: "20401", la_mac_dinh: false },
      { ma_nguoi_dung: kh2.id, ho_ten: "Phạm Minh Tuấn", so_dien_thoai: "0922222222", chi_tiet_dia_chi: "789 Trần Hưng Đạo, P. Cầu Kho, Q.1", tinh_thanh: "Hồ Chí Minh", quan_huyen: "Quận 1", phuong_xa: "Phường Cầu Kho", ma_tinh_ghn: 202, ma_quan_huyen_ghn: 1442, ma_phuong_xa_ghn: "20308", la_mac_dinh: true },
      { ma_nguoi_dung: kh2.id, ho_ten: "Phạm Minh Tuấn", so_dien_thoai: "0922222222", chi_tiet_dia_chi: "12 Phan Xích Long, P.2, Q. Phú Nhuận", tinh_thanh: "Hồ Chí Minh", quan_huyen: "Quận Phú Nhuận", phuong_xa: "Phường 2", ma_tinh_ghn: 202, ma_quan_huyen_ghn: 1462, ma_phuong_xa_ghn: "20901", la_mac_dinh: false },
      { ma_nguoi_dung: kh3.id, ho_ten: "Võ Thị Mai Lan", so_dien_thoai: "0933333333", chi_tiet_dia_chi: "12 Hải Phòng, P. Thạch Thang, Q. Hải Châu", tinh_thanh: "Đà Nẵng", quan_huyen: "Quận Hải Châu", phuong_xa: "Phường Thạch Thang", ma_tinh_ghn: 203, ma_quan_huyen_ghn: 1527, ma_phuong_xa_ghn: "40101", la_mac_dinh: true },
      { ma_nguoi_dung: kh4.id, ho_ten: "Nguyễn Hoàng Nam", so_dien_thoai: "0944444444", chi_tiet_dia_chi: "34 Lý Thường Kiệt, P. Hàng Bài, Q. Hoàn Kiếm", tinh_thanh: "Hà Nội", quan_huyen: "Quận Hoàn Kiếm", phuong_xa: "Phường Hàng Bài", ma_tinh_ghn: 201, ma_quan_huyen_ghn: 1482, ma_phuong_xa_ghn: "10101", la_mac_dinh: true },
      { ma_nguoi_dung: kh4.id, ho_ten: "Nguyễn Hoàng Nam", so_dien_thoai: "0944444444", chi_tiet_dia_chi: "56 Kim Mã, P. Kim Mã, Q. Ba Đình", tinh_thanh: "Hà Nội", quan_huyen: "Quận Ba Đình", phuong_xa: "Phường Kim Mã", ma_tinh_ghn: 201, ma_quan_huyen_ghn: 1484, ma_phuong_xa_ghn: "10201", la_mac_dinh: false },
      { ma_nguoi_dung: kh5.id, ho_ten: "Trần Phương Thảo", so_dien_thoai: "0955555555", chi_tiet_dia_chi: "78 Nguyễn Văn Cừ, P. An Hòa, Q. Ninh Kiều", tinh_thanh: "Cần Thơ", quan_huyen: "Quận Ninh Kiều", phuong_xa: "Phường An Hòa", ma_tinh_ghn: 204, ma_quan_huyen_ghn: 1560, ma_phuong_xa_ghn: "50101", la_mac_dinh: true },
      { ma_nguoi_dung: kh6.id, ho_ten: "Hoàng Văn Đức", so_dien_thoai: "0966666666", chi_tiet_dia_chi: "90 Lê Duẩn, P. Trường An, TP. Huế", tinh_thanh: "Thừa Thiên Huế", quan_huyen: "TP Huế", phuong_xa: "Phường Trường An", ma_tinh_ghn: 218, ma_quan_huyen_ghn: 1610, ma_phuong_xa_ghn: "30101", la_mac_dinh: true },
      { ma_nguoi_dung: kh7.id, ho_ten: "Đặng Thị Mai", so_dien_thoai: "0977777777", chi_tiet_dia_chi: "15 Trần Phú, P. Lộc Thọ, TP. Nha Trang", tinh_thanh: "Khánh Hòa", quan_huyen: "TP Nha Trang", phuong_xa: "Phường Lộc Thọ", ma_tinh_ghn: 207, ma_quan_huyen_ghn: 1580, ma_phuong_xa_ghn: "60101", la_mac_dinh: true },
      { ma_nguoi_dung: kh8.id, ho_ten: "Lý Quốc Hiếu", so_dien_thoai: "0988888888", chi_tiet_dia_chi: "22 Nguyễn Trãi, P. 3, TP. Vũng Tàu", tinh_thanh: "Bà Rịa - Vũng Tàu", quan_huyen: "TP Vũng Tàu", phuong_xa: "Phường 3", ma_tinh_ghn: 206, ma_quan_huyen_ghn: 1570, ma_phuong_xa_ghn: "70101", la_mac_dinh: true },
      { ma_nguoi_dung: kh9.id, ho_ten: "Bùi Thanh Yến", so_dien_thoai: "0912345678", chi_tiet_dia_chi: "45 Hai Bà Trưng, P. Tân Định, Q.1", tinh_thanh: "Hồ Chí Minh", quan_huyen: "Quận 1", phuong_xa: "Phường Tân Định", ma_tinh_ghn: 202, ma_quan_huyen_ghn: 1442, ma_phuong_xa_ghn: "20301", la_mac_dinh: true },
      { ma_nguoi_dung: kh10.id, ho_ten: "Đỗ Anh Khoa", so_dien_thoai: "0923456789", chi_tiet_dia_chi: "67 Võ Văn Tần, P.6, Q.3", tinh_thanh: "Hồ Chí Minh", quan_huyen: "Quận 3", phuong_xa: "Phường 6", ma_tinh_ghn: 202, ma_quan_huyen_ghn: 1444, ma_phuong_xa_ghn: "20401", la_mac_dinh: true },
      { ma_nguoi_dung: kh11.id, ho_ten: "Ngô Khánh Linh", so_dien_thoai: "0934567890", chi_tiet_dia_chi: "89 Cách Mạng Tháng 8, P.5, Q.Tân Bình", tinh_thanh: "Hồ Chí Minh", quan_huyen: "Quận Tân Bình", phuong_xa: "Phường 5", ma_tinh_ghn: 202, ma_quan_huyen_ghn: 1450, ma_phuong_xa_ghn: "20601", la_mac_dinh: true },
      { ma_nguoi_dung: kh12.id, ho_ten: "Vũ Đình Sơn", so_dien_thoai: "0945678901", chi_tiet_dia_chi: "101 Điện Biên Phủ, P.15, Q. Bình Thạnh", tinh_thanh: "Hồ Chí Minh", quan_huyen: "Quận Bình Thạnh", phuong_xa: "Phường 15", ma_tinh_ghn: 202, ma_quan_huyen_ghn: 1446, ma_phuong_xa_ghn: "20501", la_mac_dinh: true },
    ],
  });

  // ══════════════════════════════════════════════════════════════════
  // 4. CA LÀM VIỆC
  // ══════════════════════════════════════════════════════════════════
  console.log("⏰ [4] Ca làm việc...");

  const caSang = await prisma.ca_lam_viec.create({ data: { ten_ca: "Ca sáng", gio_bat_dau: createTime(6, 0), gio_ket_thuc: createTime(14, 0) } });
  const caChieu = await prisma.ca_lam_viec.create({ data: { ten_ca: "Ca chiều", gio_bat_dau: createTime(14, 0), gio_ket_thuc: createTime(22, 0) } });
  const caToi = await prisma.ca_lam_viec.create({ data: { ten_ca: "Ca tối", gio_bat_dau: createTime(22, 0), gio_ket_thuc: createTime(6, 0) } });

  // ══════════════════════════════════════════════════════════════════
  // 5. DANH MỤC SẢN PHẨM
  // ══════════════════════════════════════════════════════════════════
  console.log("📂 [5] Danh mục...");

  const dmRauLa = await prisma.danh_muc.create({ data: { ten_danh_muc: "Rau lá" } });
  const dmRauCu = await prisma.danh_muc.create({ data: { ten_danh_muc: "Rau củ quả" } });
  const dmTraiCayND = await prisma.danh_muc.create({ data: { ten_danh_muc: "Trái cây nhiệt đới" } });
  const dmTraiCayOD = await prisma.danh_muc.create({ data: { ten_danh_muc: "Trái cây ôn đới" } });
  const dmGao = await prisma.danh_muc.create({ data: { ten_danh_muc: "Gạo & Ngũ cốc" } });
  const dmNam = await prisma.danh_muc.create({ data: { ten_danh_muc: "Nấm tươi" } });
  const dmGiaVi = await prisma.danh_muc.create({ data: { ten_danh_muc: "Gia vị & Mật ong" } });
  const dmHat = await prisma.danh_muc.create({ data: { ten_danh_muc: "Hạt & Đậu" } });
  const dmTra = await prisma.danh_muc.create({ data: { ten_danh_muc: "Trà & Thảo mộc" } });
  const dmCheBien = await prisma.danh_muc.create({ data: { ten_danh_muc: "Thực phẩm chế biến" } });

  // Danh mục con
  await prisma.danh_muc.createMany({
    data: [
      { ten_danh_muc: "Cải xanh", ma_danh_muc_cha: dmRauLa.id },
      { ten_danh_muc: "Rau muống", ma_danh_muc_cha: dmRauLa.id },
      { ten_danh_muc: "Xà lách", ma_danh_muc_cha: dmRauLa.id },
      { ten_danh_muc: "Cà rốt", ma_danh_muc_cha: dmRauCu.id },
      { ten_danh_muc: "Khoai tây", ma_danh_muc_cha: dmRauCu.id },
      { ten_danh_muc: "Bí đỏ", ma_danh_muc_cha: dmRauCu.id },
      { ten_danh_muc: "Xoài", ma_danh_muc_cha: dmTraiCayND.id },
      { ten_danh_muc: "Thanh long", ma_danh_muc_cha: dmTraiCayND.id },
      { ten_danh_muc: "Sầu riêng", ma_danh_muc_cha: dmTraiCayND.id },
      { ten_danh_muc: "Dâu tây", ma_danh_muc_cha: dmTraiCayOD.id },
      { ten_danh_muc: "Bơ", ma_danh_muc_cha: dmTraiCayOD.id },
    ],
  });

  // ══════════════════════════════════════════════════════════════════
  // 6. NHÀ CUNG CẤP
  // ══════════════════════════════════════════════════════════════════
  console.log("🏭 [6] Nhà cung cấp...");

  const nccList = await Promise.all([
    prisma.nha_cung_cap.create({ data: { ten_ncc: "Nông trại Xanh Đà Lạt", ma_ncc: "NCC001", so_dien_thoai: "0901234567", email: "contact@xanhdalat.vn", dia_chi: "Phường 5, TP. Đà Lạt, Lâm Đồng", loai_ncc: "NONG_TRAI", ma_so_thue: "5800123456", ngay_bat_dau_hop_tac: new Date("2022-01-15"), nguoi_lien_he: "Nguyễn Văn Xanh", so_tai_khoan: "0123456789", ten_ngan_hang: "Vietcombank", tinh_thanh: "Lâm Đồng", trang_thai: "DANG_HOP_TAC", diem_uy_tin: 4.8, co_hoa_don_vat: true, chu_ky_thanh_toan: "NET_30", zalo: "0901234567" } }),
    prisma.nha_cung_cap.create({ data: { ten_ncc: "HTX Nông nghiệp Gia Lai", ma_ncc: "NCC002", so_dien_thoai: "0907654321", email: "htx@gialai.vn", dia_chi: "Pleiku, Gia Lai", loai_ncc: "HOP_TAC_XA", ma_so_thue: "6400789012", ngay_bat_dau_hop_tac: new Date("2022-06-01"), nguoi_lien_he: "Trần Văn Mạnh", so_tai_khoan: "9876543210", ten_ngan_hang: "Agribank", tinh_thanh: "Gia Lai", trang_thai: "DANG_HOP_TAC", diem_uy_tin: 4.5, co_hoa_don_vat: true, chu_ky_thanh_toan: "NET_15", zalo: "0907654321" } }),
    prisma.nha_cung_cap.create({ data: { ten_ncc: "HTX Lúa Gạo Sóc Trăng", ma_ncc: "NCC003", so_dien_thoai: "0912345678", email: "gao@soctrang.vn", dia_chi: "Mỹ Xuyên, Sóc Trăng", loai_ncc: "HOP_TAC_XA", ma_so_thue: "8300456789", ngay_bat_dau_hop_tac: new Date("2021-09-01"), nguoi_lien_he: "Lê Thị Gạo", so_tai_khoan: "1122334455", ten_ngan_hang: "BIDV", tinh_thanh: "Sóc Trăng", trang_thai: "DANG_HOP_TAC", diem_uy_tin: 4.9, co_hoa_don_vat: true, chu_ky_thanh_toan: "NET_30", zalo: "0912345678" } }),
    prisma.nha_cung_cap.create({ data: { ten_ncc: "Trang trại Trái cây Tiền Giang", ma_ncc: "NCC004", so_dien_thoai: "0918765432", email: "traicay@tiengiang.vn", dia_chi: "Cai Lậy, Tiền Giang", loai_ncc: "NONG_TRAI", ma_so_thue: "8200567890", ngay_bat_dau_hop_tac: new Date("2023-02-01"), nguoi_lien_he: "Phạm Văn Quả", so_tai_khoan: "5566778899", ten_ngan_hang: "Sacombank", tinh_thanh: "Tiền Giang", trang_thai: "DANG_HOP_TAC", diem_uy_tin: 4.6, co_hoa_don_vat: true, chu_ky_thanh_toan: "NET_15", zalo: "0918765432" } }),
    prisma.nha_cung_cap.create({ data: { ten_ncc: "HTX Nấm Đồng Nai", ma_ncc: "NCC005", so_dien_thoai: "0921234567", email: "nam@dongnai.vn", dia_chi: "Long Khánh, Đồng Nai", loai_ncc: "HOP_TAC_XA", ma_so_thue: "3600890123", ngay_bat_dau_hop_tac: new Date("2023-05-15"), nguoi_lien_he: "Võ Thị Nấm", so_tai_khoan: "6677889900", ten_ngan_hang: "Techcombank", tinh_thanh: "Đồng Nai", trang_thai: "DANG_HOP_TAC", diem_uy_tin: 4.3, co_hoa_don_vat: true, chu_ky_thanh_toan: "NET_15", zalo: "0921234567" } }),
    prisma.nha_cung_cap.create({ data: { ten_ncc: "Nông trại Gia vị Tây Nguyên", ma_ncc: "NCC006", so_dien_thoai: "0932345678", email: "giavi@taynguyen.vn", dia_chi: "Buôn Ma Thuột, Đắk Lắk", loai_ncc: "NONG_TRAI", ma_so_thue: "6600234567", ngay_bat_dau_hop_tac: new Date("2022-11-01"), nguoi_lien_he: "Nguyễn Văn Tiêu", so_tai_khoan: "7788990011", ten_ngan_hang: "MB Bank", tinh_thanh: "Đắk Lắk", trang_thai: "DANG_HOP_TAC", diem_uy_tin: 4.7, co_hoa_don_vat: false, chu_ky_thanh_toan: "COD", zalo: "0932345678" } }),
    prisma.nha_cung_cap.create({ data: { ten_ncc: "HTX Hạt điều Bình Phước", ma_ncc: "NCC007", so_dien_thoai: "0943456789", email: "hatdieu@binhphuoc.vn", dia_chi: "Bù Đăng, Bình Phước", loai_ncc: "HOP_TAC_XA", ma_so_thue: "7000345678", ngay_bat_dau_hop_tac: new Date("2023-08-01"), nguoi_lien_he: "Trần Thị Hạt", so_tai_khoan: "8899001122", ten_ngan_hang: "VPBank", tinh_thanh: "Bình Phước", trang_thai: "DANG_HOP_TAC", diem_uy_tin: 4.4, co_hoa_don_vat: true, chu_ky_thanh_toan: "NET_30", zalo: "0943456789" } }),
    prisma.nha_cung_cap.create({ data: { ten_ncc: "Nông trại Trà Hà Giang", ma_ncc: "NCC008", so_dien_thoai: "0954567890", email: "tra@hagiang.vn", dia_chi: "Hoàng Su Phì, Hà Giang", loai_ncc: "NONG_TRAI", ma_so_thue: "1900456789", ngay_bat_dau_hop_tac: new Date("2024-01-01"), nguoi_lien_he: "Giàng A Pao", so_tai_khoan: "9900112233", ten_ngan_hang: "Agribank", tinh_thanh: "Hà Giang", trang_thai: "DANG_HOP_TAC", diem_uy_tin: 4.2, co_hoa_don_vat: false, chu_ky_thanh_toan: "COD", zalo: "0954567890" } }),
  ]);

  // ══════════════════════════════════════════════════════════════════
  // 7. SẢN PHẨM + BIẾN THỂ + ẢNH + CHỨNG CHỈ
  // ══════════════════════════════════════════════════════════════════
  console.log("🌾 [7] Sản phẩm, biến thể, ảnh...");

  const sanPhamData = [
    { ten: "Rau muống hữu cơ Đà Lạt", moTa: "Rau muống được trồng hoàn toàn hữu cơ tại vùng đất bazan Đà Lạt, không sử dụng thuốc trừ sâu hay phân hóa học. Giàu chất xơ, sắt và vitamin A, C.", xuatXu: "Đà Lạt, Lâm Đồng", dm: dmRauLa.id, bienThe: [{ ten: "Bó 300g", sku: "RM-300", gia: 18000, giaGoc: 22000, dvt: "bó" }, { ten: "Bó 500g", sku: "RM-500", gia: 28000, giaGoc: 35000, dvt: "bó" }] },
    { ten: "Cải bó xôi Đà Lạt", moTa: "Cải bó xôi (spinach) trồng trong nhà kính công nghệ cao tại Đà Lạt. Giàu sắt, acid folic, vitamin K - rất tốt cho phụ nữ mang thai.", xuatXu: "Đà Lạt, Lâm Đồng", dm: dmRauLa.id, bienThe: [{ ten: "Gói 200g", sku: "CBS-200", gia: 25000, giaGoc: 30000, dvt: "gói" }, { ten: "Gói 500g", sku: "CBS-500", gia: 55000, giaGoc: 65000, dvt: "gói" }] },
    { ten: "Cà rốt baby Lâm Đồng", moTa: "Cà rốt baby size nhỏ xinh, vị ngọt tự nhiên, giòn tan. Trồng theo tiêu chuẩn VietGAP, thu hoạch non để giữ độ ngọt tối đa. Giàu beta-carotene.", xuatXu: "Đơn Dương, Lâm Đồng", dm: dmRauCu.id, bienThe: [{ ten: "Túi 300g", sku: "CR-300", gia: 22000, giaGoc: 28000, dvt: "túi" }, { ten: "Túi 500g", sku: "CR-500", gia: 35000, giaGoc: 42000, dvt: "túi" }, { ten: "Túi 1kg", sku: "CR-1KG", gia: 65000, giaGoc: 78000, dvt: "túi" }] },
    { ten: "Khoai lang Nhật Lâm Đồng", moTa: "Khoai lang Nhật (Japanese sweet potato) ruột vàng, vỏ tím đậm. Khi nướng có vị ngọt bùi đặc trưng, bở tơi. Giàu chất xơ và vitamin E.", xuatXu: "Đức Trọng, Lâm Đồng", dm: dmRauCu.id, bienThe: [{ ten: "Túi 500g", sku: "KL-500", gia: 32000, giaGoc: 38000, dvt: "túi" }, { ten: "Túi 1kg", sku: "KL-1KG", gia: 58000, giaGoc: 70000, dvt: "túi" }] },
    { ten: "Bí đỏ Hokkaido", moTa: "Bí đỏ Hokkaido nhập giống Nhật, trồng tại Lâm Đồng. Ruột vàng cam đậm, vị ngọt bùi, thịt mịn. Tuyệt vời cho soup, cháo bé ăn dặm.", xuatXu: "Lạc Dương, Lâm Đồng", dm: dmRauCu.id, bienThe: [{ ten: "Quả 1-1.5kg", sku: "BD-1KG", gia: 45000, giaGoc: 55000, dvt: "quả" }, { ten: "Nửa quả ~700g", sku: "BD-NUA", gia: 25000, giaGoc: 30000, dvt: "miếng" }] },
    { ten: "Xoài cát Hòa Lộc", moTa: "Xoài cát Hòa Lộc chính gốc Tiền Giang - vua của các loại xoài Việt Nam. Thịt vàng ươm, thơm nức, ngọt thanh không xơ. Đạt chứng nhận VietGAP.", xuatXu: "Cái Bè, Tiền Giang", dm: dmTraiCayND.id, bienThe: [{ ten: "Hộp 1kg (2-3 trái)", sku: "XC-1KG", gia: 95000, giaGoc: 120000, dvt: "hộp" }, { ten: "Hộp 2kg (4-5 trái)", sku: "XC-2KG", gia: 180000, giaGoc: 220000, dvt: "hộp" }] },
    { ten: "Thanh long ruột đỏ Bình Thuận", moTa: "Thanh long ruột đỏ đặc sản Bình Thuận, màu tím hồng đẹp mắt. Vị ngọt dịu, giàu lycopene và vitamin C. Trồng theo tiêu chuẩn GlobalGAP xuất khẩu.", xuatXu: "Hàm Thuận Nam, Bình Thuận", dm: dmTraiCayND.id, bienThe: [{ ten: "Hộp 1kg (2 trái)", sku: "TL-1KG", gia: 55000, giaGoc: 65000, dvt: "hộp" }, { ten: "Thùng 5kg", sku: "TL-5KG", gia: 250000, giaGoc: 300000, dvt: "thùng" }] },
    { ten: "Sầu riêng Ri6 Tiền Giang", moTa: "Sầu riêng giống Ri6 cơm vàng, hạt lép, béo ngậy. Chín cây tự nhiên, mùi thơm đặc trưng. Là giống sầu riêng được yêu thích nhất tại Việt Nam.", xuatXu: "Cai Lậy, Tiền Giang", dm: dmTraiCayND.id, bienThe: [{ ten: "Trái 2-3kg", sku: "SR-TRAI", gia: 180000, giaGoc: 220000, dvt: "kg" }, { ten: "Cơm sầu riêng 500g", sku: "SR-COM", gia: 150000, giaGoc: 180000, dvt: "hộp" }] },
    { ten: "Dừa xiêm Bến Tre", moTa: "Dừa xiêm xanh Bến Tre, nước ngọt thanh mát tự nhiên. Cùi dừa mềm dẻo, thơm béo. Sản phẩm OCOP 4 sao của tỉnh Bến Tre.", xuatXu: "Giồng Trôm, Bến Tre", dm: dmTraiCayND.id, bienThe: [{ ten: "Trái (có gọt)", sku: "DX-1", gia: 20000, giaGoc: 25000, dvt: "trái" }, { ten: "Lốc 4 trái", sku: "DX-4", gia: 72000, giaGoc: 90000, dvt: "lốc" }] },
    { ten: "Dâu tây Đà Lạt", moTa: "Dâu tây giống Nhật trồng tại Đà Lạt, trái to đều, đỏ mọng. Vị chua ngọt hài hòa, thơm đậm. Thu hoạch tay để đảm bảo quả không dập.", xuatXu: "Đà Lạt, Lâm Đồng", dm: dmTraiCayOD.id, bienThe: [{ ten: "Hộp 250g", sku: "DT-250", gia: 65000, giaGoc: 80000, dvt: "hộp" }, { ten: "Hộp 500g", sku: "DT-500", gia: 120000, giaGoc: 150000, dvt: "hộp" }] },
    { ten: "Bơ 034 Đắk Lắk", moTa: "Bơ 034 (bơ booth) Đắk Lắk - giống bơ cao cấp nhất Việt Nam. Cơm dày, béo ngậy, ít xơ. Tỷ lệ cơm/hạt cao nhất trong các giống bơ hiện tại.", xuatXu: "Buôn Ma Thuột, Đắk Lắk", dm: dmTraiCayOD.id, bienThe: [{ ten: "Trái 300-400g", sku: "BO-1", gia: 35000, giaGoc: 42000, dvt: "trái" }, { ten: "Hộp 1kg (3 trái)", sku: "BO-1KG", gia: 95000, giaGoc: 115000, dvt: "hộp" }] },
    { ten: "Gạo ST25 Sóc Trăng", moTa: "Gạo ST25 - gạo ngon nhất thế giới 2019. Hạt dài, cơm dẻo mềm, thơm mùi lá dứa đặc trưng. Canh tác theo quy trình hữu cơ tại Sóc Trăng.", xuatXu: "Mỹ Xuyên, Sóc Trăng", dm: dmGao.id, bienThe: [{ ten: "Túi 2kg", sku: "ST25-2", gia: 65000, giaGoc: 75000, dvt: "túi" }, { ten: "Túi 5kg", sku: "ST25-5", gia: 155000, giaGoc: 180000, dvt: "túi" }, { ten: "Bao 10kg", sku: "ST25-10", gia: 295000, giaGoc: 340000, dvt: "bao" }] },
    { ten: "Gạo lứt huyết rồng", moTa: "Gạo lứt huyết rồng (gạo đỏ) giàu anthocyanin, chất xơ và khoáng chất. Tốt cho người tiểu đường, giảm cân. Hương vị bùi béo đặc trưng.", xuatXu: "An Giang", dm: dmGao.id, bienThe: [{ ten: "Túi 1kg", sku: "GLH-1", gia: 45000, giaGoc: 55000, dvt: "túi" }, { ten: "Túi 2kg", sku: "GLH-2", gia: 85000, giaGoc: 100000, dvt: "túi" }] },
    { ten: "Nấm đùi gà", moTa: "Nấm đùi gà (King Oyster mushroom) thân trắng mập, thịt dày giòn dai. Giàu protein thực vật, ít calo. Phù hợp xào, nướng, lẩu, chế biến chay.", xuatXu: "Long Khánh, Đồng Nai", dm: dmNam.id, bienThe: [{ ten: "Khay 200g", sku: "NDG-200", gia: 28000, giaGoc: 35000, dvt: "khay" }, { ten: "Khay 400g", sku: "NDG-400", gia: 52000, giaGoc: 62000, dvt: "khay" }] },
    { ten: "Nấm hương rừng", moTa: "Nấm hương (shiitake) thu hái tự nhiên từ rừng Tây Nguyên. Hương thơm đặc biệt, vị ngọt umami tự nhiên. Sấy khô giữ nguyên dinh dưỡng.", xuatXu: "Kon Tum", dm: dmNam.id, bienThe: [{ ten: "Gói 100g (sấy khô)", sku: "NHR-100", gia: 85000, giaGoc: 100000, dvt: "gói" }, { ten: "Gói 200g (sấy khô)", sku: "NHR-200", gia: 160000, giaGoc: 190000, dvt: "gói" }] },
    { ten: "Mật ong hoa cà phê Tây Nguyên", moTa: "Mật ong nguyên chất từ hoa cà phê Tây Nguyên. Màu vàng đậm, vị ngọt thanh, hương thơm nhẹ. Không pha trộn, không chất bảo quản.", xuatXu: "Buôn Ma Thuột, Đắk Lắk", dm: dmGiaVi.id, bienThe: [{ ten: "Chai 350ml", sku: "MO-350", gia: 120000, giaGoc: 145000, dvt: "chai" }, { ten: "Chai 700ml", sku: "MO-700", gia: 220000, giaGoc: 270000, dvt: "chai" }] },
    { ten: "Tiêu Phú Quốc", moTa: "Hạt tiêu đen Phú Quốc - chỉ dẫn địa lý được bảo hộ quốc tế. Hạt to, đen bóng, vị cay nồng đặc trưng. Hàm lượng piperine cao nhất thế giới.", xuatXu: "Phú Quốc, Kiên Giang", dm: dmGiaVi.id, bienThe: [{ ten: "Hũ 100g", sku: "TPQ-100", gia: 65000, giaGoc: 80000, dvt: "hũ" }, { ten: "Túi 250g", sku: "TPQ-250", gia: 145000, giaGoc: 175000, dvt: "túi" }, { ten: "Túi 500g", sku: "TPQ-500", gia: 275000, giaGoc: 330000, dvt: "túi" }] },
    { ten: "Nghệ tươi Hưng Yên", moTa: "Nghệ vàng tươi Hưng Yên, củ to mập, hàm lượng curcumin cao. Dùng làm tinh bột nghệ, gia vị nấu ăn. Tốt cho dạ dày và làm đẹp da.", xuatXu: "Hưng Yên", dm: dmGiaVi.id, bienThe: [{ ten: "Túi 500g", sku: "NT-500", gia: 25000, giaGoc: 30000, dvt: "túi" }, { ten: "Túi 1kg", sku: "NT-1KG", gia: 45000, giaGoc: 55000, dvt: "túi" }] },
    { ten: "Tỏi Lý Sơn", moTa: "Tỏi cô đơn Lý Sơn - đặc sản quý hiếm. Mỗi củ chỉ có 1 tép, vị cay nồng đặc biệt, hàm lượng allicin gấp 2-3 lần tỏi thường. OCOP 4 sao.", xuatXu: "Lý Sơn, Quảng Ngãi", dm: dmGiaVi.id, bienThe: [{ ten: "Hũ 200g", sku: "TLS-200", gia: 95000, giaGoc: 115000, dvt: "hũ" }, { ten: "Túi 500g", sku: "TLS-500", gia: 220000, giaGoc: 270000, dvt: "túi" }] },
    { ten: "Ớt chỉ thiên Quảng Nam", moTa: "Ớt chỉ thiên đỏ tươi, trái nhỏ nhưng cay nồng. Đặc trưng vùng Quảng Nam, dùng làm gia vị, tương ớt. Thu hoạch chín đỏ trên cây.", xuatXu: "Quảng Nam", dm: dmGiaVi.id, bienThe: [{ ten: "Túi 200g", sku: "OCT-200", gia: 15000, giaGoc: 18000, dvt: "túi" }, { ten: "Túi 500g", sku: "OCT-500", gia: 32000, giaGoc: 40000, dvt: "túi" }] },
    { ten: "Hạt điều rang muối Bình Phước", moTa: "Hạt điều rang muối size W320, béo bùi, giòn tan. Rang thủ công trong lò củi truyền thống. Không dùng dầu mỡ, muối vừa phải.", xuatXu: "Bù Đăng, Bình Phước", dm: dmHat.id, bienThe: [{ ten: "Hộp 250g", sku: "HD-250", gia: 95000, giaGoc: 115000, dvt: "hộp" }, { ten: "Hộp 500g", sku: "HD-500", gia: 180000, giaGoc: 220000, dvt: "hộp" }, { ten: "Túi 1kg", sku: "HD-1KG", gia: 340000, giaGoc: 410000, dvt: "túi" }] },
    { ten: "Macca Đắk Lắk", moTa: "Hạt macca (Macadamia) nứt vỏ Đắk Lắk. Nhân trắng ngà, béo bùi đặc trưng. Giàu omega-7 tốt cho tim mạch và làn da.", xuatXu: "Krông Năng, Đắk Lắk", dm: dmHat.id, bienThe: [{ ten: "Hộp 250g", sku: "MC-250", gia: 110000, giaGoc: 135000, dvt: "hộp" }, { ten: "Hộp 500g", sku: "MC-500", gia: 210000, giaGoc: 255000, dvt: "hộp" }] },
    { ten: "Đậu xanh Nghệ An", moTa: "Đậu xanh nguyên hạt Nghệ An, hạt to đều, xanh bóng. Nấu chè, làm bánh, nấu xôi đều ngon. Giàu protein và chất xơ.", xuatXu: "Nghệ An", dm: dmHat.id, bienThe: [{ ten: "Túi 500g", sku: "DX-500", gia: 28000, giaGoc: 35000, dvt: "túi" }, { ten: "Túi 1kg", sku: "DX-1KG", gia: 50000, giaGoc: 62000, dvt: "túi" }] },
    { ten: "Trà shan tuyết Hà Giang", moTa: "Trà shan tuyết cổ thụ hàng trăm năm tuổi từ Hoàng Su Phì, Hà Giang. Lá trà to, dày, phủ lông tuyết trắng. Vị chát nhẹ, hậu ngọt sâu.", xuatXu: "Hoàng Su Phì, Hà Giang", dm: dmTra.id, bienThe: [{ ten: "Gói 100g", sku: "TST-100", gia: 85000, giaGoc: 100000, dvt: "gói" }, { ten: "Gói 250g", sku: "TST-250", gia: 195000, giaGoc: 235000, dvt: "gói" }] },
    { ten: "Trà atiso Đà Lạt", moTa: "Trà atiso túi lọc từ hoa và lá atiso tươi Đà Lạt. Thanh nhiệt, giải độc gan, hạ cholesterol. Vị đắng nhẹ thanh mát.", xuatXu: "Đà Lạt, Lâm Đồng", dm: dmTra.id, bienThe: [{ ten: "Hộp 20 túi lọc", sku: "TA-20", gia: 45000, giaGoc: 55000, dvt: "hộp" }, { ten: "Hộp 40 túi lọc", sku: "TA-40", gia: 82000, giaGoc: 100000, dvt: "hộp" }] },
    { ten: "Chanh dây Gia Lai", moTa: "Chanh dây (passion fruit) Gia Lai, trái chín vàng ươm tự nhiên trên giàn. Chua ngọt tự nhiên, giàu vitamin C và chất chống oxy hóa.", xuatXu: "Pleiku, Gia Lai", dm: dmTraiCayND.id, bienThe: [{ ten: "Túi 500g", sku: "CD-500", gia: 25000, giaGoc: 32000, dvt: "túi" }, { ten: "Túi 1kg", sku: "CD-1KG", gia: 45000, giaGoc: 55000, dvt: "túi" }] },
    { ten: "Nước mắm Phú Quốc", moTa: "Nước mắm nhĩ Phú Quốc 40°N đạm, ủ 12-18 tháng trong thùng gỗ. Màu cánh gián, thơm nức, vị mặn mà đậm đà. Chỉ dẫn địa lý quốc tế.", xuatXu: "Phú Quốc, Kiên Giang", dm: dmCheBien.id, bienThe: [{ ten: "Chai 250ml", sku: "NM-250", gia: 55000, giaGoc: 65000, dvt: "chai" }, { ten: "Chai 500ml", sku: "NM-500", gia: 98000, giaGoc: 120000, dvt: "chai" }, { ten: "Chai 1 lít", sku: "NM-1L", gia: 185000, giaGoc: 220000, dvt: "chai" }] },
    { ten: "Mứt dâu tây Đà Lạt", moTa: "Mứt dâu tây handmade từ dâu tây tươi Đà Lạt. Không dùng chất bảo quản, ít đường. Giữ nguyên hương vị tự nhiên của dâu.", xuatXu: "Đà Lạt, Lâm Đồng", dm: dmCheBien.id, bienThe: [{ ten: "Hũ 250g", sku: "MDT-250", gia: 75000, giaGoc: 90000, dvt: "hũ" }, { ten: "Hũ 450g", sku: "MDT-450", gia: 130000, giaGoc: 155000, dvt: "hũ" }] },
    { ten: "Hồng treo gió Đà Lạt", moTa: "Hồng treo gió (hồng sấy khô tự nhiên) theo phương pháp Nhật Bản. Dẻo, ngọt thanh, giàu vitamin A và C. Đặc sản mùa đông Đà Lạt.", xuatXu: "Đà Lạt, Lâm Đồng", dm: dmCheBien.id, bienThe: [{ ten: "Hộp 5 trái", sku: "HTG-5", gia: 85000, giaGoc: 100000, dvt: "hộp" }, { ten: "Hộp 10 trái", sku: "HTG-10", gia: 160000, giaGoc: 190000, dvt: "hộp" }] },
    { ten: "Cà phê Arabica Lâm Đồng", moTa: "Cà phê Arabica hạt rang medium từ vùng cao Lâm Đồng (1200-1500m). Vị chua thanh, body nhẹ, notes chocolate và hoa quả. Specialty grade 82+.", xuatXu: "Cầu Đất, Lâm Đồng", dm: dmCheBien.id, bienThe: [{ ten: "Gói 250g (hạt)", sku: "CF-250H", gia: 135000, giaGoc: 160000, dvt: "gói" }, { ten: "Gói 250g (bột)", sku: "CF-250B", gia: 140000, giaGoc: 165000, dvt: "gói" }, { ten: "Gói 500g (hạt)", sku: "CF-500H", gia: 255000, giaGoc: 300000, dvt: "gói" }] },
  ];

  const sanPhamIds: number[] = [];
  const bienTheIds: number[] = [];

  for (const sp of sanPhamData) {
    const product = await prisma.san_pham.create({
      data: { ten_san_pham: sp.ten, mo_ta: sp.moTa, xuat_xu: sp.xuatXu, ma_danh_muc: sp.dm, trang_thai: "DANG_BAN" },
    });
    sanPhamIds.push(product.id);

    for (const bt of sp.bienThe) {
      const variant = await prisma.bien_the_san_pham.create({
        data: { ma_san_pham: product.id, ma_sku: bt.sku, ten_bien_the: bt.ten, don_vi_tinh: bt.dvt, gia_ban: bt.gia, gia_goc: bt.giaGoc },
      });
      bienTheIds.push(variant.id);
    }

    // Ảnh sản phẩm
    await prisma.anh_san_pham.createMany({
      data: [
        { ma_san_pham: product.id, duong_dan_anh: `/images/products/${product.id}-1.jpg`, la_anh_chinh: true },
        { ma_san_pham: product.id, duong_dan_anh: `/images/products/${product.id}-2.jpg`, la_anh_chinh: false },
      ],
    });
  }

  // Thẻ từ khóa
  const tags = await Promise.all([
    prisma.the_tu_khoa.create({ data: { ten_the: "hữu cơ" } }),
    prisma.the_tu_khoa.create({ data: { ten_the: "organic" } }),
    prisma.the_tu_khoa.create({ data: { ten_the: "sạch" } }),
    prisma.the_tu_khoa.create({ data: { ten_the: "Đà Lạt" } }),
    prisma.the_tu_khoa.create({ data: { ten_the: "Tây Nguyên" } }),
    prisma.the_tu_khoa.create({ data: { ten_the: "VietGAP" } }),
    prisma.the_tu_khoa.create({ data: { ten_the: "vitamin" } }),
    prisma.the_tu_khoa.create({ data: { ten_the: "giảm cân" } }),
    prisma.the_tu_khoa.create({ data: { ten_the: "detox" } }),
    prisma.the_tu_khoa.create({ data: { ten_the: "vegan" } }),
    prisma.the_tu_khoa.create({ data: { ten_the: "superfood" } }),
    prisma.the_tu_khoa.create({ data: { ten_the: "handmade" } }),
    prisma.the_tu_khoa.create({ data: { ten_the: "farm-to-table" } }),
    prisma.the_tu_khoa.create({ data: { ten_the: "mùa vụ" } }),
    prisma.the_tu_khoa.create({ data: { ten_the: "OCOP" } }),
  ]);

  // Gắn tag cho sản phẩm
  const tagAssignments = [
    [0, [0, 2, 3, 12]], [1, [0, 3, 5, 6]], [2, [2, 3, 5, 12]], [3, [3, 13]], [4, [3, 13]],
    [5, [2, 5, 12, 13]], [6, [5, 12]], [7, [4, 12, 13]], [8, [14]], [9, [0, 3, 13]],
    [10, [4, 10]], [11, [2, 5, 10]], [12, [2, 10]], [13, [4, 9]], [14, [4, 10]],
    [15, [4, 11, 14]], [16, [14]], [17, [6, 8]], [18, [14]], [19, [13]],
    [20, [11, 14]], [21, [4, 10]], [22, [9]], [23, [4, 10, 13]], [24, [3, 8, 9]],
    [25, [12, 13]], [26, [14]], [27, [11, 3]], [28, [3, 11]], [29, [4, 10]],
  ];
  for (const [spIdx, tagIdxs] of tagAssignments) {
    for (const tagIdx of tagIdxs as number[]) {
      await prisma.the_san_pham.create({ data: { ma_san_pham: sanPhamIds[spIdx as number], ma_the: tags[tagIdx].id } });
    }
  }

  // Chứng chỉ sản phẩm
  const certNames = ["VietGAP", "GlobalGAP", "Organic USDA", "Hữu cơ Việt Nam", "OCOP 4 sao"];
  const certAssignments = [[0, 0], [1, 0], [2, 0], [5, 0], [5, 1], [6, 1], [7, 0], [11, 0], [11, 3], [12, 0], [20, 0], [23, 0], [26, 4], [27, 4]];
  for (const [spIdx, certIdx] of certAssignments) {
    await prisma.chung_chi_san_pham.create({ data: { ma_san_pham: sanPhamIds[spIdx], ten_chung_chi: certNames[certIdx], duong_dan_anh: `/images/certs/${certNames[certIdx].toLowerCase().replace(/\s/g, '-')}.png` } });
  }

  // NCC - Sản phẩm mapping
  await prisma.ncc_san_pham.createMany({
    data: [
      { ma_ncc: nccList[0].id, ma_san_pham: sanPhamIds[0], gia_nhap_gan_nhat: 12000, don_vi_tinh: "bó", so_luong_toi_thieu: 50, thoi_gian_giao_hang_ngay: 1 },
      { ma_ncc: nccList[0].id, ma_san_pham: sanPhamIds[1], gia_nhap_gan_nhat: 18000, don_vi_tinh: "gói", so_luong_toi_thieu: 30, thoi_gian_giao_hang_ngay: 1 },
      { ma_ncc: nccList[0].id, ma_san_pham: sanPhamIds[2], gia_nhap_gan_nhat: 15000, don_vi_tinh: "túi", so_luong_toi_thieu: 40, thoi_gian_giao_hang_ngay: 1 },
      { ma_ncc: nccList[0].id, ma_san_pham: sanPhamIds[9], gia_nhap_gan_nhat: 45000, don_vi_tinh: "hộp", so_luong_toi_thieu: 20, thoi_gian_giao_hang_ngay: 1 },
      { ma_ncc: nccList[1].id, ma_san_pham: sanPhamIds[25], gia_nhap_gan_nhat: 18000, don_vi_tinh: "túi", so_luong_toi_thieu: 50, thoi_gian_giao_hang_ngay: 2 },
      { ma_ncc: nccList[2].id, ma_san_pham: sanPhamIds[11], gia_nhap_gan_nhat: 42000, don_vi_tinh: "túi", so_luong_toi_thieu: 100, thoi_gian_giao_hang_ngay: 3 },
      { ma_ncc: nccList[2].id, ma_san_pham: sanPhamIds[12], gia_nhap_gan_nhat: 30000, don_vi_tinh: "túi", so_luong_toi_thieu: 50, thoi_gian_giao_hang_ngay: 3 },
      { ma_ncc: nccList[3].id, ma_san_pham: sanPhamIds[5], gia_nhap_gan_nhat: 65000, don_vi_tinh: "hộp", so_luong_toi_thieu: 30, thoi_gian_giao_hang_ngay: 2 },
      { ma_ncc: nccList[3].id, ma_san_pham: sanPhamIds[7], gia_nhap_gan_nhat: 120000, don_vi_tinh: "kg", so_luong_toi_thieu: 20, thoi_gian_giao_hang_ngay: 2 },
      { ma_ncc: nccList[4].id, ma_san_pham: sanPhamIds[13], gia_nhap_gan_nhat: 20000, don_vi_tinh: "khay", so_luong_toi_thieu: 50, thoi_gian_giao_hang_ngay: 1 },
      { ma_ncc: nccList[4].id, ma_san_pham: sanPhamIds[14], gia_nhap_gan_nhat: 60000, don_vi_tinh: "gói", so_luong_toi_thieu: 20, thoi_gian_giao_hang_ngay: 1 },
      { ma_ncc: nccList[5].id, ma_san_pham: sanPhamIds[15], gia_nhap_gan_nhat: 80000, don_vi_tinh: "chai", so_luong_toi_thieu: 30, thoi_gian_giao_hang_ngay: 3 },
      { ma_ncc: nccList[5].id, ma_san_pham: sanPhamIds[16], gia_nhap_gan_nhat: 45000, don_vi_tinh: "hũ", so_luong_toi_thieu: 50, thoi_gian_giao_hang_ngay: 3 },
      { ma_ncc: nccList[6].id, ma_san_pham: sanPhamIds[20], gia_nhap_gan_nhat: 65000, don_vi_tinh: "hộp", so_luong_toi_thieu: 40, thoi_gian_giao_hang_ngay: 2 },
      { ma_ncc: nccList[6].id, ma_san_pham: sanPhamIds[21], gia_nhap_gan_nhat: 75000, don_vi_tinh: "hộp", so_luong_toi_thieu: 30, thoi_gian_giao_hang_ngay: 2 },
      { ma_ncc: nccList[7].id, ma_san_pham: sanPhamIds[23], gia_nhap_gan_nhat: 60000, don_vi_tinh: "gói", so_luong_toi_thieu: 20, thoi_gian_giao_hang_ngay: 4 },
      { ma_ncc: nccList[7].id, ma_san_pham: sanPhamIds[24], gia_nhap_gan_nhat: 30000, don_vi_tinh: "hộp", so_luong_toi_thieu: 50, thoi_gian_giao_hang_ngay: 4 },
    ],
  });

  // ══════════════════════════════════════════════════════════════════
  // 8. KHO HÀNG + VỊ TRÍ
  // ══════════════════════════════════════════════════════════════════
  console.log("🏪 [8] Kho hàng, vị trí...");

  const kho1 = await prisma.kho_hang.create({ data: { ten_kho: "Kho trung tâm HCM", dia_chi: "Lô A5, KCN Tân Bình, Q. Tân Phú, TP.HCM" } });
  const kho2 = await prisma.kho_hang.create({ data: { ten_kho: "Kho Đà Nẵng", dia_chi: "KCN Hòa Khánh, Q. Liên Chiểu, Đà Nẵng" } });
  const kho3 = await prisma.kho_hang.create({ data: { ten_kho: "Kho Hà Nội", dia_chi: "KCN Quang Minh, Mê Linh, Hà Nội" } });

  const viTriData = [];
  for (const kho of [kho1, kho2, kho3]) {
    for (const kv of ["A", "B", "C"]) {
      for (let d = 1; d <= 3; d++) {
        for (let k = 1; k <= 2; k++) {
          viTriData.push({ ma_kho: kho.id, khu_vuc: kv, day: `D${d}`, ke: `K${k}`, tang: "T1", suc_chua_toi_da: 100 });
        }
      }
    }
  }
  await prisma.vi_tri_kho.createMany({ data: viTriData });
  const viTriList = await prisma.vi_tri_kho.findMany();

  // ══════════════════════════════════════════════════════════════════
  // 9. LÔ HÀNG + KIỆN HÀNG + TỒN KHO
  // ══════════════════════════════════════════════════════════════════
  console.log("📦 [9] Lô hàng, kiện hàng, tồn kho...");

  const loHangData = [];
  for (let i = 0; i < 25; i++) {
    const btIdx = i % bienTheIds.length;
    const nccIdx = i % nccList.length;
    const ngayThuHoach = subtractDays(today, 30 + Math.floor(Math.random() * 60));
    const hanSuDung = addDays(ngayThuHoach, 90 + Math.floor(Math.random() * 270));
    const trangThai = hanSuDung < today ? "DA_HET_HAN" : addDays(today, 7) > hanSuDung ? "GAN_HET_HAN" : "BINH_THUONG";
    loHangData.push({
      ma_bien_the: bienTheIds[btIdx],
      ma_ncc: nccList[nccIdx].id,
      ma_lo_hang: `LH-2025-${String(i + 1).padStart(4, '0')}`,
      ngay_thu_hoach: ngayThuHoach,
      han_su_dung: hanSuDung,
      trang_thai: trangThai,
    });
  }
  await prisma.lo_hang.createMany({ data: loHangData });
  const loHangList = await prisma.lo_hang.findMany();

  // Kiện hàng
  const kienHangData = [];
  for (let i = 0; i < loHangList.length; i++) {
    const numKien = 2 + Math.floor(Math.random() * 3);
    for (let k = 0; k < numKien; k++) {
      kienHangData.push({
        ma_lo_hang: loHangList[i].id,
        ma_vi_tri: viTriList[(i * 3 + k) % viTriList.length].id,
        ma_vach_quet: `KH-${String(i + 1).padStart(3, '0')}-${String(k + 1).padStart(2, '0')}`,
        trang_thai: "TRONG_KHO",
      });
    }
  }
  await prisma.kien_hang_chi_tiet.createMany({ data: kienHangData });

  // Tồn kho
  const tonKhoData = loHangList.map((lh, i) => ({
    ma_lo_hang: lh.id,
    ma_vi_tri: viTriList[i % viTriList.length].id,
    so_luong: 20 + Math.floor(Math.random() * 80),
  }));
  await prisma.ton_kho_tong.createMany({ data: tonKhoData });

  // ══════════════════════════════════════════════════════════════════
  // 10. PHƯƠNG THỨC THANH TOÁN + MÃ GIẢM GIÁ
  // ══════════════════════════════════════════════════════════════════
  console.log("💳 [10] Thanh toán, mã giảm giá...");

  const pttt = await Promise.all([
    prisma.phuong_thuc_thanh_toan.create({ data: { ten_phuong_thuc: "COD" } }),
    prisma.phuong_thuc_thanh_toan.create({ data: { ten_phuong_thuc: "VNPay" } }),
    prisma.phuong_thuc_thanh_toan.create({ data: { ten_phuong_thuc: "Momo" } }),
    prisma.phuong_thuc_thanh_toan.create({ data: { ten_phuong_thuc: "Chuyển khoản" } }),
  ]);

  await prisma.ma_giam_gia.createMany({
    data: [
      { ma_code: "WELCOME10", loai_giam_gia: "PHAN_TRAM", gia_tri_giam: 10, don_toi_thieu: 100000, gioi_han_su_dung: 1000, ngay_bat_dau: new Date("2025-01-01"), ngay_ket_thuc: new Date("2026-12-31") },
      { ma_code: "SUMMER20", loai_giam_gia: "PHAN_TRAM", gia_tri_giam: 20, don_toi_thieu: 200000, gioi_han_su_dung: 500, ngay_bat_dau: new Date("2025-05-01"), ngay_ket_thuc: new Date("2025-08-31") },
      { ma_code: "FREESHIP", loai_giam_gia: "CO_DINH", gia_tri_giam: 30000, don_toi_thieu: 150000, gioi_han_su_dung: 2000, ngay_bat_dau: new Date("2025-01-01"), ngay_ket_thuc: new Date("2026-06-30") },
      { ma_code: "VIP50", loai_giam_gia: "CO_DINH", gia_tri_giam: 50000, don_toi_thieu: 500000, gioi_han_su_dung: 200, ngay_bat_dau: new Date("2025-01-01"), ngay_ket_thuc: new Date("2026-12-31") },
      { ma_code: "NOEL2025", loai_giam_gia: "PHAN_TRAM", gia_tri_giam: 15, don_toi_thieu: 150000, gioi_han_su_dung: 300, ngay_bat_dau: new Date("2025-12-01"), ngay_ket_thuc: new Date("2025-12-31") },
      { ma_code: "TETAM2026", loai_giam_gia: "PHAN_TRAM", gia_tri_giam: 25, don_toi_thieu: 200000, gioi_han_su_dung: 500, ngay_bat_dau: new Date("2026-01-15"), ngay_ket_thuc: new Date("2026-02-15") },
      { ma_code: "ORGANIC10", loai_giam_gia: "PHAN_TRAM", gia_tri_giam: 10, don_toi_thieu: 100000, gioi_han_su_dung: 800, ngay_bat_dau: new Date("2025-03-01"), ngay_ket_thuc: new Date("2026-03-01") },
      { ma_code: "NEWUSER30", loai_giam_gia: "CO_DINH", gia_tri_giam: 30000, don_toi_thieu: 0, gioi_han_su_dung: 5000, ngay_bat_dau: new Date("2025-01-01"), ngay_ket_thuc: new Date("2026-12-31") },
      { ma_code: "BUNDLE100", loai_giam_gia: "CO_DINH", gia_tri_giam: 100000, don_toi_thieu: 1000000, gioi_han_su_dung: 100, ngay_bat_dau: new Date("2025-06-01"), ngay_ket_thuc: new Date("2025-12-31") },
      { ma_code: "FLASH50", loai_giam_gia: "PHAN_TRAM", gia_tri_giam: 50, don_toi_thieu: 100000, gioi_han_su_dung: 50, ngay_bat_dau: new Date("2025-05-10"), ngay_ket_thuc: new Date("2025-05-15") },
    ],
  });

  // ══════════════════════════════════════════════════════════════════
  // 11. ĐƠN HÀNG (50 đơn)
  // ══════════════════════════════════════════════════════════════════
  console.log("🛒 [11] Đơn hàng (50 đơn)...");

  const khachHangs = [kh1, kh2, kh3, kh4, kh5, kh6, kh7, kh8, kh9, kh10, kh11, kh12];
  const trangThaiDH = ["CHO_XAC_NHAN", "CHO_XAC_NHAN", "CHO_XAC_NHAN", "CHO_XAC_NHAN", "CHO_XAC_NHAN",
    "DA_XAC_NHAN", "DA_XAC_NHAN", "DA_XAC_NHAN", "DA_XAC_NHAN", "DA_XAC_NHAN",
    "DANG_DONG_GOI", "DANG_DONG_GOI", "DANG_DONG_GOI", "DANG_DONG_GOI", "DANG_DONG_GOI",
    "DANG_GIAO", "DANG_GIAO", "DANG_GIAO", "DANG_GIAO", "DANG_GIAO", "DANG_GIAO", "DANG_GIAO", "DANG_GIAO", "DANG_GIAO", "DANG_GIAO",
    "DA_GIAO", "DA_GIAO", "DA_GIAO", "DA_GIAO", "DA_GIAO", "DA_GIAO", "DA_GIAO", "DA_GIAO", "DA_GIAO", "DA_GIAO",
    "DA_GIAO", "DA_GIAO", "DA_GIAO", "DA_GIAO", "DA_GIAO", "DA_GIAO", "DA_GIAO", "DA_GIAO", "DA_GIAO", "DA_GIAO",
    "DA_HUY", "DA_HUY", "DA_HUY", "DA_HUY", "DA_HUY"];

  const diaChiList = [
    { hoTen: "Lê Thị Hồng", sdt: "0911111111", diaChi: "123 Nguyễn Huệ, P. Bến Nghé, Q.1, HCM", tinh: 202, quan: 1442, xa: "20305" },
    { hoTen: "Phạm Minh Tuấn", sdt: "0922222222", diaChi: "789 Trần Hưng Đạo, P. Cầu Kho, Q.1, HCM", tinh: 202, quan: 1442, xa: "20308" },
    { hoTen: "Võ Thị Mai Lan", sdt: "0933333333", diaChi: "12 Hải Phòng, P. Thạch Thang, Q. Hải Châu, Đà Nẵng", tinh: 203, quan: 1527, xa: "40101" },
    { hoTen: "Nguyễn Hoàng Nam", sdt: "0944444444", diaChi: "34 Lý Thường Kiệt, P. Hàng Bài, Q. Hoàn Kiếm, Hà Nội", tinh: 201, quan: 1482, xa: "10101" },
    { hoTen: "Trần Phương Thảo", sdt: "0955555555", diaChi: "78 Nguyễn Văn Cừ, P. An Hòa, Q. Ninh Kiều, Cần Thơ", tinh: 204, quan: 1560, xa: "50101" },
    { hoTen: "Hoàng Văn Đức", sdt: "0966666666", diaChi: "90 Lê Duẩn, P. Trường An, TP. Huế", tinh: 218, quan: 1610, xa: "30101" },
  ];

  const donHangIds: number[] = [];

  for (let i = 0; i < 50; i++) {
    const khIdx = i % khachHangs.length;
    const dcIdx = i % diaChiList.length;
    const dc = diaChiList[dcIdx];
    const ngayTao = subtractDays(today, Math.floor(Math.random() * 60));

    const donHang = await prisma.don_hang.create({
      data: {
        ma_nguoi_dung: khachHangs[khIdx].id,
        tong_tien: 0,
        phi_van_chuyen: [0, 15000, 20000, 25000, 30000][Math.floor(Math.random() * 5)],
        trang_thai: trangThaiDH[i],
        ngay_tao: ngayTao,
        ghi_chu: i % 5 === 0 ? "Giao giờ hành chính" : i % 7 === 0 ? "Gọi trước khi giao" : null,
        ho_ten_nguoi_nhan: dc.hoTen,
        sdt_nguoi_nhan: dc.sdt,
        dia_chi_giao_hang: dc.diaChi,
        ma_tinh_ghn: dc.tinh,
        ma_quan_huyen_ghn: dc.quan,
        ma_phuong_xa_ghn: dc.xa,
      },
    });
    donHangIds.push(donHang.id);

    // Chi tiết đơn hàng (2-4 items)
    const numItems = 2 + Math.floor(Math.random() * 3);
    let tongTien = 0;
    for (let j = 0; j < numItems; j++) {
      const btIdx = (i * 3 + j) % bienTheIds.length;
      const soLuong = 1 + Math.floor(Math.random() * 5);
      const donGia = [18000, 25000, 35000, 45000, 55000, 65000, 85000, 95000, 120000, 150000][(i + j) % 10];
      tongTien += donGia * soLuong;
      await prisma.chi_tiet_don_hang.create({
        data: { ma_don_hang: donHang.id, ma_bien_the: bienTheIds[btIdx], so_luong: soLuong, don_gia: donGia },
      });
    }
    await prisma.don_hang.update({ where: { id: donHang.id }, data: { tong_tien: tongTien } });

    // Lịch sử đơn hàng
    await prisma.lich_su_don_hang.create({ data: { ma_don_hang: donHang.id, trang_thai: "CHO_XAC_NHAN", thoi_gian_doi: ngayTao } });
    if (["DA_XAC_NHAN", "DANG_DONG_GOI", "DANG_GIAO", "DA_GIAO"].includes(trangThaiDH[i])) {
      await prisma.lich_su_don_hang.create({ data: { ma_don_hang: donHang.id, trang_thai: "DA_XAC_NHAN", thoi_gian_doi: addDays(ngayTao, 1) } });
    }
    if (["DANG_DONG_GOI", "DANG_GIAO", "DA_GIAO"].includes(trangThaiDH[i])) {
      await prisma.lich_su_don_hang.create({ data: { ma_don_hang: donHang.id, trang_thai: "DANG_DONG_GOI", thoi_gian_doi: addDays(ngayTao, 1) } });
    }
    if (["DANG_GIAO", "DA_GIAO"].includes(trangThaiDH[i])) {
      await prisma.lich_su_don_hang.create({ data: { ma_don_hang: donHang.id, trang_thai: "DANG_GIAO", thoi_gian_doi: addDays(ngayTao, 2) } });
    }
    if (trangThaiDH[i] === "DA_GIAO") {
      await prisma.lich_su_don_hang.create({ data: { ma_don_hang: donHang.id, trang_thai: "DA_GIAO", thoi_gian_doi: addDays(ngayTao, 4) } });
    }
    if (trangThaiDH[i] === "DA_HUY") {
      await prisma.lich_su_don_hang.create({ data: { ma_don_hang: donHang.id, trang_thai: "DA_HUY", thoi_gian_doi: addDays(ngayTao, 1) } });
    }

    // Giao dịch thanh toán
    const ptIdx = i % 4;
    const ptNames = ["COD", "VNPAY", "MOMO", "BANK_TRANSFER"];
    const gdTT = trangThaiDH[i] === "DA_GIAO" ? "THANH_CONG" : trangThaiDH[i] === "DA_HUY" ? "THAT_BAI" : "CHO_THANH_TOAN";
    await prisma.giao_dich_thanh_toan.create({
      data: {
        ma_don_hang: donHang.id,
        ma_phuong_thuc: pttt[ptIdx].id,
        so_tien: tongTien,
        trang_thai: gdTT,
        phuong_thuc_thanh_toan: ptNames[ptIdx],
        ma_giao_dich_ben_ngoai: ptIdx > 0 ? `TXN${Date.now()}${i}` : null,
        ngay_tao: ngayTao,
      },
    });
  }

  // ══════════════════════════════════════════════════════════════════
  // 12. ĐỐI TÁC VẬN CHUYỂN + ĐƠN VẬN CHUYỂN
  // ══════════════════════════════════════════════════════════════════
  console.log("🚚 [12] Vận chuyển...");

  const dtvc = await Promise.all([
    prisma.doi_tac_van_chuyen.create({ data: { ten_doi_tac: "Giao Hàng Nhanh (GHN)", so_dien_thoai: "1900636677" } }),
    prisma.doi_tac_van_chuyen.create({ data: { ten_doi_tac: "Giao Hàng Tiết Kiệm (GHTK)", so_dien_thoai: "1900636688" } }),
    prisma.doi_tac_van_chuyen.create({ data: { ten_doi_tac: "Viettel Post", so_dien_thoai: "1900636699" } }),
  ]);

  // Đơn vận chuyển cho đơn DANG_GIAO và DA_GIAO
  for (let i = 15; i < 45; i++) {
    const dtIdx = i % 3;
    await prisma.don_van_chuyen.create({
      data: {
        ma_don_hang: donHangIds[i],
        ma_doi_tac: dtvc[dtIdx].id,
        ma_van_don: `VD${String(donHangIds[i]).padStart(8, '0')}`,
        trang_thai: i >= 25 ? "DA_GIAO" : "DANG_VAN_CHUYEN",
        ngay_giao_du_kien: addDays(today, i >= 25 ? -2 : 2),
      },
    });
  }

  // ══════════════════════════════════════════════════════════════════
  // 13. PHIẾU NHẬP/XUẤT KHO
  // ══════════════════════════════════════════════════════════════════
  console.log("📋 [13] Phiếu nhập/xuất kho...");

  for (let i = 0; i < 12; i++) {
    const nccIdx = i % nccList.length;
    const phieuNhap = await prisma.phieu_nhap_kho.create({
      data: {
        ma_ncc: nccList[nccIdx].id,
        ma_nguoi_tao: thukho1.id,
        ma_kho: [kho1, kho2, kho3][i % 3].id,
        tong_tien: (i + 1) * 500000,
        trang_thai: "HOAN_THANH",
        ngay_tao: subtractDays(today, 30 + i * 5),
      },
    });

    // Chi tiết phiếu nhập
    const numItems = 2 + (i % 2);
    for (let j = 0; j < numItems; j++) {
      const btIdx = (i * 2 + j) % bienTheIds.length;
      await prisma.chi_tiet_phieu_nhap.create({
        data: {
          ma_phieu_nhap: phieuNhap.id,
          ma_bien_the: bienTheIds[btIdx],
          so_luong_yeu_cau: 50 + j * 20,
          so_luong_thuc_nhan: 50 + j * 20,
          don_gia: 20000 + j * 10000,
        },
      });
    }
  }

  // Phiếu xuất kho (cho đơn DA_GIAO)
  for (let i = 25; i < 40; i++) {
    const phieuXuat = await prisma.phieu_xuat_kho.create({
      data: {
        ma_nguoi_tao: thukho1.id,
        ma_kho: kho1.id,
        ma_don_hang: donHangIds[i],
        ly_do_xuat: "Xuất theo đơn hàng",
        trang_thai: "HOAN_THANH",
        ngay_tao: subtractDays(today, 50 - i),
      },
    });

    await prisma.chi_tiet_phieu_xuat.create({
      data: {
        ma_phieu_xuat: phieuXuat.id,
        ma_bien_the: bienTheIds[i % bienTheIds.length],
        so_luong_yeu_cau: 2 + (i % 4),
        so_luong_thuc_xuat: 2 + (i % 4),
      },
    });
  }

  // ══════════════════════════════════════════════════════════════════
  // 14. ĐÁNH GIÁ SẢN PHẨM
  // ══════════════════════════════════════════════════════════════════
  console.log("⭐ [14] Đánh giá sản phẩm (40 reviews)...");

  const noiDungDanhGia = [
    "Sản phẩm rất tươi ngon, đóng gói cẩn thận. Sẽ mua lại!",
    "Chất lượng tốt, giao hàng nhanh. Rau rất sạch, gia đình rất thích.",
    "Hương vị đậm đà, đúng như mô tả. Giá cả hợp lý.",
    "Giao hàng hơi chậm nhưng sản phẩm OK. Đóng gói đẹp.",
    "Tuyệt vời! Ngon hơn mua ngoài chợ nhiều. Recommend cho mọi người.",
    "Hàng bị dập 1 ít do vận chuyển, nhưng nhìn chung vẫn tươi.",
    "Mua lần thứ 3 rồi, luôn hài lòng. Sản phẩm organic chất lượng.",
    "Giá hơi cao so với chợ nhưng chất lượng đảm bảo, an tâm sử dụng.",
    "Rất tươi, vị ngọt tự nhiên. Con bé nhà mình rất thích ăn.",
    "Sản phẩm đúng xuất xứ, có giấy chứng nhận rõ ràng. Tin tưởng.",
    "Lần đầu mua thử, khá hài lòng. Sẽ tiếp tục ủng hộ shop.",
    "Thơm ngon, đúng mùa. Đóng gói chắc chắn, không bị dập.",
    "Chất lượng bình thường, không có gì đặc biệt lắm.",
    "Rất ngon! Gia đình ăn hết trong 2 ngày. Phải order thêm.",
    "Sản phẩm tươi, nhưng size nhỏ hơn hình. Vẫn OK thôi.",
    "Giao hàng nhanh, đóng gói cẩn thận. Sản phẩm chất lượng cao.",
    "Mua tặng người thân, họ rất thích. Đóng hộp đẹp sang trọng.",
    "Vị đắng hơn mong đợi, có thể do mình chưa quen. 3 sao.",
    "Xuất sắc! Đúng là hàng chính gốc. Sẽ giới thiệu cho bạn bè.",
    "Hàng đợt này không tươi bằng lần trước. Hy vọng cải thiện.",
  ];

  const phanHoiAdmin = [
    "Cảm ơn bạn đã ủng hộ! Chúng tôi luôn nỗ lực cung cấp sản phẩm tốt nhất.",
    "Rất vui vì bạn hài lòng! Hẹn gặp lại bạn ở đơn hàng tiếp theo nhé.",
    "Cảm ơn feedback! Chúng tôi sẽ cải thiện dịch vụ giao hàng.",
    null, null, null,
  ];

  for (let i = 0; i < 40; i++) {
    const spIdx = i % sanPhamIds.length;
    const khIdx = i % khachHangs.length;
    const soSao = i % 7 === 0 ? 3 : i % 5 === 0 ? 4 : 5;
    const phanHoi = phanHoiAdmin[i % phanHoiAdmin.length];

    await prisma.danh_gia_san_pham.create({
      data: {
        ma_san_pham: sanPhamIds[spIdx],
        ma_nguoi_dung: khachHangs[khIdx].id,
        so_sao: soSao,
        noi_dung: noiDungDanhGia[i % noiDungDanhGia.length],
        trang_thai: "DA_DUYET",
        phan_hoi_admin: phanHoi,
        ngay_phan_hoi: phanHoi ? subtractDays(today, Math.floor(Math.random() * 30)) : null,
        ngay_tao: subtractDays(today, Math.floor(Math.random() * 60)),
      },
    });
  }

  // ══════════════════════════════════════════════════════════════════
  // 15. NHÂN SỰ: CHẤM CÔNG, PHÂN CA, LƯƠNG, ĐƠN XIN NGHỈ
  // ══════════════════════════════════════════════════════════════════
  console.log("👷 [15] Nhân sự...");

  const nhanVienList = [staffKho, staffBH, staffGH, ketoan, thukho1, thukho2];
  const caList = [caSang, caChieu, caToi];

  // Phân ca (30 ngày gần đây)
  for (let day = 0; day < 30; day++) {
    const ngay = subtractDays(today, day);
    if (ngay.getDay() === 0) continue; // bỏ CN
    for (let nvIdx = 0; nvIdx < nhanVienList.length; nvIdx++) {
      const caIdx = (nvIdx + day) % 2; // xoay ca sáng/chiều
      await prisma.lich_phan_cong_ca.create({
        data: { ma_nguoi_dung: nhanVienList[nvIdx].id, ma_ca_lam: caList[caIdx].id, ngay_lam_viec: ngay },
      });
    }
  }

  // Chấm công (20 ngày gần đây)
  for (let day = 1; day <= 20; day++) {
    const ngay = subtractDays(today, day);
    if (ngay.getDay() === 0) continue;
    for (let nvIdx = 0; nvIdx < nhanVienList.length; nvIdx++) {
      const caIdx = (nvIdx + day) % 2;
      const gioVao = new Date(ngay);
      const soPhutTre = nvIdx === 2 ? Math.floor(Math.random() * 15) : 0;
      if (caIdx === 0) { gioVao.setHours(6, soPhutTre, 0); } else { gioVao.setHours(14, soPhutTre, 0); }
      const gioRa = new Date(gioVao);
      gioRa.setHours(gioRa.getHours() + 8);

      await prisma.lich_su_cham_cong.create({
        data: {
          ma_nguoi_dung: nhanVienList[nvIdx].id,
          ma_ca_lam: caList[caIdx].id,
          gio_vao: gioVao,
          gio_ra: gioRa,
          phuong_thuc_xac_thuc: nvIdx % 2 === 0 ? "FACE_ID" : "QR_CODE",
          so_phut_tre: soPhutTre,
          trang_thai: "DA_RA",
        },
      });
    }
  }

  // Đơn xin nghỉ
  await prisma.don_xin_nghi.createMany({
    data: [
      { ma_nguoi_dung: staffKho.id, loai_nghi: "PHEP_NAM", ngay_bat_dau: addDays(today, 5), ngay_ket_thuc: addDays(today, 7), ly_do: "Về quê thăm gia đình", trang_thai: "DA_DUYET", nguoi_duyet_id: admin1.id },
      { ma_nguoi_dung: staffBH.id, loai_nghi: "BENH", ngay_bat_dau: subtractDays(today, 3), ngay_ket_thuc: subtractDays(today, 2), ly_do: "Bị cảm sốt", trang_thai: "DA_DUYET", nguoi_duyet_id: admin1.id },
      { ma_nguoi_dung: staffGH.id, loai_nghi: "KHONG_LUONG", ngay_bat_dau: addDays(today, 10), ngay_ket_thuc: addDays(today, 10), ly_do: "Việc cá nhân", trang_thai: "CHO_DUYET" },
      { ma_nguoi_dung: thukho1.id, loai_nghi: "PHEP_NAM", ngay_bat_dau: addDays(today, 15), ngay_ket_thuc: addDays(today, 18), ly_do: "Đi du lịch", trang_thai: "CHO_DUYET" },
      { ma_nguoi_dung: ketoan.id, loai_nghi: "PHEP_NAM", ngay_bat_dau: subtractDays(today, 10), ngay_ket_thuc: subtractDays(today, 8), ly_do: "Đám cưới bạn", trang_thai: "DA_DUYET", nguoi_duyet_id: admin1.id },
      { ma_nguoi_dung: staffKho.id, loai_nghi: "BENH", ngay_bat_dau: subtractDays(today, 20), ngay_ket_thuc: subtractDays(today, 19), ly_do: "Đau răng khám nha khoa", trang_thai: "DA_DUYET", nguoi_duyet_id: admin1.id },
      { ma_nguoi_dung: thukho2.id, loai_nghi: "THAI_SAN", ngay_bat_dau: addDays(today, 30), ngay_ket_thuc: addDays(today, 210), ly_do: "Nghỉ thai sản", trang_thai: "DA_DUYET", nguoi_duyet_id: admin1.id },
      { ma_nguoi_dung: staffGH.id, loai_nghi: "PHEP_NAM", ngay_bat_dau: subtractDays(today, 30), ngay_ket_thuc: subtractDays(today, 28), ly_do: "Về quê ăn Tết", trang_thai: "DA_DUYET", nguoi_duyet_id: admin2.id },
    ],
  });

  // Bảng lương (6 nhân viên × 3 tháng)
  for (const nv of nhanVienList) {
    for (let m = 3; m <= 5; m++) {
      const tongGio = 160 + Math.floor(Math.random() * 20);
      const luongCoBan = tongGio * 35000;
      const phuCapToi = m === 5 ? 500000 : 0;
      const thuongCC = tongGio > 170 ? 300000 : 0;
      const khauTru = Math.floor(Math.random() * 50000);
      await prisma.bang_luong_thang.create({
        data: {
          ma_nguoi_dung: nv.id,
          thang: m,
          nam: 2025,
          tong_gio_thuc_te: tongGio,
          luong_co_ban: luongCoBan,
          phu_cap_ca_toi: phuCapToi,
          thuong_chuyen_can: thuongCC,
          khau_tru_tre: khauTru,
          thuc_nhan: luongCoBan + phuCapToi + thuongCC - khauTru,
          da_chot: m < 5,
        },
      });
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // 16. THÔNG BÁO
  // ══════════════════════════════════════════════════════════════════
  console.log("🔔 [16] Thông báo...");

  const thongBaoData = [
    { ma_nguoi_dung: kh1.id, tieu_de: "Đơn hàng đã được xác nhận", noi_dung: "Đơn hàng #DH001 của bạn đã được xác nhận và đang chuẩn bị.", loai_thong_bao: "DON_HANG", da_doc: true },
    { ma_nguoi_dung: kh1.id, tieu_de: "Đơn hàng đang giao", noi_dung: "Đơn hàng #DH001 đang được vận chuyển đến bạn.", loai_thong_bao: "GIAO_HANG", da_doc: true },
    { ma_nguoi_dung: kh2.id, tieu_de: "Flash Sale cuối tuần!", noi_dung: "Giảm đến 50% tất cả rau củ organic. Nhanh tay!", loai_thong_bao: "KHUYEN_MAI", da_doc: false },
    { ma_nguoi_dung: kh3.id, tieu_de: "Đơn hàng đã giao thành công", noi_dung: "Đơn hàng #DH005 đã giao thành công. Cảm ơn bạn!", loai_thong_bao: "DON_HANG", da_doc: true },
    { ma_nguoi_dung: kh4.id, tieu_de: "Mã giảm giá mới dành cho bạn", noi_dung: "Nhập WELCOME10 để giảm 10% đơn hàng tiếp theo.", loai_thong_bao: "KHUYEN_MAI", da_doc: false },
    { ma_nguoi_dung: kh5.id, tieu_de: "Yêu cầu đổi trả đã được duyệt", noi_dung: "Yêu cầu đổi trả của bạn đã được chấp nhận. Hoàn tiền trong 3-5 ngày.", loai_thong_bao: "HE_THONG", da_doc: false },
    { ma_nguoi_dung: kh6.id, tieu_de: "Sản phẩm yêu thích giảm giá", noi_dung: "Bơ 034 Đắk Lắk bạn yêu thích đang giảm 20%!", loai_thong_bao: "KHUYEN_MAI", da_doc: false },
    { ma_nguoi_dung: kh7.id, tieu_de: "Đơn hàng đã được giao", noi_dung: "Shipper đã giao đơn #DH012 thành công.", loai_thong_bao: "GIAO_HANG", da_doc: true },
    { ma_nguoi_dung: staffKho.id, tieu_de: "Phiếu nhập kho mới", noi_dung: "Có phiếu nhập kho mới từ NCC Đà Lạt cần xác nhận.", loai_thong_bao: "HE_THONG", da_doc: false },
    { ma_nguoi_dung: thukho1.id, tieu_de: "Cảnh báo hết hạn lô hàng", noi_dung: "Lô hàng LH-2025-0003 sắp hết hạn trong 5 ngày.", loai_thong_bao: "HE_THONG", da_doc: false },
    { ma_nguoi_dung: kh8.id, tieu_de: "Chào mừng thành viên mới!", noi_dung: "Bạn nhận được voucher 30k cho đơn đầu tiên. Mã: NEWUSER30", loai_thong_bao: "KHUYEN_MAI", da_doc: false },
    { ma_nguoi_dung: kh9.id, tieu_de: "Đánh giá đơn hàng", noi_dung: "Bạn hài lòng với đơn hàng vừa nhận? Đánh giá ngay!", loai_thong_bao: "DON_HANG", da_doc: false },
    { ma_nguoi_dung: kh10.id, tieu_de: "Gạo ST25 đã có hàng trở lại", noi_dung: "Sản phẩm bạn chờ đã có hàng. Đặt ngay!", loai_thong_bao: "HE_THONG", da_doc: false },
    { ma_nguoi_dung: admin1.id, tieu_de: "Báo cáo doanh thu tuần", noi_dung: "Doanh thu tuần này tăng 15% so với tuần trước.", loai_thong_bao: "HE_THONG", da_doc: true },
    { ma_nguoi_dung: kh11.id, tieu_de: "Đơn hàng đang vận chuyển", noi_dung: "Đơn hàng #DH025 đang được shipper vận chuyển.", loai_thong_bao: "GIAO_HANG", da_doc: false },
  ];
  await prisma.thong_bao.createMany({ data: thongBaoData });

  // ══════════════════════════════════════════════════════════════════
  // 17. BANNER QUẢNG CÁO
  // ══════════════════════════════════════════════════════════════════
  console.log("🎨 [17] Banner quảng cáo...");

  await prisma.banner_quang_cao.createMany({
    data: [
      { tieu_de: "Mùa hè tươi mát - Giảm 20%", mo_ta: "Trái cây nhiệt đới tươi ngon từ vườn đến bàn ăn", duong_dan_anh: "/images/banners/summer-sale.jpg", lien_ket: "/products?category=trai-cay", loai_banner: "hero", thu_tu_sap_xep: 1, dang_hoat_dong: true, ngay_bat_dau: new Date("2025-05-01"), ngay_ket_thuc: new Date("2025-08-31") },
      { tieu_de: "Rau sạch Đà Lạt - Ship tận nhà", mo_ta: "Từ nông trại đến bàn ăn trong 24h", duong_dan_anh: "/images/banners/dalat-veggies.jpg", lien_ket: "/products?category=rau-la", loai_banner: "hero", thu_tu_sap_xep: 2, dang_hoat_dong: true, ngay_bat_dau: new Date("2025-01-01"), ngay_ket_thuc: new Date("2026-12-31") },
      { tieu_de: "Gạo ST25 chính gốc", mo_ta: "Gạo ngon nhất thế giới - Chứng nhận hữu cơ", duong_dan_anh: "/images/banners/gao-st25.jpg", lien_ket: "/products?search=ST25", loai_banner: "hero", thu_tu_sap_xep: 3, dang_hoat_dong: true, ngay_bat_dau: new Date("2025-01-01"), ngay_ket_thuc: new Date("2026-12-31") },
      { tieu_de: "Flash Sale - Mỗi ngày", mo_ta: "Giảm sốc đến 50% mỗi ngày lúc 12h", duong_dan_anh: "/images/banners/flash-sale.jpg", lien_ket: "/products?sale=true", loai_banner: "sidebar", thu_tu_sap_xep: 1, dang_hoat_dong: true, ngay_bat_dau: new Date("2025-05-01"), ngay_ket_thuc: new Date("2025-12-31") },
      { tieu_de: "Đăng ký nhận tin - Giảm 30k", mo_ta: "Nhập email để nhận voucher 30.000đ", duong_dan_anh: "/images/banners/newsletter.jpg", lien_ket: "/register", loai_banner: "popup", thu_tu_sap_xep: 1, dang_hoat_dong: true, ngay_bat_dau: new Date("2025-01-01"), ngay_ket_thuc: new Date("2026-12-31") },
      { tieu_de: "Tết Nguyên Đán 2026", mo_ta: "Giỏ quà Tết - Giảm 25% toàn bộ", duong_dan_anh: "/images/banners/tet-2026.jpg", lien_ket: "/products?tag=tet", loai_banner: "hero", thu_tu_sap_xep: 4, dang_hoat_dong: false, ngay_bat_dau: new Date("2026-01-15"), ngay_ket_thuc: new Date("2026-02-15") },
    ],
  });

  // ══════════════════════════════════════════════════════════════════
  // 18. PHIÊN CHAT AI
  // ══════════════════════════════════════════════════════════════════
  console.log("🤖 [18] Chat AI...");

  const chatSessions = [
    { user: kh1.id, messages: [
      { vai_tro: "user", noi_dung: "Cho mình hỏi Gạo ST25 có phải gạo hữu cơ không?" },
      { vai_tro: "assistant", noi_dung: "Chào bạn! Gạo ST25 của chúng tôi được canh tác theo quy trình hữu cơ tại Sóc Trăng, đạt chứng nhận VietGAP. Hạt gạo dài, cơm dẻo thơm mùi lá dứa đặc trưng. Bạn có muốn đặt hàng không ạ?" },
      { vai_tro: "user", noi_dung: "Giá bao nhiêu vậy?" },
      { vai_tro: "assistant", noi_dung: "Hiện tại Gạo ST25 có 3 quy cách:\n- Túi 2kg: 65.000đ\n- Túi 5kg: 155.000đ\n- Bao 10kg: 295.000đ\nNgoài ra bạn có thể dùng mã ORGANIC10 để giảm thêm 10% nhé!" },
    ]},
    { user: kh3.id, messages: [
      { vai_tro: "user", noi_dung: "Đơn hàng của mình giao đến đâu rồi?" },
      { vai_tro: "assistant", noi_dung: "Mình kiểm tra thấy đơn hàng của bạn (mã DH-0012) đang được vận chuyển qua GHN. Dự kiến giao trong ngày mai (trước 17h). Bạn có thể theo dõi mã vận đơn VD00000012 trên app GHN nhé!" },
      { vai_tro: "user", noi_dung: "Ok cảm ơn bạn" },
    ]},
    { user: kh5.id, messages: [
      { vai_tro: "user", noi_dung: "Tôi muốn tìm sản phẩm organic cho bé ăn dặm" },
      { vai_tro: "assistant", noi_dung: "Chào bạn! Cho bé ăn dặm, mình gợi ý:\n1. Bí đỏ Hokkaido - ruột mịn, ngọt, dễ chế biến cháo/soup\n2. Cà rốt baby - vị ngọt tự nhiên, giàu beta-carotene\n3. Cải bó xôi - giàu sắt, acid folic\n\nTất cả đều đạt chứng nhận VietGAP và trồng hữu cơ tại Đà Lạt. Bạn muốn xem chi tiết sản phẩm nào ạ?" },
    ]},
    { user: kh8.id, messages: [
      { vai_tro: "user", noi_dung: "Mật ong hoa cà phê có đặc điểm gì khác mật ong thường?" },
      { vai_tro: "assistant", noi_dung: "Mật ong hoa cà phê Tây Nguyên có đặc điểm:\n- Màu vàng đậm hơn mật ong hoa nhãn\n- Hương thơm nhẹ, có notes cà phê đặc trưng\n- Vị ngọt thanh, không gắt\n- Hàm lượng chất chống oxy hóa cao\n- Thu hoạch mùa hoa cà phê (tháng 2-4)\n\nSản phẩm nguyên chất 100%, không pha trộn. Chai 350ml giá 120.000đ, chai 700ml giá 220.000đ." },
      { vai_tro: "user", noi_dung: "Có ship đến Vũng Tàu không?" },
      { vai_tro: "assistant", noi_dung: "Có ạ! Chúng tôi ship toàn quốc qua GHN/GHTK. Ship đến Vũng Tàu khoảng 2-3 ngày, phí ship từ 20-30k tùy trọng lượng. Đơn từ 300k được freeship nhé!" },
    ]},
    { user: kh10.id, messages: [
      { vai_tro: "user", noi_dung: "Cách bảo quản dâu tây?" },
      { vai_tro: "assistant", noi_dung: "Để dâu tây tươi lâu nhất:\n1. Không rửa trước khi cất - chỉ rửa khi ăn\n2. Lót giấy ăn trong hộp để hút ẩm\n3. Bảo quản ngăn mát tủ lạnh (2-5°C)\n4. Không chồng chất lên nhau\n5. Tách riêng trái dập\n\nVới cách này dâu tây Đà Lạt giữ tươi 5-7 ngày. Muốn lâu hơn có thể đông lạnh (dùng làm sinh tố, smoothie)." },
    ]},
  ];

  for (const session of chatSessions) {
    const phien = await prisma.phien_chat_ai.create({
      data: { ma_nguoi_dung: session.user, ma_phien_chat: `CHAT-${Date.now()}-${session.user}` },
    });
    for (const msg of session.messages) {
      await prisma.tin_nhan_chat_ai.create({
        data: { ma_phien_chat: phien.id, vai_tro_nguoi_gui: msg.vai_tro, noi_dung: msg.noi_dung },
      });
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // 19. YÊU CẦU ĐỔI TRẢ + HOÀN TIỀN
  // ══════════════════════════════════════════════════════════════════
  console.log("🔄 [19] Đổi trả, hoàn tiền...");

  const yc1 = await prisma.yeu_cau_doi_tra.create({
    data: { ma_don_hang: donHangIds[25], ma_nguoi_dung: kh1.id, loai_yeu_cau: "TRA", trang_thai: "DA_DUYET", so_tien_hoan: 55000, ly_do_hoan_tra: "Sản phẩm bị dập nát do vận chuyển" },
  });
  const yc2 = await prisma.yeu_cau_doi_tra.create({
    data: { ma_don_hang: donHangIds[26], ma_nguoi_dung: kh2.id, loai_yeu_cau: "DOI", trang_thai: "DA_DUYET", so_tien_hoan: 0, ly_do_hoan_tra: "Giao sai sản phẩm (nhận cà rốt thay vì khoai lang)" },
  });
  const yc3 = await prisma.yeu_cau_doi_tra.create({
    data: { ma_don_hang: donHangIds[27], ma_nguoi_dung: kh3.id, loai_yeu_cau: "TRA", trang_thai: "CHO_DUYET", so_tien_hoan: 120000, ly_do_hoan_tra: "Sản phẩm không đúng mô tả, dâu tây bị héo" },
  });
  await prisma.yeu_cau_doi_tra.create({
    data: { ma_don_hang: donHangIds[28], ma_nguoi_dung: kh4.id, loai_yeu_cau: "TRA", trang_thai: "TU_CHOI", so_tien_hoan: 0, ly_do_hoan_tra: "Không thích vị sản phẩm" },
  });
  await prisma.yeu_cau_doi_tra.create({
    data: { ma_don_hang: donHangIds[30], ma_nguoi_dung: kh6.id, loai_yeu_cau: "DOI", trang_thai: "CHO_DUYET", so_tien_hoan: 0, ly_do_hoan_tra: "Nhận thiếu 1 sản phẩm trong đơn" },
  });

  // Chi tiết đổi trả
  await prisma.chi_tiet_doi_tra.createMany({
    data: [
      { ma_yeu_cau: yc1.id, ma_bien_the: bienTheIds[0], so_luong: 2, ly_do: "Rau bị dập, héo" },
      { ma_yeu_cau: yc2.id, ma_bien_the: bienTheIds[3], so_luong: 1, ly_do: "Nhận sai sản phẩm" },
      { ma_yeu_cau: yc3.id, ma_bien_the: bienTheIds[9], so_luong: 2, ly_do: "Dâu tây héo, mốc" },
    ],
  });

  // Hoàn tiền
  const gdTTList = await prisma.giao_dich_thanh_toan.findMany({ where: { ma_don_hang: donHangIds[25] } });
  if (gdTTList.length > 0) {
    await prisma.lich_su_hoan_tien.create({
      data: { ma_giao_dich: gdTTList[0].id, ma_yeu_cau_doi_tra: yc1.id, so_tien: 55000, trang_thai: "HOAN_THANH" },
    });
  }

  // ══════════════════════════════════════════════════════════════════
  // 20. NHIỆM VỤ CÔNG VIỆC
  // ══════════════════════════════════════════════════════════════════
  console.log("📋 [20] Nhiệm vụ công việc...");

  await prisma.nhiem_vu_cong_viec.createMany({
    data: [
      { ma_nguoi_dung: staffKho.id, ma_don_hang: donHangIds[5], loai_nhiem_vu: "DONG_GOI", trang_thai: "DANG_THUC_HIEN", thoi_gian_giao: subtractDays(today, 1) },
      { ma_nguoi_dung: staffKho.id, ma_don_hang: donHangIds[6], loai_nhiem_vu: "DONG_GOI", trang_thai: "DANG_THUC_HIEN", thoi_gian_giao: subtractDays(today, 1) },
      { ma_nguoi_dung: staffGH.id, ma_don_hang: donHangIds[15], loai_nhiem_vu: "GIAO_HANG", trang_thai: "DANG_THUC_HIEN", thoi_gian_giao: subtractDays(today, 2) },
      { ma_nguoi_dung: staffGH.id, ma_don_hang: donHangIds[16], loai_nhiem_vu: "GIAO_HANG", trang_thai: "DANG_THUC_HIEN", thoi_gian_giao: subtractDays(today, 2) },
      { ma_nguoi_dung: staffGH.id, ma_don_hang: donHangIds[17], loai_nhiem_vu: "GIAO_HANG", trang_thai: "DANG_THUC_HIEN", thoi_gian_giao: subtractDays(today, 1) },
      { ma_nguoi_dung: thukho1.id, ma_don_hang: donHangIds[10], loai_nhiem_vu: "KIEM_TRA", trang_thai: "HOAN_THANH", thoi_gian_giao: subtractDays(today, 5), thoi_gian_hoan_thanh: subtractDays(today, 4) },
      { ma_nguoi_dung: thukho1.id, ma_don_hang: donHangIds[11], loai_nhiem_vu: "KIEM_TRA", trang_thai: "HOAN_THANH", thoi_gian_giao: subtractDays(today, 4), thoi_gian_hoan_thanh: subtractDays(today, 3) },
      { ma_nguoi_dung: staffKho.id, ma_don_hang: donHangIds[7], loai_nhiem_vu: "DONG_GOI", trang_thai: "CHUA_THUC_HIEN", thoi_gian_giao: today },
      { ma_nguoi_dung: staffKho.id, ma_don_hang: donHangIds[8], loai_nhiem_vu: "DONG_GOI", trang_thai: "CHUA_THUC_HIEN", thoi_gian_giao: today },
      { ma_nguoi_dung: staffGH.id, ma_don_hang: donHangIds[18], loai_nhiem_vu: "GIAO_HANG", trang_thai: "CHUA_THUC_HIEN", thoi_gian_giao: today },
      { ma_nguoi_dung: thukho2.id, ma_don_hang: donHangIds[12], loai_nhiem_vu: "KIEM_TRA", trang_thai: "DANG_THUC_HIEN", thoi_gian_giao: subtractDays(today, 1) },
      { ma_nguoi_dung: staffGH.id, ma_don_hang: donHangIds[25], loai_nhiem_vu: "GIAO_HANG", trang_thai: "HOAN_THANH", thoi_gian_giao: subtractDays(today, 10), thoi_gian_hoan_thanh: subtractDays(today, 8) },
      { ma_nguoi_dung: staffGH.id, ma_don_hang: donHangIds[26], loai_nhiem_vu: "GIAO_HANG", trang_thai: "HOAN_THANH", thoi_gian_giao: subtractDays(today, 9), thoi_gian_hoan_thanh: subtractDays(today, 7) },
      { ma_nguoi_dung: staffKho.id, ma_don_hang: donHangIds[27], loai_nhiem_vu: "DONG_GOI", trang_thai: "HOAN_THANH", thoi_gian_giao: subtractDays(today, 12), thoi_gian_hoan_thanh: subtractDays(today, 11) },
      { ma_nguoi_dung: thukho1.id, ma_don_hang: donHangIds[30], loai_nhiem_vu: "KIEM_TRA", trang_thai: "HOAN_THANH", thoi_gian_giao: subtractDays(today, 8), thoi_gian_hoan_thanh: subtractDays(today, 7) },
    ],
  });

  // ══════════════════════════════════════════════════════════════════
  // 21. SẢN PHẨM YÊU THÍCH + GIỎ HÀNG + LỊCH SỬ ĐĂNG NHẬP
  // ══════════════════════════════════════════════════════════════════
  console.log("❤️  [21] Yêu thích, giỏ hàng, đăng nhập...");

  // Sản phẩm yêu thích
  await prisma.san_pham_yeu_thich.createMany({
    data: [
      { ma_nguoi_dung: kh1.id, ma_san_pham: sanPhamIds[0] },
      { ma_nguoi_dung: kh1.id, ma_san_pham: sanPhamIds[5] },
      { ma_nguoi_dung: kh1.id, ma_san_pham: sanPhamIds[11] },
      { ma_nguoi_dung: kh2.id, ma_san_pham: sanPhamIds[7] },
      { ma_nguoi_dung: kh2.id, ma_san_pham: sanPhamIds[15] },
      { ma_nguoi_dung: kh3.id, ma_san_pham: sanPhamIds[9] },
      { ma_nguoi_dung: kh3.id, ma_san_pham: sanPhamIds[23] },
      { ma_nguoi_dung: kh4.id, ma_san_pham: sanPhamIds[11] },
      { ma_nguoi_dung: kh4.id, ma_san_pham: sanPhamIds[16] },
      { ma_nguoi_dung: kh5.id, ma_san_pham: sanPhamIds[4] },
      { ma_nguoi_dung: kh6.id, ma_san_pham: sanPhamIds[10] },
      { ma_nguoi_dung: kh7.id, ma_san_pham: sanPhamIds[20] },
      { ma_nguoi_dung: kh8.id, ma_san_pham: sanPhamIds[15] },
      { ma_nguoi_dung: kh9.id, ma_san_pham: sanPhamIds[29] },
      { ma_nguoi_dung: kh10.id, ma_san_pham: sanPhamIds[24] },
    ],
  });

  // Giỏ hàng
  const gh1 = await prisma.gio_hang.create({ data: { ma_nguoi_dung: kh1.id } });
  const gh2 = await prisma.gio_hang.create({ data: { ma_nguoi_dung: kh4.id } });
  const gh3 = await prisma.gio_hang.create({ data: { ma_nguoi_dung: kh7.id } });

  await prisma.chi_tiet_gio_hang.createMany({
    data: [
      { ma_gio_hang: gh1.id, ma_bien_the: bienTheIds[0], so_luong: 3 },
      { ma_gio_hang: gh1.id, ma_bien_the: bienTheIds[10], so_luong: 1 },
      { ma_gio_hang: gh1.id, ma_bien_the: bienTheIds[22], so_luong: 2 },
      { ma_gio_hang: gh2.id, ma_bien_the: bienTheIds[5], so_luong: 2 },
      { ma_gio_hang: gh2.id, ma_bien_the: bienTheIds[15], so_luong: 1 },
      { ma_gio_hang: gh3.id, ma_bien_the: bienTheIds[30], so_luong: 1 },
      { ma_gio_hang: gh3.id, ma_bien_the: bienTheIds[8], so_luong: 4 },
    ],
  });

  // Lịch sử đăng nhập
  const devices = [
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) AppleWebKit/605.1.15 Mobile Safari/604.1",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Linux; Android 14) Chrome/120.0.6099.43 Mobile Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) Safari/605.1.15",
  ];
  const loginData = [];
  for (let i = 0; i < 30; i++) {
    const userIdx = i % (khachHangs.length + 4);
    const userId = userIdx < khachHangs.length ? khachHangs[userIdx].id : [admin1, staffKho, thukho1, ketoan][userIdx - khachHangs.length].id;
    loginData.push({
      ma_nguoi_dung: userId,
      thoi_gian_dang_nhap: subtractDays(today, Math.floor(Math.random() * 30)),
      thiet_bi: devices[i % devices.length],
    });
  }
  await prisma.lich_su_dang_nhap.createMany({ data: loginData });

  // ══════════════════════════════════════════════════════════════════
  // 22. HỢP ĐỒNG NCC + CÔNG NỢ + ĐÁNH GIÁ GIAO HÀNG
  // ══════════════════════════════════════════════════════════════════
  console.log("📝 [22] Hợp đồng, công nợ NCC...");

  // Hợp đồng NCC
  await prisma.hop_dong_ncc.createMany({
    data: [
      { ma_ncc: nccList[0].id, so_hop_dong: "HD-2022-001", loai_hop_dong: "DAI_HAN", ngay_ky: new Date("2022-01-15"), ngay_het_han: new Date("2025-01-15"), gia_tri_hop_dong: 500000000, trang_thai: "HET_HAN" },
      { ma_ncc: nccList[0].id, so_hop_dong: "HD-2025-001", loai_hop_dong: "DAI_HAN", ngay_ky: new Date("2025-01-20"), ngay_het_han: new Date("2028-01-20"), gia_tri_hop_dong: 800000000, trang_thai: "HIEU_LUC" },
      { ma_ncc: nccList[1].id, so_hop_dong: "HD-2023-002", loai_hop_dong: "DAI_HAN", ngay_ky: new Date("2023-06-01"), ngay_het_han: new Date("2026-06-01"), gia_tri_hop_dong: 300000000, trang_thai: "HIEU_LUC" },
      { ma_ncc: nccList[2].id, so_hop_dong: "HD-2023-003", loai_hop_dong: "DAI_HAN", ngay_ky: new Date("2023-09-01"), ngay_het_han: new Date("2026-09-01"), gia_tri_hop_dong: 600000000, trang_thai: "HIEU_LUC" },
      { ma_ncc: nccList[3].id, so_hop_dong: "HD-2024-004", loai_hop_dong: "NGAN_HAN", ngay_ky: new Date("2024-02-01"), ngay_het_han: new Date("2025-08-01"), gia_tri_hop_dong: 200000000, trang_thai: "HIEU_LUC" },
      { ma_ncc: nccList[4].id, so_hop_dong: "HD-2024-005", loai_hop_dong: "NGAN_HAN", ngay_ky: new Date("2024-05-15"), ngay_het_han: new Date("2025-11-15"), gia_tri_hop_dong: 150000000, trang_thai: "HIEU_LUC" },
      { ma_ncc: nccList[5].id, so_hop_dong: "HD-2023-006", loai_hop_dong: "DAI_HAN", ngay_ky: new Date("2023-11-01"), ngay_het_han: new Date("2026-11-01"), gia_tri_hop_dong: 400000000, trang_thai: "HIEU_LUC" },
      { ma_ncc: nccList[6].id, so_hop_dong: "HD-2024-007", loai_hop_dong: "NGAN_HAN", ngay_ky: new Date("2024-08-01"), ngay_het_han: new Date("2025-08-01"), gia_tri_hop_dong: 250000000, trang_thai: "HIEU_LUC" },
    ],
  });

  // Công nợ NCC
  await prisma.cong_no_ncc.createMany({
    data: [
      { ma_ncc: nccList[0].id, loai_giao_dich: "NHAP_HANG", so_tien: 15000000, so_du_sau: 15000000, phuong_thuc: "CHUA_THANH_TOAN", ghi_chu: "Phiếu nhập #1", ngay_giao_dich: subtractDays(today, 30) },
      { ma_ncc: nccList[0].id, loai_giao_dich: "THANH_TOAN", so_tien: -15000000, so_du_sau: 0, phuong_thuc: "CHUYEN_KHOAN", ma_giao_dich: "TK20250410001", ghi_chu: "Thanh toán phiếu nhập #1", ngay_giao_dich: subtractDays(today, 15) },
      { ma_ncc: nccList[0].id, loai_giao_dich: "NHAP_HANG", so_tien: 22000000, so_du_sau: 22000000, phuong_thuc: "CHUA_THANH_TOAN", ghi_chu: "Phiếu nhập #5", ngay_giao_dich: subtractDays(today, 5) },
      { ma_ncc: nccList[1].id, loai_giao_dich: "NHAP_HANG", so_tien: 8000000, so_du_sau: 8000000, phuong_thuc: "CHUA_THANH_TOAN", ghi_chu: "Phiếu nhập #2", ngay_giao_dich: subtractDays(today, 20) },
      { ma_ncc: nccList[2].id, loai_giao_dich: "NHAP_HANG", so_tien: 35000000, so_du_sau: 35000000, phuong_thuc: "CHUA_THANH_TOAN", ghi_chu: "Phiếu nhập #3", ngay_giao_dich: subtractDays(today, 25) },
      { ma_ncc: nccList[2].id, loai_giao_dich: "THANH_TOAN", so_tien: -20000000, so_du_sau: 15000000, phuong_thuc: "CHUYEN_KHOAN", ma_giao_dich: "TK20250420002", ghi_chu: "Thanh toán 1 phần", ngay_giao_dich: subtractDays(today, 10) },
      { ma_ncc: nccList[3].id, loai_giao_dich: "NHAP_HANG", so_tien: 12000000, so_du_sau: 12000000, phuong_thuc: "CHUA_THANH_TOAN", ghi_chu: "Phiếu nhập #4", ngay_giao_dich: subtractDays(today, 15) },
      { ma_ncc: nccList[4].id, loai_giao_dich: "NHAP_HANG", so_tien: 5500000, so_du_sau: 5500000, phuong_thuc: "CHUA_THANH_TOAN", ghi_chu: "Phiếu nhập #6", ngay_giao_dich: subtractDays(today, 8) },
      { ma_ncc: nccList[5].id, loai_giao_dich: "NHAP_HANG", so_tien: 18000000, so_du_sau: 18000000, phuong_thuc: "CHUA_THANH_TOAN", ghi_chu: "Phiếu nhập #7", ngay_giao_dich: subtractDays(today, 12) },
      { ma_ncc: nccList[5].id, loai_giao_dich: "THANH_TOAN", so_tien: -18000000, so_du_sau: 0, phuong_thuc: "TIEN_MAT", ghi_chu: "Thanh toán tiền mặt", ngay_giao_dich: subtractDays(today, 3) },
    ],
  });

  // Đánh giá giao hàng NCC
  const phieuNhapList = await prisma.phieu_nhap_kho.findMany({ take: 8 });
  for (let i = 0; i < Math.min(8, phieuNhapList.length); i++) {
    await prisma.danh_gia_giao_hang_ncc.create({
      data: {
        ma_phieu_nhap: phieuNhapList[i].id,
        ma_ncc: nccList[i % nccList.length].id,
        nguoi_danh_gia_id: thukho1.id,
        diem_chat_luong: 3 + Math.floor(Math.random() * 3),
        diem_dung_so_luong: 4 + Math.floor(Math.random() * 2),
        diem_dung_han: 3 + Math.floor(Math.random() * 3),
        diem_bao_goi: 4 + Math.floor(Math.random() * 2),
        diem_trung_binh: 4.0 + Math.random() * 0.8,
        co_van_de: i === 3,
        mo_ta_van_de: i === 3 ? "Hàng giao thiếu 5 đơn vị so với phiếu nhập" : null,
      },
    });
  }

  // ══════════════════════════════════════════════════════════════════
  // 23. CẢNH BÁO LÔ HÀNG
  // ══════════════════════════════════════════════════════════════════
  console.log("⚠️  [23] Cảnh báo lô hàng...");

  const loHangGanHetHan = await prisma.lo_hang.findMany({ where: { trang_thai: "GAN_HET_HAN" }, take: 5 });
  for (const lh of loHangGanHetHan) {
    await prisma.canh_bao_lo_hang.create({
      data: {
        ma_lo_hang: lh.id,
        loai_canh_bao: "GAN_HET_HAN",
        so_ngay_con: Math.floor((lh.han_su_dung.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
        da_xu_ly: false,
      },
    });
  }

  // ══════════════════════════════════════════════════════════════════
  // DONE
  // ══════════════════════════════════════════════════════════════════
  console.log("\n✅ SEED HOÀN TẤT!");
  console.log("   - 20 người dùng (2 admin, 4 staff, 2 thủ kho, 12 khách hàng)");
  console.log("   - 10 danh mục + 11 danh mục con");
  console.log("   - 30 sản phẩm + 70+ biến thể");
  console.log("   - 8 nhà cung cấp + hợp đồng + công nợ");
  console.log("   - 50 đơn hàng + chi tiết + lịch sử");
  console.log("   - 3 kho + 54 vị trí + 25 lô hàng");
  console.log("   - 40 đánh giá sản phẩm");
  console.log("   - 30 ngày chấm công + phân ca");
  console.log("   - 18 tháng lương");
  console.log("   - 5 phiên chat AI");
  console.log("   - 5 yêu cầu đổi trả");
  console.log("   - 15 thông báo + 6 banner");
  console.log("   - 10 mã giảm giá");
}

main()
  .catch((e) => {
    console.error("❌ Lỗi:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
