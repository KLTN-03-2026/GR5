/**
 * SEED TOÀN BỘ DỮ LIỆU - Bao phủ tất cả bảng trong schema
 * Chạy: npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed-full.ts
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

async function main() {
  console.log("🚀 Bắt đầu seed TOÀN BỘ dữ liệu...\n");

  const password = await bcrypt.hash("123456", 10);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // ══════════════════════════════════════════════════════════════════
  // 0. XÓA TOÀN BỘ DỮ LIỆU CŨ (thứ tự: con trước, cha sau)
  // ══════════════════════════════════════════════════════════════════
  console.log("🧹 [0/20] Xóa dữ liệu cũ...");

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
  await prisma.bien_the_san_pham.deleteMany();
  await prisma.ncc_san_pham.deleteMany();
  await prisma.san_pham.deleteMany();
  await prisma.danh_muc.deleteMany();
  await prisma.cong_no_ncc.deleteMany();
  await prisma.lich_dat_hang_ncc.deleteMany();
  await prisma.hop_dong_ncc.deleteMany();
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

  console.log("   ✓ Đã xóa sạch toàn bộ dữ liệu cũ");

  // ══════════════════════════════════════════════════════════════════
  // 1. PHÂN HỆ HỆ THỐNG & CHỨC NĂNG & QUYỀN HẠN & CHI TIẾT PHÂN QUYỀN
  // ══════════════════════════════════════════════════════════════════
  console.log("📦 [1/20] Tạo phân hệ, chức năng, quyền hạn...");

  const phanHeList = await Promise.all([
    prisma.phan_he_he_thong.create({ data: { ten_phan_he: "Quản lý sản phẩm", mo_ta: "CRUD sản phẩm, danh mục, biến thể" } }),
    prisma.phan_he_he_thong.create({ data: { ten_phan_he: "Quản lý kho", mo_ta: "Nhập/xuất/kiểm kê kho" } }),
    prisma.phan_he_he_thong.create({ data: { ten_phan_he: "Quản lý đơn hàng", mo_ta: "Xử lý đơn hàng, vận chuyển" } }),
    prisma.phan_he_he_thong.create({ data: { ten_phan_he: "Quản lý nhân sự", mo_ta: "Chấm công, phân ca, lương" } }),
    prisma.phan_he_he_thong.create({ data: { ten_phan_he: "Quản lý tài chính", mo_ta: "Thanh toán, hoàn tiền, công nợ" } }),
    prisma.phan_he_he_thong.create({ data: { ten_phan_he: "Quản lý NCC", mo_ta: "Nhà cung cấp, hợp đồng" } }),
    prisma.phan_he_he_thong.create({ data: { ten_phan_he: "Báo cáo & Thống kê", mo_ta: "Dashboards, reports" } }),
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
    prisma.chuc_nang_he_thong.create({ data: { ma_phan_he: phanHeList[3].id, ten_chuc_nang: "Phân ca" } }),
    prisma.chuc_nang_he_thong.create({ data: { ma_phan_he: phanHeList[4].id, ten_chuc_nang: "Thanh toán" } }),
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
  const adminRole = await prisma.vai_tro.upsert({ where: { ten_vai_tro: "ADMIN" }, create: { ten_vai_tro: "ADMIN", mo_ta: "Quản trị viên toàn quyền" }, update: {} });
  const staffRole = await prisma.vai_tro.upsert({ where: { ten_vai_tro: "STAFF" }, create: { ten_vai_tro: "STAFF", mo_ta: "Nhân viên vận hành" }, update: {} });
  const thuKhoRole = await prisma.vai_tro.upsert({ where: { ten_vai_tro: "THU_KHO" }, create: { ten_vai_tro: "THU_KHO", mo_ta: "Thủ kho" }, update: {} });
  const khachHangRole = await prisma.vai_tro.upsert({ where: { ten_vai_tro: "KHACH_HANG" }, create: { ten_vai_tro: "KHACH_HANG", mo_ta: "Khách hàng" }, update: {} });

  // Admin full quyền
  for (const cn of chucNangList) {
    for (const q of quyenHanList) {
      await prisma.chi_tiet_phan_quyen.upsert({
        where: { ma_vai_tro_ma_chuc_nang_ma_quyen: { ma_vai_tro: adminRole.id, ma_chuc_nang: cn.id, ma_quyen: q.id } },
        create: { ma_vai_tro: adminRole.id, ma_chuc_nang: cn.id, ma_quyen: q.id },
        update: {},
      });
    }
  }
  // Staff: XEM + THEM tất cả, SUA một số
  for (const cn of chucNangList) {
    await prisma.chi_tiet_phan_quyen.upsert({
      where: { ma_vai_tro_ma_chuc_nang_ma_quyen: { ma_vai_tro: staffRole.id, ma_chuc_nang: cn.id, ma_quyen: quyenHanList[0].id } },
      create: { ma_vai_tro: staffRole.id, ma_chuc_nang: cn.id, ma_quyen: quyenHanList[0].id },
      update: {},
    });
  }
  // Thu kho: Kho quyền đầy đủ
  for (const cn of chucNangList.filter((_, i) => i >= 2 && i <= 4)) {
    for (const q of quyenHanList) {
      await prisma.chi_tiet_phan_quyen.upsert({
        where: { ma_vai_tro_ma_chuc_nang_ma_quyen: { ma_vai_tro: thuKhoRole.id, ma_chuc_nang: cn.id, ma_quyen: q.id } },
        create: { ma_vai_tro: thuKhoRole.id, ma_chuc_nang: cn.id, ma_quyen: q.id },
        update: {},
      });
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // 2. NGƯỜI DÙNG (Admin, Staff, Thủ kho, Khách hàng)
  // ══════════════════════════════════════════════════════════════════
  console.log("👥 [2/20] Tạo người dùng...");

  const admin = await prisma.nguoi_dung.upsert({
    where: { email: "admin@nongsan.vn" },
    create: { email: "admin@nongsan.vn", mat_khau: password, trang_thai: 1 },
    update: { mat_khau: password },
  });
  await prisma.ho_so_nguoi_dung.upsert({
    where: { ma_nguoi_dung: admin.id },
    create: { ma_nguoi_dung: admin.id, ho_ten: "Admin Hệ Thống", chuc_vu: "Quản Trị Viên", bo_phan: "Ban Giám Đốc", so_dien_thoai: "0900000001", cccd: "079000000001", ngay_sinh: new Date("1985-05-20"), gioi_tinh: "Nam", ngay_vao_lam: new Date("2020-01-01"), loai_hop_dong: "CHINH_THUC", hop_dong_het_han: new Date("2030-12-31"), luong_theo_gio: 100000 },
    update: {},
  });
  await prisma.vai_tro_nguoi_dung.upsert({
    where: { ma_nguoi_dung_ma_vai_tro: { ma_nguoi_dung: admin.id, ma_vai_tro: adminRole.id } },
    create: { ma_nguoi_dung: admin.id, ma_vai_tro: adminRole.id },
    update: {},
  });

  const staff = await prisma.nguoi_dung.upsert({
    where: { email: "staff@nongsan.vn" },
    create: { email: "staff@nongsan.vn", mat_khau: password, trang_thai: 1 },
    update: { mat_khau: password },
  });
  await prisma.ho_so_nguoi_dung.upsert({
    where: { ma_nguoi_dung: staff.id },
    create: { ma_nguoi_dung: staff.id, ho_ten: "Nguyễn Văn Staff", chuc_vu: "Nhân Viên Kho", bo_phan: "Kho Vận", so_dien_thoai: "0900000002", cccd: "079000000002", ngay_sinh: new Date("1992-08-15"), gioi_tinh: "Nam", ngay_vao_lam: new Date("2023-03-01"), loai_hop_dong: "CHINH_THUC", hop_dong_het_han: new Date("2027-03-01"), luong_theo_gio: 35000 },
    update: {},
  });
  await prisma.vai_tro_nguoi_dung.upsert({
    where: { ma_nguoi_dung_ma_vai_tro: { ma_nguoi_dung: staff.id, ma_vai_tro: staffRole.id } },
    create: { ma_nguoi_dung: staff.id, ma_vai_tro: staffRole.id },
    update: {},
  });

  const thukho = await prisma.nguoi_dung.upsert({
    where: { email: "thukho@nongsan.vn" },
    create: { email: "thukho@nongsan.vn", mat_khau: password, trang_thai: 1 },
    update: { mat_khau: password },
  });
  await prisma.ho_so_nguoi_dung.upsert({
    where: { ma_nguoi_dung: thukho.id },
    create: { ma_nguoi_dung: thukho.id, ho_ten: "Trần Văn Thủ Kho", chuc_vu: "Thủ Kho", bo_phan: "Kho Vận", so_dien_thoai: "0900000003", cccd: "079000000003", ngay_sinh: new Date("1988-12-01"), gioi_tinh: "Nam", ngay_vao_lam: new Date("2022-06-01"), loai_hop_dong: "CHINH_THUC", hop_dong_het_han: new Date("2028-06-01"), luong_theo_gio: 45000 },
    update: {},
  });
  await prisma.vai_tro_nguoi_dung.upsert({
    where: { ma_nguoi_dung_ma_vai_tro: { ma_nguoi_dung: thukho.id, ma_vai_tro: thuKhoRole.id } },
    create: { ma_nguoi_dung: thukho.id, ma_vai_tro: thuKhoRole.id },
    update: {},
  });

  // Khách hàng
  const kh1 = await prisma.nguoi_dung.upsert({
    where: { email: "khach1@gmail.com" },
    create: { email: "khach1@gmail.com", mat_khau: password, trang_thai: 1 },
    update: { mat_khau: password },
  });
  await prisma.ho_so_nguoi_dung.upsert({
    where: { ma_nguoi_dung: kh1.id },
    create: { ma_nguoi_dung: kh1.id, ho_ten: "Lê Thị Hồng", so_dien_thoai: "0911111111", gioi_tinh: "Nữ", ngay_sinh: new Date("1995-03-10") },
    update: {},
  });
  await prisma.vai_tro_nguoi_dung.upsert({
    where: { ma_nguoi_dung_ma_vai_tro: { ma_nguoi_dung: kh1.id, ma_vai_tro: khachHangRole.id } },
    create: { ma_nguoi_dung: kh1.id, ma_vai_tro: khachHangRole.id },
    update: {},
  });

  const kh2 = await prisma.nguoi_dung.upsert({
    where: { email: "khach2@gmail.com" },
    create: { email: "khach2@gmail.com", mat_khau: password, trang_thai: 1 },
    update: { mat_khau: password },
  });
  await prisma.ho_so_nguoi_dung.upsert({
    where: { ma_nguoi_dung: kh2.id },
    create: { ma_nguoi_dung: kh2.id, ho_ten: "Phạm Minh Tuấn", so_dien_thoai: "0922222222", gioi_tinh: "Nam", ngay_sinh: new Date("1990-07-25") },
    update: {},
  });
  await prisma.vai_tro_nguoi_dung.upsert({
    where: { ma_nguoi_dung_ma_vai_tro: { ma_nguoi_dung: kh2.id, ma_vai_tro: khachHangRole.id } },
    create: { ma_nguoi_dung: kh2.id, ma_vai_tro: khachHangRole.id },
    update: {},
  });

  const kh3 = await prisma.nguoi_dung.upsert({
    where: { email: "khach3@gmail.com" },
    create: { email: "khach3@gmail.com", mat_khau: password, trang_thai: 1 },
    update: { mat_khau: password },
  });
  await prisma.ho_so_nguoi_dung.upsert({
    where: { ma_nguoi_dung: kh3.id },
    create: { ma_nguoi_dung: kh3.id, ho_ten: "Võ Thị Mai Lan", so_dien_thoai: "0933333333", gioi_tinh: "Nữ", ngay_sinh: new Date("1998-11-05") },
    update: {},
  });
  await prisma.vai_tro_nguoi_dung.upsert({
    where: { ma_nguoi_dung_ma_vai_tro: { ma_nguoi_dung: kh3.id, ma_vai_tro: khachHangRole.id } },
    create: { ma_nguoi_dung: kh3.id, ma_vai_tro: khachHangRole.id },
    update: {},
  });

  // ══════════════════════════════════════════════════════════════════
  // 3. ĐỊA CHỈ NGƯỜI DÙNG
  // ══════════════════════════════════════════════════════════════════
  console.log("📍 [3/20] Tạo địa chỉ người dùng...");

  await prisma.dia_chi_nguoi_dung.createMany({
    data: [
      { ma_nguoi_dung: kh1.id, ho_ten: "Lê Thị Hồng", so_dien_thoai: "0911111111", chi_tiet_dia_chi: "123 Nguyễn Huệ, Phường Bến Nghé, Quận 1", tinh_thanh: "Hồ Chí Minh", quan_huyen: "Quận 1", phuong_xa: "Phường Bến Nghé", ma_tinh_ghn: 202, ma_quan_huyen_ghn: 1442, ma_phuong_xa_ghn: "20305", la_mac_dinh: true },
      { ma_nguoi_dung: kh1.id, ho_ten: "Lê Thị Hồng", so_dien_thoai: "0911111111", chi_tiet_dia_chi: "456 Lê Lợi, Phường 6, Quận 3", tinh_thanh: "Hồ Chí Minh", quan_huyen: "Quận 3", phuong_xa: "Phường 6", ma_tinh_ghn: 202, ma_quan_huyen_ghn: 1444, ma_phuong_xa_ghn: "20401", la_mac_dinh: false },
      { ma_nguoi_dung: kh2.id, ho_ten: "Phạm Minh Tuấn", so_dien_thoai: "0922222222", chi_tiet_dia_chi: "789 Trần Hưng Đạo, Phường Cầu Kho, Quận 1", tinh_thanh: "Hồ Chí Minh", quan_huyen: "Quận 1", phuong_xa: "Phường Cầu Kho", ma_tinh_ghn: 202, ma_quan_huyen_ghn: 1442, ma_phuong_xa_ghn: "20308", la_mac_dinh: true },
      { ma_nguoi_dung: kh3.id, ho_ten: "Võ Thị Mai Lan", so_dien_thoai: "0933333333", chi_tiet_dia_chi: "12 Hải Phòng, Phường Thạch Thang, Quận Hải Châu", tinh_thanh: "Đà Nẵng", quan_huyen: "Quận Hải Châu", phuong_xa: "Phường Thạch Thang", ma_tinh_ghn: 203, ma_quan_huyen_ghn: 1527, ma_phuong_xa_ghn: "40101", la_mac_dinh: true },
      { ma_nguoi_dung: kh3.id, ho_ten: "Võ Văn Bảy (Chồng)", so_dien_thoai: "0944444444", chi_tiet_dia_chi: "56 Nguyễn Chí Thanh, Phường Hải Châu 1, Quận Hải Châu", tinh_thanh: "Đà Nẵng", quan_huyen: "Quận Hải Châu", phuong_xa: "Phường Hải Châu 1", ma_tinh_ghn: 203, ma_quan_huyen_ghn: 1527, ma_phuong_xa_ghn: "40102", la_mac_dinh: false },
    ],
  });

  // ══════════════════════════════════════════════════════════════════
  // 4. DANH MỤC
  // ══════════════════════════════════════════════════════════════════
  console.log("📂 [4/20] Tạo danh mục...");

  const dmRau = await prisma.danh_muc.create({ data: { ten_danh_muc: "Rau củ" } });
  const dmTraiCay = await prisma.danh_muc.create({ data: { ten_danh_muc: "Trái cây" } });
  const dmGao = await prisma.danh_muc.create({ data: { ten_danh_muc: "Gạo & Ngũ cốc" } });
  const dmNam = await prisma.danh_muc.create({ data: { ten_danh_muc: "Nấm tươi" } });
  const dmGiaVi = await prisma.danh_muc.create({ data: { ten_danh_muc: "Gia vị & Mật ong" } });
  const dmHat = await prisma.danh_muc.create({ data: { ten_danh_muc: "Hạt & Đậu" } });
  const dmCuQua = await prisma.danh_muc.create({ data: { ten_danh_muc: "Củ & Quả" } });
  const dmTraHoa = await prisma.danh_muc.create({ data: { ten_danh_muc: "Trà & Hoa thảo mộc" } });

  // Danh mục con
  await prisma.danh_muc.createMany({
    data: [
      { ten_danh_muc: "Rau lá xanh", ma_danh_muc_cha: dmRau.id },
      { ten_danh_muc: "Rau quả", ma_danh_muc_cha: dmRau.id },
      { ten_danh_muc: "Trái cây nhiệt đới", ma_danh_muc_cha: dmTraiCay.id },
      { ten_danh_muc: "Trái cây ôn đới", ma_danh_muc_cha: dmTraiCay.id },
    ],
  });

  // ══════════════════════════════════════════════════════════════════
  // 5. THẺ TỪ KHÓA
  // ══════════════════════════════════════════════════════════════════
  console.log("🏷️  [5/20] Tạo thẻ từ khóa...");

  const theList = await Promise.all([
    prisma.the_tu_khoa.create({ data: { ten_the: "huu-co" } }),
    prisma.the_tu_khoa.create({ data: { ten_the: "vietgap" } }),
    prisma.the_tu_khoa.create({ data: { ten_the: "khong-thuoc-tru-sau" } }),
    prisma.the_tu_khoa.create({ data: { ten_the: "nhap-khau" } }),
    prisma.the_tu_khoa.create({ data: { ten_the: "dac-san" } }),
    prisma.the_tu_khoa.create({ data: { ten_the: "giam-can" } }),
    prisma.the_tu_khoa.create({ data: { ten_the: "tang-suc-de-khang" } }),
    prisma.the_tu_khoa.create({ data: { ten_the: "thuan-chay" } }),
  ]);

  // ══════════════════════════════════════════════════════════════════
  // 6. NHÀ CUNG CẤP ĐẦY ĐỦ THÔNG TIN
  // ══════════════════════════════════════════════════════════════════
  console.log("🏭 [6/20] Tạo nhà cung cấp...");

  const ncc1 = await prisma.nha_cung_cap.create({
    data: {
      ten_ncc: "Nông trại Xanh Đà Lạt", ma_ncc: "NCC-001", so_dien_thoai: "0901234567", email: "contact@xanhdalat.vn",
      dia_chi: "Phường 5, TP. Đà Lạt, Lâm Đồng", tinh_thanh: "Lâm Đồng",
      nguoi_lien_he: "Nguyễn Văn Lâm", zalo: "0901234567",
      ma_so_thue: "5801234567", so_tai_khoan: "1234567890", ten_ngan_hang: "Vietcombank",
      loai_ncc: "NONG_TRAI", hinh_thuc_thanh_toan: "CHUYEN_KHOAN", chu_ky_thanh_toan: "NET_30",
      co_hoa_don_vat: true, diem_uy_tin: 9.2, trang_thai: "DANG_HOP_TAC",
      ngay_bat_dau_hop_tac: new Date("2023-01-15"),
      ghi_chu_noi_bo: "NCC chính cung cấp rau sạch. Giao hàng đúng hạn.",
    },
  });

  const ncc2 = await prisma.nha_cung_cap.create({
    data: {
      ten_ncc: "HTX Nông nghiệp Gia Lai", ma_ncc: "NCC-002", so_dien_thoai: "0907654321", email: "htx@gialai.vn",
      dia_chi: "Pleiku, Gia Lai", tinh_thanh: "Gia Lai",
      nguoi_lien_he: "Trần Hữu Phước", zalo: "0907654321",
      ma_so_thue: "6401234568", so_tai_khoan: "9876543210", ten_ngan_hang: "Agribank",
      loai_ncc: "HOP_TAC_XA", hinh_thuc_thanh_toan: "CHUYEN_KHOAN", chu_ky_thanh_toan: "NET_15",
      co_hoa_don_vat: true, diem_uy_tin: 8.5, trang_thai: "DANG_HOP_TAC",
      ngay_bat_dau_hop_tac: new Date("2023-06-01"),
    },
  });

  const ncc3 = await prisma.nha_cung_cap.create({
    data: {
      ten_ncc: "HTX Lúa Gạo Sóc Trăng", ma_ncc: "NCC-003", so_dien_thoai: "0912345678", email: "gao@soctrang.vn",
      dia_chi: "Mỹ Xuyên, Sóc Trăng", tinh_thanh: "Sóc Trăng",
      nguoi_lien_he: "Lê Văn Gạo", zalo: "0912345678",
      ma_so_thue: "8301234569", so_tai_khoan: "1122334455", ten_ngan_hang: "BIDV",
      loai_ncc: "HOP_TAC_XA", hinh_thuc_thanh_toan: "TIEN_MAT", chu_ky_thanh_toan: "COD",
      co_hoa_don_vat: false, diem_uy_tin: 7.8, trang_thai: "DANG_HOP_TAC",
      ngay_bat_dau_hop_tac: new Date("2024-02-01"),
    },
  });

  const ncc4 = await prisma.nha_cung_cap.create({
    data: {
      ten_ncc: "Vườn Cây Tiền Giang", ma_ncc: "NCC-004", so_dien_thoai: "0934567890", email: "vuon@tiengiang.vn",
      dia_chi: "Cái Bè, Tiền Giang", tinh_thanh: "Tiền Giang",
      nguoi_lien_he: "Nguyễn Thị Xoài",
      loai_ncc: "NONG_TRAI", hinh_thuc_thanh_toan: "CHUYEN_KHOAN", chu_ky_thanh_toan: "NET_7",
      co_hoa_don_vat: true, diem_uy_tin: 8.0, trang_thai: "DANG_HOP_TAC",
      ngay_bat_dau_hop_tac: new Date("2024-05-15"),
    },
  });

  const ncc5 = await prisma.nha_cung_cap.create({
    data: {
      ten_ncc: "Trang trại Mật Ong Phú Quốc", ma_ncc: "NCC-005", so_dien_thoai: "0945678901", email: "matong@phuquoc.vn",
      dia_chi: "Phú Quốc, Kiên Giang", tinh_thanh: "Kiên Giang",
      nguoi_lien_he: "Phạm Văn Ong",
      loai_ncc: "NONG_TRAI", hinh_thuc_thanh_toan: "CHUYEN_KHOAN", chu_ky_thanh_toan: "NET_30",
      co_hoa_don_vat: false, diem_uy_tin: 9.0, trang_thai: "DANG_HOP_TAC",
      ngay_bat_dau_hop_tac: new Date("2023-09-01"),
    },
  });

  // ══════════════════════════════════════════════════════════════════
  // 7. SẢN PHẨM ĐẦY ĐỦ (20 sản phẩm + thẻ)
  // ══════════════════════════════════════════════════════════════════
  console.log("🥬 [7/20] Tạo sản phẩm...");

  const sp1 = await prisma.san_pham.create({
    data: {
      ten_san_pham: "Rau Muống Thủy Canh VietGAP", mo_ta: "Rau muống trồng thủy canh trong nhà màng, không thuốc trừ sâu.", xuat_xu: "Đà Lạt, Lâm Đồng", trang_thai: "DANG_BAN", ma_danh_muc: dmRau.id,
      seo_tieu_de: "Rau Muống Thủy Canh VietGAP - Tươi Sạch Mỗi Ngày", seo_mo_ta: "Mua rau muống thủy canh VietGAP từ Đà Lạt, giao hàng nhanh.",
      anh_san_pham: { create: [{ duong_dan_anh: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=800", la_anh_chinh: true }, { duong_dan_anh: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800", la_anh_chinh: false }] },
      chung_chi_san_pham: { create: [{ ten_chung_chi: "VietGAP" }] },
      bien_the_san_pham: { create: [
        { ten_bien_the: "Bó 300g", don_vi_tinh: "Bó", gia_ban: 18000, gia_goc: 14000, ma_sku: "RMUONG-300G" },
        { ten_bien_the: "Thùng 5kg", don_vi_tinh: "Thùng", gia_ban: 260000, gia_goc: 210000, ma_sku: "RMUONG-5KG" },
      ] },
    },
  });
  await prisma.the_san_pham.createMany({ data: [{ ma_san_pham: sp1.id, ma_the: theList[1].id }, { ma_san_pham: sp1.id, ma_the: theList[2].id }] });

  const sp2 = await prisma.san_pham.create({
    data: {
      ten_san_pham: "Cải Kale Đà Lạt Hữu Cơ", mo_ta: "Cải kale giống Lacinato, trồng hữu cơ tại Đà Lạt.", xuat_xu: "Đà Lạt, Lâm Đồng", trang_thai: "DANG_BAN", ma_danh_muc: dmRau.id,
      anh_san_pham: { create: [{ duong_dan_anh: "https://images.unsplash.com/photo-1524179091875-bf99a9a6af57?w=800", la_anh_chinh: true }] },
      chung_chi_san_pham: { create: [{ ten_chung_chi: "Hữu cơ" }, { ten_chung_chi: "VietGAP" }] },
      bien_the_san_pham: { create: [
        { ten_bien_the: "Bó 200g", don_vi_tinh: "Bó", gia_ban: 35000, gia_goc: 28000, ma_sku: "KALE-200G" },
        { ten_bien_the: "Túi 500g", don_vi_tinh: "Túi", gia_ban: 78000, gia_goc: 62000, ma_sku: "KALE-500G" },
      ] },
    },
  });
  await prisma.the_san_pham.createMany({ data: [{ ma_san_pham: sp2.id, ma_the: theList[0].id }, { ma_san_pham: sp2.id, ma_the: theList[5].id }] });

  const sp3 = await prisma.san_pham.create({
    data: {
      ten_san_pham: "Cà Chua Beef Đà Lạt VietGAP", mo_ta: "Cà chua beef trồng trong nhà kính, quả to, thịt dày.", xuat_xu: "Đà Lạt, Lâm Đồng", trang_thai: "DANG_BAN", ma_danh_muc: dmRau.id,
      anh_san_pham: { create: [{ duong_dan_anh: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=800", la_anh_chinh: true }] },
      chung_chi_san_pham: { create: [{ ten_chung_chi: "VietGAP" }] },
      bien_the_san_pham: { create: [
        { ten_bien_the: "Túi 500g", don_vi_tinh: "Túi", gia_ban: 32000, gia_goc: 25000, ma_sku: "CACHUA-500G" },
        { ten_bien_the: "Thùng 5kg", don_vi_tinh: "Thùng", gia_ban: 290000, gia_goc: 230000, ma_sku: "CACHUA-5KG" },
        { ten_bien_the: "Thùng 10kg", don_vi_tinh: "Thùng", gia_ban: 560000, gia_goc: 450000, ma_sku: "CACHUA-10KG" },
      ] },
    },
  });
  await prisma.the_san_pham.createMany({ data: [{ ma_san_pham: sp3.id, ma_the: theList[1].id }] });

  const sp4 = await prisma.san_pham.create({
    data: {
      ten_san_pham: "Súp Lơ Xanh (Broccoli) Đà Lạt", mo_ta: "Súp lơ xanh thu hoạch khi bông còn chặt, giàu chất chống oxy hóa.", xuat_xu: "Đà Lạt, Lâm Đồng", trang_thai: "DANG_BAN", ma_danh_muc: dmRau.id,
      anh_san_pham: { create: [{ duong_dan_anh: "https://images.unsplash.com/photo-1550350981-a1e8218bfa97?w=800", la_anh_chinh: true }] },
      chung_chi_san_pham: { create: [{ ten_chung_chi: "GlobalGAP" }] },
      bien_the_san_pham: { create: [
        { ten_bien_the: "Cây ~500g", don_vi_tinh: "Cây", gia_ban: 45000, gia_goc: 36000, ma_sku: "BROCCOLI-CY" },
        { ten_bien_the: "Túi 1kg", don_vi_tinh: "Túi", gia_ban: 82000, gia_goc: 65000, ma_sku: "BROCCOLI-1KG" },
      ] },
    },
  });

  const sp5 = await prisma.san_pham.create({
    data: {
      ten_san_pham: "Dâu Tây Đà Lạt Chuẩn VietGAP", mo_ta: "Dâu tây giống Nhật, quả to đều, ngọt thanh.", xuat_xu: "Đà Lạt, Lâm Đồng", trang_thai: "DANG_BAN", ma_danh_muc: dmTraiCay.id,
      anh_san_pham: { create: [{ duong_dan_anh: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800", la_anh_chinh: true }] },
      chung_chi_san_pham: { create: [{ ten_chung_chi: "VietGAP" }, { ten_chung_chi: "GlobalGAP" }] },
      bien_the_san_pham: { create: [
        { ten_bien_the: "Hộp 250g", don_vi_tinh: "Hộp", gia_ban: 85000, gia_goc: 70000, ma_sku: "DAUTAY-250G" },
        { ten_bien_the: "Hộp 500g", don_vi_tinh: "Hộp", gia_ban: 155000, gia_goc: 128000, ma_sku: "DAUTAY-500G" },
        { ten_bien_the: "Khay 1kg", don_vi_tinh: "Khay", gia_ban: 295000, gia_goc: 245000, ma_sku: "DAUTAY-1KG" },
      ] },
    },
  });
  await prisma.the_san_pham.createMany({ data: [{ ma_san_pham: sp5.id, ma_the: theList[4].id }, { ma_san_pham: sp5.id, ma_the: theList[6].id }] });

  const sp6 = await prisma.san_pham.create({
    data: {
      ten_san_pham: "Xoài Cát Hoà Lộc Tiền Giang", mo_ta: "Xoài đặc sản vỏ mỏng, thịt vàng dày, ít xơ.", xuat_xu: "Cái Bè, Tiền Giang", trang_thai: "DANG_BAN", ma_danh_muc: dmTraiCay.id,
      anh_san_pham: { create: [{ duong_dan_anh: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=800", la_anh_chinh: true }] },
      chung_chi_san_pham: { create: [{ ten_chung_chi: "VietGAP" }] },
      bien_the_san_pham: { create: [
        { ten_bien_the: "Kg lẻ", don_vi_tinh: "kg", gia_ban: 75000, gia_goc: 60000, ma_sku: "XOAI-1KG" },
        { ten_bien_the: "Thùng 5kg", don_vi_tinh: "Thùng", gia_ban: 350000, gia_goc: 285000, ma_sku: "XOAI-5KG" },
        { ten_bien_the: "Thùng 10kg", don_vi_tinh: "Thùng", gia_ban: 680000, gia_goc: 550000, ma_sku: "XOAI-10KG" },
      ] },
    },
  });
  await prisma.the_san_pham.createMany({ data: [{ ma_san_pham: sp6.id, ma_the: theList[4].id }] });

  const sp7 = await prisma.san_pham.create({
    data: {
      ten_san_pham: "Bơ Booth Đắk Lắk Cỡ Lớn", mo_ta: "Bơ sáp Đắk Lắk loại A, thịt vàng ươm, béo ngậy.", xuat_xu: "Buôn Ma Thuột, Đắk Lắk", trang_thai: "DANG_BAN", ma_danh_muc: dmTraiCay.id,
      anh_san_pham: { create: [{ duong_dan_anh: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=800", la_anh_chinh: true }] },
      bien_the_san_pham: { create: [
        { ten_bien_the: "Kg lẻ", don_vi_tinh: "kg", gia_ban: 62000, gia_goc: 50000, ma_sku: "BO-1KG" },
        { ten_bien_the: "Thùng 10kg", don_vi_tinh: "Thùng", gia_ban: 580000, gia_goc: 470000, ma_sku: "BO-10KG" },
      ] },
    },
  });

  const sp8 = await prisma.san_pham.create({
    data: {
      ten_san_pham: "Chuối Laba Đà Lạt Chín Tự Nhiên", mo_ta: "Chuối đặc sản Đà Lạt, chín tự nhiên không đất đèn.", xuat_xu: "Lạc Dương, Lâm Đồng", trang_thai: "DANG_BAN", ma_danh_muc: dmTraiCay.id,
      anh_san_pham: { create: [{ duong_dan_anh: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=800", la_anh_chinh: true }] },
      bien_the_san_pham: { create: [
        { ten_bien_the: "Nải ~1kg", don_vi_tinh: "Nải", gia_ban: 48000, gia_goc: 38000, ma_sku: "CHUOI-1KG" },
        { ten_bien_the: "Buồng 10kg", don_vi_tinh: "Buồng", gia_ban: 430000, gia_goc: 350000, ma_sku: "CHUOI-10KG" },
      ] },
    },
  });

  const sp9 = await prisma.san_pham.create({
    data: {
      ten_san_pham: "Khoai Lang Mật Nhật Bản (Vĩnh Long)", mo_ta: "Khoai lang mật giống Nhật, vỏ tím đậm, ruột vàng sậm.", xuat_xu: "Bình Tân, Vĩnh Long", trang_thai: "DANG_BAN", ma_danh_muc: dmCuQua.id,
      anh_san_pham: { create: [{ duong_dan_anh: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800", la_anh_chinh: true }] },
      bien_the_san_pham: { create: [
        { ten_bien_the: "Túi 1kg", don_vi_tinh: "Túi", gia_ban: 52000, gia_goc: 42000, ma_sku: "KHOAILANG-1KG" },
        { ten_bien_the: "Thùng 10kg", don_vi_tinh: "Thùng", gia_ban: 490000, gia_goc: 400000, ma_sku: "KHOAILANG-10KG" },
      ] },
    },
  });

  const sp10 = await prisma.san_pham.create({
    data: {
      ten_san_pham: "Gạo ST25 Đặc Sản Sóc Trăng", mo_ta: "Gạo ST25 giải nhì gạo ngon nhất thế giới 2019, dẻo mềm thơm.", xuat_xu: "Mỹ Xuyên, Sóc Trăng", trang_thai: "DANG_BAN", ma_danh_muc: dmGao.id,
      anh_san_pham: { create: [{ duong_dan_anh: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800", la_anh_chinh: true }] },
      chung_chi_san_pham: { create: [{ ten_chung_chi: "VietGAP" }, { ten_chung_chi: "HACCP" }] },
      bien_the_san_pham: { create: [
        { ten_bien_the: "Túi 2kg", don_vi_tinh: "Túi", gia_ban: 78000, gia_goc: 62000, ma_sku: "ST25-2KG" },
        { ten_bien_the: "Túi 5kg", don_vi_tinh: "Túi", gia_ban: 185000, gia_goc: 150000, ma_sku: "ST25-5KG" },
        { ten_bien_the: "Bao 25kg", don_vi_tinh: "Bao", gia_ban: 880000, gia_goc: 720000, ma_sku: "ST25-25KG" },
      ] },
    },
  });

  const sp11 = await prisma.san_pham.create({
    data: {
      ten_san_pham: "Gạo Lứt Đỏ Hữu Cơ Điện Biên", mo_ta: "Gạo lứt đỏ trồng hữu cơ, giàu anthocyanin.", xuat_xu: "Điện Biên", trang_thai: "DANG_BAN", ma_danh_muc: dmGao.id,
      anh_san_pham: { create: [{ duong_dan_anh: "https://images.unsplash.com/photo-1614728263952-84ea256f9697?w=800", la_anh_chinh: true }] },
      chung_chi_san_pham: { create: [{ ten_chung_chi: "Hữu cơ" }] },
      bien_the_san_pham: { create: [
        { ten_bien_the: "Túi 1kg", don_vi_tinh: "Túi", gia_ban: 55000, gia_goc: 44000, ma_sku: "GAOLUT-1KG" },
        { ten_bien_the: "Túi 5kg", don_vi_tinh: "Túi", gia_ban: 260000, gia_goc: 210000, ma_sku: "GAOLUT-5KG" },
      ] },
    },
  });
  await prisma.the_san_pham.createMany({ data: [{ ma_san_pham: sp11.id, ma_the: theList[0].id }, { ma_san_pham: sp11.id, ma_the: theList[5].id }] });

  const sp12 = await prisma.san_pham.create({
    data: {
      ten_san_pham: "Nấm Đùi Gà Tươi Loại 1", mo_ta: "Nấm đùi gà trồng trong phòng sạch, thân dày chắc.", xuat_xu: "Đức Trọng, Lâm Đồng", trang_thai: "DANG_BAN", ma_danh_muc: dmNam.id,
      anh_san_pham: { create: [{ duong_dan_anh: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800", la_anh_chinh: true }] },
      bien_the_san_pham: { create: [
        { ten_bien_the: "Hộp 300g", don_vi_tinh: "Hộp", gia_ban: 48000, gia_goc: 38000, ma_sku: "NAMDG-300G" },
        { ten_bien_the: "Khay 1kg", don_vi_tinh: "Khay", gia_ban: 145000, gia_goc: 116000, ma_sku: "NAMDG-1KG" },
      ] },
    },
  });

  const sp13 = await prisma.san_pham.create({
    data: {
      ten_san_pham: "Nấm Linh Chi Đỏ Đà Lạt", mo_ta: "Nấm linh chi đỏ sấy khô, dùng hãm trà.", xuat_xu: "Đà Lạt, Lâm Đồng", trang_thai: "DANG_BAN", ma_danh_muc: dmNam.id,
      anh_san_pham: { create: [{ duong_dan_anh: "https://images.unsplash.com/photo-1547592180-85f173990554?w=800", la_anh_chinh: true }] },
      bien_the_san_pham: { create: [
        { ten_bien_the: "Hộp 100g", don_vi_tinh: "Hộp", gia_ban: 185000, gia_goc: 150000, ma_sku: "NAMLC-100G" },
        { ten_bien_the: "Hộp 500g", don_vi_tinh: "Hộp", gia_ban: 880000, gia_goc: 720000, ma_sku: "NAMLC-500G" },
      ] },
    },
  });
  await prisma.the_san_pham.createMany({ data: [{ ma_san_pham: sp13.id, ma_the: theList[6].id }] });

  const sp14 = await prisma.san_pham.create({
    data: {
      ten_san_pham: "Mật Ong Rừng Tràm Phú Quốc", mo_ta: "Mật ong rừng tràm thu hoạch mùa hoa tháng 1-3.", xuat_xu: "Phú Quốc, Kiên Giang", trang_thai: "DANG_BAN", ma_danh_muc: dmGiaVi.id,
      anh_san_pham: { create: [{ duong_dan_anh: "https://images.unsplash.com/photo-1587049352847-4d4b126a3109?w=800", la_anh_chinh: true }] },
      chung_chi_san_pham: { create: [{ ten_chung_chi: "HACCP" }] },
      bien_the_san_pham: { create: [
        { ten_bien_the: "Chai 380ml", don_vi_tinh: "Chai", gia_ban: 285000, gia_goc: 235000, ma_sku: "MATONG-380ML" },
        { ten_bien_the: "Chai 750ml", don_vi_tinh: "Chai", gia_ban: 520000, gia_goc: 430000, ma_sku: "MATONG-750ML" },
      ] },
    },
  });
  await prisma.the_san_pham.createMany({ data: [{ ma_san_pham: sp14.id, ma_the: theList[4].id }] });

  const sp15 = await prisma.san_pham.create({
    data: {
      ten_san_pham: "Tiêu Đen Hạt Phú Quốc Loại 1", mo_ta: "Tiêu đen Phú Quốc phơi khô tự nhiên, cay nồng thơm dầu tinh.", xuat_xu: "Phú Quốc, Kiên Giang", trang_thai: "DANG_BAN", ma_danh_muc: dmGiaVi.id,
      anh_san_pham: { create: [{ duong_dan_anh: "https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=800", la_anh_chinh: true }] },
      bien_the_san_pham: { create: [
        { ten_bien_the: "Túi 100g", don_vi_tinh: "Túi", gia_ban: 55000, gia_goc: 44000, ma_sku: "TIEU-100G" },
        { ten_bien_the: "Túi 500g", don_vi_tinh: "Túi", gia_ban: 245000, gia_goc: 198000, ma_sku: "TIEU-500G" },
      ] },
    },
  });

  const sp16 = await prisma.san_pham.create({
    data: {
      ten_san_pham: "Đậu Đen Hữu Cơ Sơn La", mo_ta: "Đậu đen nhỏ hạt, trồng hữu cơ trên nương cao.", xuat_xu: "Mộc Châu, Sơn La", trang_thai: "DANG_BAN", ma_danh_muc: dmHat.id,
      anh_san_pham: { create: [{ duong_dan_anh: "https://images.unsplash.com/photo-1515543904379-3d757abe528b?w=800", la_anh_chinh: true }] },
      chung_chi_san_pham: { create: [{ ten_chung_chi: "Hữu cơ" }] },
      bien_the_san_pham: { create: [
        { ten_bien_the: "Túi 500g", don_vi_tinh: "Túi", gia_ban: 52000, gia_goc: 42000, ma_sku: "DAUDEN-500G" },
        { ten_bien_the: "Túi 2kg", don_vi_tinh: "Túi", gia_ban: 192000, gia_goc: 156000, ma_sku: "DAUDEN-2KG" },
      ] },
    },
  });
  await prisma.the_san_pham.createMany({ data: [{ ma_san_pham: sp16.id, ma_the: theList[0].id }, { ma_san_pham: sp16.id, ma_the: theList[7].id }] });

  const sp17 = await prisma.san_pham.create({
    data: {
      ten_san_pham: "Hạt Điều Rang Muối Bình Phước", mo_ta: "Hạt điều W240 rang muối biển, giòn béo bùi.", xuat_xu: "Đồng Phú, Bình Phước", trang_thai: "DANG_BAN", ma_danh_muc: dmHat.id,
      anh_san_pham: { create: [{ duong_dan_anh: "https://images.unsplash.com/photo-1609501676725-7186f017a4b7?w=800", la_anh_chinh: true }] },
      bien_the_san_pham: { create: [
        { ten_bien_the: "Túi 200g", don_vi_tinh: "Túi", gia_ban: 68000, gia_goc: 55000, ma_sku: "DIEU-200G" },
        { ten_bien_the: "Túi 500g", don_vi_tinh: "Túi", gia_ban: 155000, gia_goc: 125000, ma_sku: "DIEU-500G" },
        { ten_bien_the: "Túi 1kg", don_vi_tinh: "Túi", gia_ban: 295000, gia_goc: 240000, ma_sku: "DIEU-1KG" },
      ] },
    },
  });

  const sp18 = await prisma.san_pham.create({
    data: {
      ten_san_pham: "Trà Nõn Tôm Thái Nguyên Thượng Hạng", mo_ta: "Trà nõn tôm hái tay, nước xanh vàng, vị ngọt hậu.", xuat_xu: "Đồng Hỷ, Thái Nguyên", trang_thai: "DANG_BAN", ma_danh_muc: dmTraHoa.id,
      anh_san_pham: { create: [{ duong_dan_anh: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=800", la_anh_chinh: true }] },
      chung_chi_san_pham: { create: [{ ten_chung_chi: "VietGAP" }] },
      bien_the_san_pham: { create: [
        { ten_bien_the: "Túi 100g", don_vi_tinh: "Túi", gia_ban: 120000, gia_goc: 96000, ma_sku: "TRA-100G" },
        { ten_bien_the: "Hộp 200g", don_vi_tinh: "Hộp", gia_ban: 225000, gia_goc: 182000, ma_sku: "TRA-200G" },
      ] },
    },
  });
  await prisma.the_san_pham.createMany({ data: [{ ma_san_pham: sp18.id, ma_the: theList[4].id }] });

  const sp19 = await prisma.san_pham.create({
    data: {
      ten_san_pham: "Hoa Cúc Vàng Sấy Khô Đà Lạt", mo_ta: "Hoa cúc vàng hữu cơ sấy lạnh, pha trà giảm căng thẳng.", xuat_xu: "Đà Lạt, Lâm Đồng", trang_thai: "DANG_BAN", ma_danh_muc: dmTraHoa.id,
      anh_san_pham: { create: [{ duong_dan_anh: "https://images.unsplash.com/photo-1455853659719-4b521eebc76d?w=800", la_anh_chinh: true }] },
      chung_chi_san_pham: { create: [{ ten_chung_chi: "Hữu cơ" }] },
      bien_the_san_pham: { create: [
        { ten_bien_the: "Túi 50g", don_vi_tinh: "Túi", gia_ban: 65000, gia_goc: 52000, ma_sku: "HOACUC-50G" },
        { ten_bien_the: "Hộp 150g", don_vi_tinh: "Hộp", gia_ban: 175000, gia_goc: 142000, ma_sku: "HOACUC-150G" },
      ] },
    },
  });

  const sp20 = await prisma.san_pham.create({
    data: {
      ten_san_pham: "Nghệ Tươi Hữu Cơ Đắk Lắk", mo_ta: "Nghệ tươi trồng hữu cơ, hàm lượng curcumin cao, dùng chế biến tinh bột nghệ hoặc nấu ăn.", xuat_xu: "Đắk Lắk", trang_thai: "DANG_BAN", ma_danh_muc: dmCuQua.id,
      anh_san_pham: { create: [{ duong_dan_anh: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=800", la_anh_chinh: true }] },
      chung_chi_san_pham: { create: [{ ten_chung_chi: "Hữu cơ" }] },
      bien_the_san_pham: { create: [
        { ten_bien_the: "Túi 500g", don_vi_tinh: "Túi", gia_ban: 35000, gia_goc: 28000, ma_sku: "NGHE-500G" },
        { ten_bien_the: "Túi 2kg", don_vi_tinh: "Túi", gia_ban: 125000, gia_goc: 100000, ma_sku: "NGHE-2KG" },
      ] },
    },
  });
  await prisma.the_san_pham.createMany({ data: [{ ma_san_pham: sp20.id, ma_the: theList[0].id }, { ma_san_pham: sp20.id, ma_the: theList[6].id }] });

  // ══════════════════════════════════════════════════════════════════
  // 8. NCC_SAN_PHAM (Liên kết NCC - Sản phẩm)
  // ══════════════════════════════════════════════════════════════════
  console.log("🔗 [8/20] Tạo liên kết NCC - Sản phẩm...");

  await prisma.ncc_san_pham.createMany({
    data: [
      { ma_ncc: ncc1.id, ma_san_pham: sp1.id, gia_nhap_gan_nhat: 12000, don_vi_tinh: "Bó", so_luong_toi_thieu: 50, thoi_gian_giao_hang_ngay: 1, ghi_chu: "Giao hàng mỗi sáng" },
      { ma_ncc: ncc1.id, ma_san_pham: sp2.id, gia_nhap_gan_nhat: 25000, don_vi_tinh: "Bó", so_luong_toi_thieu: 30, thoi_gian_giao_hang_ngay: 1 },
      { ma_ncc: ncc1.id, ma_san_pham: sp3.id, gia_nhap_gan_nhat: 22000, don_vi_tinh: "Túi", so_luong_toi_thieu: 40, thoi_gian_giao_hang_ngay: 1 },
      { ma_ncc: ncc1.id, ma_san_pham: sp4.id, gia_nhap_gan_nhat: 32000, don_vi_tinh: "Cây", so_luong_toi_thieu: 20, thoi_gian_giao_hang_ngay: 2 },
      { ma_ncc: ncc1.id, ma_san_pham: sp5.id, gia_nhap_gan_nhat: 60000, don_vi_tinh: "Hộp", so_luong_toi_thieu: 20, thoi_gian_giao_hang_ngay: 1 },
      { ma_ncc: ncc2.id, ma_san_pham: sp7.id, gia_nhap_gan_nhat: 45000, don_vi_tinh: "kg", so_luong_toi_thieu: 50, thoi_gian_giao_hang_ngay: 3 },
      { ma_ncc: ncc3.id, ma_san_pham: sp10.id, gia_nhap_gan_nhat: 55000, don_vi_tinh: "Túi", so_luong_toi_thieu: 100, thoi_gian_giao_hang_ngay: 2 },
      { ma_ncc: ncc3.id, ma_san_pham: sp11.id, gia_nhap_gan_nhat: 38000, don_vi_tinh: "Túi", so_luong_toi_thieu: 50, thoi_gian_giao_hang_ngay: 2 },
      { ma_ncc: ncc4.id, ma_san_pham: sp6.id, gia_nhap_gan_nhat: 52000, don_vi_tinh: "kg", so_luong_toi_thieu: 30, thoi_gian_giao_hang_ngay: 2 },
      { ma_ncc: ncc5.id, ma_san_pham: sp14.id, gia_nhap_gan_nhat: 200000, don_vi_tinh: "Chai", so_luong_toi_thieu: 10, thoi_gian_giao_hang_ngay: 5, ghi_chu: "Mùa vụ: tháng 1-3" },
      { ma_ncc: ncc5.id, ma_san_pham: sp15.id, gia_nhap_gan_nhat: 38000, don_vi_tinh: "Túi", so_luong_toi_thieu: 20, thoi_gian_giao_hang_ngay: 5 },
    ],
  });

  // ══════════════════════════════════════════════════════════════════
  // 9. HỢP ĐỒNG NCC & LỊCH ĐẶT HÀNG & CÔNG NỢ
  // ══════════════════════════════════════════════════════════════════
  console.log("📄 [9/20] Tạo hợp đồng, lịch đặt hàng, công nợ NCC...");

  await prisma.hop_dong_ncc.createMany({
    data: [
      { ma_ncc: ncc1.id, so_hop_dong: "HD-2024-001", loai_hop_dong: "DAI_HAN", ngay_ky: new Date("2024-01-01"), ngay_het_han: new Date("2026-12-31"), gia_tri_hop_dong: 500000000, trang_thai: "HIEU_LUC", ghi_chu: "Hợp đồng cung cấp rau sạch quanh năm" },
      { ma_ncc: ncc2.id, so_hop_dong: "HD-2024-002", loai_hop_dong: "THEO_VU", ngay_ky: new Date("2024-06-01"), ngay_het_han: new Date("2026-06-01"), gia_tri_hop_dong: 200000000, trang_thai: "HIEU_LUC" },
      { ma_ncc: ncc3.id, so_hop_dong: "HD-2025-003", loai_hop_dong: "DAI_HAN", ngay_ky: new Date("2025-01-01"), ngay_het_han: new Date("2027-01-01"), gia_tri_hop_dong: 300000000, trang_thai: "HIEU_LUC" },
      { ma_ncc: ncc4.id, so_hop_dong: "HD-2024-004", loai_hop_dong: "THEO_VU", ngay_ky: new Date("2024-05-01"), ngay_het_han: new Date("2025-10-01"), gia_tri_hop_dong: 150000000, trang_thai: "HET_HAN" },
      { ma_ncc: ncc5.id, so_hop_dong: "HD-2025-005", loai_hop_dong: "DAI_HAN", ngay_ky: new Date("2025-03-01"), ngay_het_han: new Date("2028-03-01"), gia_tri_hop_dong: 100000000, trang_thai: "HIEU_LUC" },
    ],
  });

  await prisma.lich_dat_hang_ncc.createMany({
    data: [
      { ma_ncc: ncc1.id, ma_san_pham: sp1.id, tan_suat: "HANG_NGAY", ngay_trong_tuan: JSON.parse('[1,2,3,4,5,6]'), gio_giao: "05:30", so_luong_mac_dinh: 100, dang_hoat_dong: true, ghi_chu: "Giao trước 6h sáng" },
      { ma_ncc: ncc1.id, ma_san_pham: sp3.id, tan_suat: "HANG_NGAY", ngay_trong_tuan: JSON.parse('[1,2,3,4,5]'), gio_giao: "06:00", so_luong_mac_dinh: 80, dang_hoat_dong: true },
      { ma_ncc: ncc3.id, ma_san_pham: sp10.id, tan_suat: "HANG_TUAN", ngay_trong_tuan: JSON.parse('[2,5]'), gio_giao: "08:00", so_luong_mac_dinh: 200, dang_hoat_dong: true },
      { ma_ncc: ncc4.id, ma_san_pham: sp6.id, tan_suat: "HANG_TUAN", ngay_trong_tuan: JSON.parse('[3]'), gio_giao: "07:00", so_luong_mac_dinh: 50, dang_hoat_dong: true },
    ],
  });

  await prisma.cong_no_ncc.createMany({
    data: [
      { ma_ncc: ncc1.id, loai_giao_dich: "NHAP_HANG", so_tien: 15000000, so_du_sau: 15000000, phuong_thuc: "CHUYEN_KHOAN", ghi_chu: "Nhập rau đợt 1 tháng 5", ngay_giao_dich: addDays(today, -10) },
      { ma_ncc: ncc1.id, loai_giao_dich: "THANH_TOAN", so_tien: -10000000, so_du_sau: 5000000, phuong_thuc: "CHUYEN_KHOAN", ma_giao_dich: "VCB-20260428-001", ghi_chu: "Thanh toán đợt 1", ngay_giao_dich: addDays(today, -5) },
      { ma_ncc: ncc3.id, loai_giao_dich: "NHAP_HANG", so_tien: 25000000, so_du_sau: 25000000, phuong_thuc: "CHUYEN_KHOAN", ghi_chu: "Nhập gạo ST25", ngay_giao_dich: addDays(today, -7) },
      { ma_ncc: ncc5.id, loai_giao_dich: "NHAP_HANG", so_tien: 8000000, so_du_sau: 8000000, phuong_thuc: "TIEN_MAT", ghi_chu: "Nhập mật ong vụ xuân", ngay_giao_dich: addDays(today, -15) },
      { ma_ncc: ncc5.id, loai_giao_dich: "THANH_TOAN", so_tien: -8000000, so_du_sau: 0, phuong_thuc: "CHUYEN_KHOAN", ma_giao_dich: "BIDV-20260425-001", ghi_chu: "Thanh toán hết", ngay_giao_dich: addDays(today, -3) },
    ],
  });

  // ══════════════════════════════════════════════════════════════════
  // 10. PHƯƠNG THỨC THANH TOÁN & MÃ GIẢM GIÁ
  // ══════════════════════════════════════════════════════════════════
  console.log("💳 [10/20] Tạo phương thức thanh toán, mã giảm giá...");

  const ptCOD = await prisma.phuong_thuc_thanh_toan.create({ data: { ten_phuong_thuc: "Thanh toán khi nhận hàng (COD)" } });
  const ptVNPay = await prisma.phuong_thuc_thanh_toan.create({ data: { ten_phuong_thuc: "VNPay" } });
  const ptMomo = await prisma.phuong_thuc_thanh_toan.create({ data: { ten_phuong_thuc: "Ví MoMo" } });
  const ptBank = await prisma.phuong_thuc_thanh_toan.create({ data: { ten_phuong_thuc: "Chuyển khoản ngân hàng" } });

  // Lấy biến thể
  const btDauTay500 = await prisma.bien_the_san_pham.findUnique({ where: { ma_sku: "DAUTAY-500G" } });
  const btST25_5 = await prisma.bien_the_san_pham.findUnique({ where: { ma_sku: "ST25-5KG" } });
  const btXoai1 = await prisma.bien_the_san_pham.findUnique({ where: { ma_sku: "XOAI-1KG" } });
  const btRau300 = await prisma.bien_the_san_pham.findUnique({ where: { ma_sku: "RMUONG-300G" } });

  const km1 = await prisma.ma_giam_gia.create({ data: { ma_code: "VERDANT2026", loai_giam_gia: "FIXED", gia_tri_giam: 30000, don_toi_thieu: 150000, ngay_bat_dau: new Date(), ngay_ket_thuc: new Date(2026, 11, 31) } });
  const km2 = await prisma.ma_giam_gia.create({ data: { ma_code: "FREESHIP50", loai_giam_gia: "FIXED", gia_tri_giam: 20000, don_toi_thieu: 200000, ngay_bat_dau: new Date(), ngay_ket_thuc: new Date(2026, 5, 30), gioi_han_su_dung: 100 } });
  await prisma.ma_giam_gia.create({ data: { ma_code: "B2B10PCT", loai_giam_gia: "PERCENT", gia_tri_giam: 10, don_toi_thieu: 1000000, ngay_bat_dau: new Date(), ngay_ket_thuc: new Date(2026, 11, 31), gioi_han_su_dung: 50 } });
  await prisma.ma_giam_gia.create({ data: { ma_code: "SUMMER25", loai_giam_gia: "PERCENT", gia_tri_giam: 15, don_toi_thieu: 300000, ngay_bat_dau: new Date(), ngay_ket_thuc: new Date(2026, 7, 31), gioi_han_su_dung: 200 } });
  await prisma.ma_giam_gia.create({ data: { ma_code: "DAUTAY10", loai_giam_gia: "PERCENT", gia_tri_giam: 10, don_toi_thieu: 85000, ma_bien_the_ap_dung: btDauTay500?.id, ngay_bat_dau: new Date(), ngay_ket_thuc: new Date(2026, 6, 31), gioi_han_su_dung: 50 } });

  // ══════════════════════════════════════════════════════════════════
  // 11. ĐƠN HÀNG (nhiều trạng thái)
  // ══════════════════════════════════════════════════════════════════
  console.log("📦 [11/20] Tạo đơn hàng...");

  // Đơn 1: Đã giao thành công
  const dh1 = await prisma.don_hang.create({
    data: {
      ma_nguoi_dung: kh1.id, ma_khuyen_mai: km1.id, tong_tien: 340000, phi_van_chuyen: 30000, trang_thai: "DA_GIAO",
      ho_ten_nguoi_nhan: "Lê Thị Hồng", sdt_nguoi_nhan: "0911111111", dia_chi_giao_hang: "123 Nguyễn Huệ, Q1, HCM",
      ma_tinh_ghn: 202, ma_quan_huyen_ghn: 1442, ma_phuong_xa_ghn: "20305",
      ngay_tao: addDays(today, -15),
      chi_tiet_don_hang: { create: [
        { ma_bien_the: btDauTay500!.id, so_luong: 2, don_gia: btDauTay500!.gia_ban },
        { ma_bien_the: btRau300!.id, so_luong: 3, don_gia: btRau300!.gia_ban },
      ] },
    },
  });

  // Đơn 2: Đang giao
  const dh2 = await prisma.don_hang.create({
    data: {
      ma_nguoi_dung: kh2.id, tong_tien: 535000, phi_van_chuyen: 25000, trang_thai: "DANG_GIAO_HANG",
      ho_ten_nguoi_nhan: "Phạm Minh Tuấn", sdt_nguoi_nhan: "0922222222", dia_chi_giao_hang: "789 Trần Hưng Đạo, Q1, HCM",
      ma_tinh_ghn: 202, ma_quan_huyen_ghn: 1442, ma_phuong_xa_ghn: "20308",
      ngay_tao: addDays(today, -3),
      chi_tiet_don_hang: { create: [
        { ma_bien_the: btST25_5!.id, so_luong: 2, don_gia: btST25_5!.gia_ban },
        { ma_bien_the: btXoai1!.id, so_luong: 2, don_gia: btXoai1!.gia_ban },
      ] },
    },
  });

  // Đơn 3: Chờ xác nhận
  const dh3 = await prisma.don_hang.create({
    data: {
      ma_nguoi_dung: kh3.id, ma_khuyen_mai: km2.id, tong_tien: 395000, phi_van_chuyen: 35000, trang_thai: "CHO_XAC_NHAN",
      ho_ten_nguoi_nhan: "Võ Thị Mai Lan", sdt_nguoi_nhan: "0933333333", dia_chi_giao_hang: "12 Hải Phòng, Hải Châu, Đà Nẵng",
      ma_tinh_ghn: 203, ma_quan_huyen_ghn: 1527, ma_phuong_xa_ghn: "40101",
      ngay_tao: addDays(today, -1),
      chi_tiet_don_hang: { create: [
        { ma_bien_the: btDauTay500!.id, so_luong: 1, don_gia: btDauTay500!.gia_ban },
        { ma_bien_the: btST25_5!.id, so_luong: 1, don_gia: btST25_5!.gia_ban },
      ] },
    },
  });

  // Đơn 4: Đã hủy
  const dh4 = await prisma.don_hang.create({
    data: {
      ma_nguoi_dung: kh1.id, tong_tien: 155000, phi_van_chuyen: 25000, trang_thai: "DA_HUY",
      ho_ten_nguoi_nhan: "Lê Thị Hồng", sdt_nguoi_nhan: "0911111111", dia_chi_giao_hang: "456 Lê Lợi, Q3, HCM",
      ghi_chu: "Khách hủy do đổi ý",
      ngay_tao: addDays(today, -20),
      chi_tiet_don_hang: { create: [
        { ma_bien_the: btDauTay500!.id, so_luong: 1, don_gia: btDauTay500!.gia_ban },
      ] },
    },
  });

  // Đơn 5: Đang xử lý
  const dh5 = await prisma.don_hang.create({
    data: {
      ma_nguoi_dung: kh2.id, tong_tien: 890000, phi_van_chuyen: 0, trang_thai: "DANG_XU_LY",
      ho_ten_nguoi_nhan: "Phạm Minh Tuấn", sdt_nguoi_nhan: "0922222222", dia_chi_giao_hang: "789 Trần Hưng Đạo, Q1, HCM",
      ngay_tao: addDays(today, 0),
      chi_tiet_don_hang: { create: [
        { ma_bien_the: btST25_5!.id, so_luong: 3, don_gia: btST25_5!.gia_ban },
        { ma_bien_the: btXoai1!.id, so_luong: 5, don_gia: btXoai1!.gia_ban },
      ] },
    },
  });

  // ══════════════════════════════════════════════════════════════════
  // 12. LỊCH SỬ ĐƠN HÀNG
  // ══════════════════════════════════════════════════════════════════
  console.log("📜 [12/20] Tạo lịch sử đơn hàng...");

  await prisma.lich_su_don_hang.createMany({
    data: [
      { ma_don_hang: dh1.id, trang_thai: "CHO_XAC_NHAN", thoi_gian_doi: addDays(today, -15) },
      { ma_don_hang: dh1.id, trang_thai: "DANG_XU_LY", thoi_gian_doi: addDays(today, -14) },
      { ma_don_hang: dh1.id, trang_thai: "DANG_GIAO_HANG", thoi_gian_doi: addDays(today, -13) },
      { ma_don_hang: dh1.id, trang_thai: "DA_GIAO", thoi_gian_doi: addDays(today, -11) },
      { ma_don_hang: dh2.id, trang_thai: "CHO_XAC_NHAN", thoi_gian_doi: addDays(today, -3) },
      { ma_don_hang: dh2.id, trang_thai: "DANG_XU_LY", thoi_gian_doi: addDays(today, -2) },
      { ma_don_hang: dh2.id, trang_thai: "DANG_GIAO_HANG", thoi_gian_doi: addDays(today, -1) },
      { ma_don_hang: dh3.id, trang_thai: "CHO_XAC_NHAN", thoi_gian_doi: addDays(today, -1) },
      { ma_don_hang: dh4.id, trang_thai: "CHO_XAC_NHAN", thoi_gian_doi: addDays(today, -20) },
      { ma_don_hang: dh4.id, trang_thai: "DA_HUY", thoi_gian_doi: addDays(today, -19) },
      { ma_don_hang: dh5.id, trang_thai: "CHO_XAC_NHAN", thoi_gian_doi: today },
      { ma_don_hang: dh5.id, trang_thai: "DANG_XU_LY", thoi_gian_doi: today },
    ],
  });

  // ══════════════════════════════════════════════════════════════════
  // 13. GIAO DỊCH THANH TOÁN
  // ══════════════════════════════════════════════════════════════════
  console.log("💰 [13/20] Tạo giao dịch thanh toán...");

  await prisma.giao_dich_thanh_toan.createMany({
    data: [
      { ma_don_hang: dh1.id, ma_phuong_thuc: ptVNPay.id, so_tien: 340000, trang_thai: "THANH_CONG", phuong_thuc_thanh_toan: "VNPAY", ma_giao_dich_ben_ngoai: "VNP-20260423-001", ngay_tao: addDays(today, -15) },
      { ma_don_hang: dh2.id, ma_phuong_thuc: ptCOD.id, so_tien: 535000, trang_thai: "CHO_THANH_TOAN", phuong_thuc_thanh_toan: "COD", ngay_tao: addDays(today, -3) },
      { ma_don_hang: dh3.id, ma_phuong_thuc: ptMomo.id, so_tien: 395000, trang_thai: "CHO_THANH_TOAN", phuong_thuc_thanh_toan: "MOMO", ngay_tao: addDays(today, -1) },
      { ma_don_hang: dh4.id, ma_phuong_thuc: ptVNPay.id, so_tien: 155000, trang_thai: "DA_HOAN", phuong_thuc_thanh_toan: "VNPAY", ma_giao_dich_ben_ngoai: "VNP-20260418-002", ngay_tao: addDays(today, -20) },
      { ma_don_hang: dh5.id, ma_phuong_thuc: ptBank.id, so_tien: 890000, trang_thai: "CHO_THANH_TOAN", phuong_thuc_thanh_toan: "BANK_TRANSFER", ngay_tao: today },
    ],
  });

  // ══════════════════════════════════════════════════════════════════
  // 14. ĐỐI TÁC VẬN CHUYỂN & ĐƠN VẬN CHUYỂN
  // ══════════════════════════════════════════════════════════════════
  console.log("🚚 [14/20] Tạo đối tác vận chuyển, đơn vận chuyển...");

  const dtGHN = await prisma.doi_tac_van_chuyen.create({ data: { ten_doi_tac: "Giao Hàng Nhanh (GHN)", so_dien_thoai: "1900636677" } });
  const dtGHTK = await prisma.doi_tac_van_chuyen.create({ data: { ten_doi_tac: "Giao Hàng Tiết Kiệm (GHTK)", so_dien_thoai: "1900545457" } });
  const dtJT = await prisma.doi_tac_van_chuyen.create({ data: { ten_doi_tac: "J&T Express", so_dien_thoai: "1900123456" } });

  await prisma.don_van_chuyen.createMany({
    data: [
      { ma_don_hang: dh1.id, ma_doi_tac: dtGHN.id, ma_van_don: "GHN-VD-20260423-001", trang_thai: "DA_GIAO", ngay_giao_du_kien: addDays(today, -12) },
      { ma_don_hang: dh2.id, ma_doi_tac: dtGHTK.id, ma_van_don: "GHTK-VD-20260505-001", trang_thai: "DANG_VAN_CHUYEN", ngay_giao_du_kien: addDays(today, 2) },
      { ma_don_hang: dh5.id, ma_doi_tac: dtJT.id, ma_van_don: "JT-VD-20260508-001", trang_thai: "CHO_LAY_HANG", ngay_giao_du_kien: addDays(today, 4) },
    ],
  });

  // ══════════════════════════════════════════════════════════════════
  // 15. KHO HÀNG & VỊ TRÍ & LÔ HÀNG & TỒN KHO
  // ══════════════════════════════════════════════════════════════════
  console.log("🏬 [15/20] Tạo kho, vị trí, lô hàng, tồn kho...");

  const kho = await prisma.kho_hang.create({ data: { ten_kho: "Tổng Kho Đà Nẵng", dia_chi: "Hòa Khánh, Liên Chiểu, Đà Nẵng" } });
  const kho2 = await prisma.kho_hang.create({ data: { ten_kho: "Kho Lạnh HCM", dia_chi: "KCN Tân Bình, Quận Tân Phú, HCM" } });

  const vtA1 = await prisma.vi_tri_kho.create({ data: { ma_kho: kho.id, khu_vuc: "Khu A", day: "D1", ke: "K1", tang: "T1", suc_chua_toi_da: 100 } });
  const vtA2 = await prisma.vi_tri_kho.create({ data: { ma_kho: kho.id, khu_vuc: "Khu A", day: "D1", ke: "K2", tang: "T1", suc_chua_toi_da: 100 } });
  const vtB1 = await prisma.vi_tri_kho.create({ data: { ma_kho: kho.id, khu_vuc: "Khu B", day: "D1", ke: "K1", tang: "T1", suc_chua_toi_da: 80 } });
  const vtB2 = await prisma.vi_tri_kho.create({ data: { ma_kho: kho.id, khu_vuc: "Khu B", day: "D2", ke: "K1", tang: "T1", suc_chua_toi_da: 80 } });
  const vtC1 = await prisma.vi_tri_kho.create({ data: { ma_kho: kho.id, khu_vuc: "Khu C", day: "D1", ke: "K1", tang: "T1", suc_chua_toi_da: 120 } });
  const vtLanh1 = await prisma.vi_tri_kho.create({ data: { ma_kho: kho2.id, khu_vuc: "Khu Lạnh", day: "D1", ke: "K1", tang: "T1", suc_chua_toi_da: 50, ghi_chu: "Nhiệt độ 2-8°C" } });

  // Tạo lô hàng
  const loList = await Promise.all([
    prisma.lo_hang.create({ data: { ma_lo_hang: "LO-RM-2026-001", ma_bien_the: btRau300!.id, ma_ncc: ncc1.id, ngay_thu_hoach: addDays(today, -2), han_su_dung: addDays(today, 7), ngay_nhap_kho: addDays(today, -1), trang_thai: "BINH_THUONG" } }),
    prisma.lo_hang.create({ data: { ma_lo_hang: "LO-ST25-2026-001", ma_bien_the: btST25_5!.id, ma_ncc: ncc3.id, ngay_thu_hoach: addDays(today, -30), han_su_dung: addDays(today, 180), ngay_nhap_kho: addDays(today, -7), trang_thai: "BINH_THUONG" } }),
    prisma.lo_hang.create({ data: { ma_lo_hang: "LO-XOAI-2026-001", ma_bien_the: btXoai1!.id, ma_ncc: ncc4.id, ngay_thu_hoach: addDays(today, -5), han_su_dung: addDays(today, 15), ngay_nhap_kho: addDays(today, -4), trang_thai: "BINH_THUONG" } }),
    prisma.lo_hang.create({ data: { ma_lo_hang: "LO-DT-2026-001", ma_bien_the: btDauTay500!.id, ma_ncc: ncc1.id, ngay_thu_hoach: addDays(today, -1), han_su_dung: addDays(today, 5), ngay_nhap_kho: today, trang_thai: "BINH_THUONG" } }),
    prisma.lo_hang.create({ data: { ma_lo_hang: "LO-RM-WARN-001", ma_bien_the: btRau300!.id, ma_ncc: ncc1.id, ngay_thu_hoach: addDays(today, -6), han_su_dung: addDays(today, 1), ngay_nhap_kho: addDays(today, -5), trang_thai: "SAP_HET_HAN" } }),
  ]);

  // Tồn kho
  await prisma.ton_kho_tong.createMany({
    data: [
      { ma_lo_hang: loList[0].id, ma_vi_tri: vtA1.id, so_luong: 80 },
      { ma_lo_hang: loList[1].id, ma_vi_tri: vtC1.id, so_luong: 150 },
      { ma_lo_hang: loList[2].id, ma_vi_tri: vtB1.id, so_luong: 45 },
      { ma_lo_hang: loList[3].id, ma_vi_tri: vtLanh1.id, so_luong: 30 },
      { ma_lo_hang: loList[4].id, ma_vi_tri: vtA2.id, so_luong: 15 },
    ],
  });

  // Kiện hàng chi tiết
  for (let i = 0; i < loList.length; i++) {
    const lo = loList[i];
    const viTri = [vtA1, vtC1, vtB1, vtLanh1, vtA2][i];
    for (let j = 1; j <= 3; j++) {
      await prisma.kien_hang_chi_tiet.create({
        data: { ma_lo_hang: lo.id, ma_vi_tri: viTri.id, ma_vach_quet: `QR-${lo.ma_lo_hang}-${String(j).padStart(3, '0')}`, trang_thai: "TRONG_KHO" },
      });
    }
  }

  // Cảnh báo lô sắp hết hạn
  await prisma.canh_bao_lo_hang.create({
    data: { ma_lo_hang: loList[4].id, loai_canh_bao: "SAP_HET_HAN", so_ngay_con: 1, da_xu_ly: false },
  });

  // ══════════════════════════════════════════════════════════════════
  // 16. PHIẾU NHẬP KHO & PHIẾU XUẤT KHO & KIỂM KÊ
  // ══════════════════════════════════════════════════════════════════
  console.log("📋 [16/20] Tạo phiếu nhập/xuất/kiểm kê kho...");

  const pnk1 = await prisma.phieu_nhap_kho.create({
    data: {
      ma_ncc: ncc1.id, ma_nguoi_tao: thukho.id, ma_kho: kho.id,
      tong_tien: 5600000, trang_thai: "HOAN_THANH", ghi_chu: "Nhập rau đợt 1",
      ngay_tao: addDays(today, -7), ngay_duyet: addDays(today, -7),
      da_xac_nhan_kiem_tra: true, chat_luong: "DAT",
      chi_tiet_phieu_nhap: { create: [
        { ma_bien_the: btRau300!.id, so_luong_yeu_cau: 100, so_luong_thuc_nhan: 98, don_gia: 14000 },
        { ma_bien_the: btDauTay500!.id, so_luong_yeu_cau: 50, so_luong_thuc_nhan: 50, don_gia: 128000 },
      ] },
    },
  });

  const pnk2 = await prisma.phieu_nhap_kho.create({
    data: {
      ma_ncc: ncc3.id, ma_nguoi_tao: thukho.id, ma_kho: kho.id,
      tong_tien: 15000000, trang_thai: "HOAN_THANH", ghi_chu: "Nhập gạo ST25",
      ngay_tao: addDays(today, -5), ngay_duyet: addDays(today, -5),
      da_xac_nhan_kiem_tra: true, chat_luong: "DAT",
      chi_tiet_phieu_nhap: { create: [
        { ma_bien_the: btST25_5!.id, so_luong_yeu_cau: 100, so_luong_thuc_nhan: 100, don_gia: 150000 },
      ] },
    },
  });

  // Đánh giá giao hàng NCC
  await prisma.danh_gia_giao_hang_ncc.createMany({
    data: [
      { ma_phieu_nhap: pnk1.id, ma_ncc: ncc1.id, nguoi_danh_gia_id: thukho.id, diem_chat_luong: 9, diem_dung_so_luong: 8, diem_dung_han: 10, diem_bao_goi: 9, diem_trung_binh: 9.0, co_van_de: false },
      { ma_phieu_nhap: pnk2.id, ma_ncc: ncc3.id, nguoi_danh_gia_id: thukho.id, diem_chat_luong: 8, diem_dung_so_luong: 10, diem_dung_han: 9, diem_bao_goi: 7, diem_trung_binh: 8.5, co_van_de: false },
    ],
  });

  // Phiếu xuất kho (cho đơn hàng dh1)
  const pxk1 = await prisma.phieu_xuat_kho.create({
    data: {
      ma_nguoi_tao: staff.id, ma_kho: kho.id, ma_don_hang: dh1.id,
      ly_do_xuat: "Xuất đơn hàng #" + dh1.id, trang_thai: "HOAN_THANH",
      ngay_tao: addDays(today, -14),
      chi_tiet_phieu_xuat: { create: [
        { ma_bien_the: btDauTay500!.id, so_luong_yeu_cau: 2, so_luong_thuc_xuat: 2 },
        { ma_bien_the: btRau300!.id, so_luong_yeu_cau: 3, so_luong_thuc_xuat: 3 },
      ] },
    },
  });

  // Phiếu trả NCC
  await prisma.phieu_tra_nha_cung_cap.create({
    data: {
      ma_ncc: ncc1.id, ma_nguoi_tao: thukho.id, tong_tien_hoan_du_kien: 280000, trang_thai: "HOAN_THANH",
      phieu_xuat_kho: { create: { ma_nguoi_tao: thukho.id, ma_kho: kho.id, ly_do_xuat: "Trả hàng hỏng cho NCC", trang_thai: "HOAN_THANH" } },
    },
  });

  // Phiếu kiểm kê
  await prisma.phieu_kiem_ke_kho.create({
    data: { ma_nguoi_tao: thukho.id, ma_kho: kho.id, ly_do_kiem_ke: "Kiểm kê định kỳ cuối tháng 4", trang_thai: "HOAN_THANH", ngay_tao: addDays(today, -8) },
  });

  // Kiện hàng đã xuất (chi_tiet_phieu_xuat -> kien_hang_da_xuat)
  const ctpx = await prisma.chi_tiet_phieu_xuat.findFirst({ where: { ma_phieu_xuat: pxk1.id } });
  const kienHang = await prisma.kien_hang_chi_tiet.findFirst({ where: { ma_lo_hang: loList[3].id } });
  if (ctpx && kienHang) {
    await prisma.kien_hang_da_xuat.create({
      data: { ma_chi_tiet_xuat: ctpx.id, ma_kien_hang: kienHang.id, thoi_gian_xuat: addDays(today, -14) },
    });
  }

  // Chi tiết luân chuyển kho
  const kienHangForLC = await prisma.kien_hang_chi_tiet.findFirst({ where: { ma_lo_hang: loList[0].id } });
  if (kienHangForLC) {
    await prisma.chi_tiet_luan_chuyen_kho.create({
      data: { ma_phieu_nhap: pnk1.id, ma_kien_hang: kienHangForLC.id, loai_giao_dich: "NHAP", don_gia: 14000 },
    });
  }

  // ══════════════════════════════════════════════════════════════════
  // 17. ĐÁNH GIÁ SẢN PHẨM & ẢNH ĐÁNH GIÁ
  // ══════════════════════════════════════════════════════════════════
  console.log("⭐ [17/20] Tạo đánh giá sản phẩm...");

  const dg1 = await prisma.danh_gia_san_pham.create({
    data: { ma_san_pham: sp5.id, ma_nguoi_dung: kh1.id, so_sao: 5, noi_dung: "Dâu tây rất tươi, ngọt và thơm! Giao hàng nhanh, đóng gói cẩn thận. Sẽ mua lại.", trang_thai: "DA_DUYET", phan_hoi_admin: "Cảm ơn bạn đã ủng hộ!", ngay_phan_hoi: addDays(today, -10) },
  });
  await prisma.anh_danh_gia.createMany({
    data: [
      { ma_danh_gia: dg1.id, duong_dan_anh: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400" },
      { ma_danh_gia: dg1.id, duong_dan_anh: "https://images.unsplash.com/photo-1495214783159-3503fd1b572d?w=400" },
    ],
  });

  const dg2 = await prisma.danh_gia_san_pham.create({
    data: { ma_san_pham: sp10.id, ma_nguoi_dung: kh2.id, so_sao: 4, noi_dung: "Gạo ST25 nấu cơm dẻo thơm. Bao bì đẹp. Trừ 1 sao vì giao hàng hơi chậm.", trang_thai: "DA_DUYET" },
  });

  await prisma.danh_gia_san_pham.create({
    data: { ma_san_pham: sp1.id, ma_nguoi_dung: kh3.id, so_sao: 5, noi_dung: "Rau rất tươi, xanh mướt, không xơ. Gia đình tôi rất thích!", trang_thai: "DA_DUYET" },
  });

  await prisma.danh_gia_san_pham.create({
    data: { ma_san_pham: sp14.id, ma_nguoi_dung: kh1.id, so_sao: 5, noi_dung: "Mật ong Phú Quốc chính gốc, thơm lắm. Chai thủy tinh rất sang trọng.", trang_thai: "DA_DUYET" },
  });

  await prisma.danh_gia_san_pham.create({
    data: { ma_san_pham: sp6.id, ma_nguoi_dung: kh2.id, so_sao: 3, noi_dung: "Xoài khá ngon nhưng có 2 trái bị dập. Mong cải thiện đóng gói.", trang_thai: "DA_DUYET", phan_hoi_admin: "Xin lỗi bạn, chúng tôi sẽ cải thiện đóng gói. Shop sẽ gửi bù bạn 1 quả.", ngay_phan_hoi: addDays(today, -5) },
  });

  // Đánh giá chờ duyệt
  await prisma.danh_gia_san_pham.create({
    data: { ma_san_pham: sp3.id, ma_nguoi_dung: kh3.id, so_sao: 4, noi_dung: "Cà chua ngon, mọng nước. Nấu canh vị rất tự nhiên.", trang_thai: "CHO_DUYET" },
  });

  // ══════════════════════════════════════════════════════════════════
  // 18. GIỎ HÀNG & YÊU CẦU ĐỔI TRẢ & HOÀN TIỀN & SẢN PHẨM YÊU THÍCH
  // ══════════════════════════════════════════════════════════════════
  console.log("🛒 [18/20] Tạo giỏ hàng, yêu cầu đổi trả, sản phẩm yêu thích...");

  // Giỏ hàng cho kh2
  const gh = await prisma.gio_hang.create({ data: { ma_nguoi_dung: kh2.id } });
  await prisma.chi_tiet_gio_hang.createMany({
    data: [
      { ma_gio_hang: gh.id, ma_bien_the: btDauTay500!.id, so_luong: 2 },
      { ma_gio_hang: gh.id, ma_bien_the: btRau300!.id, so_luong: 5 },
    ],
  });

  // Giỏ hàng cho kh3
  const gh2 = await prisma.gio_hang.create({ data: { ma_nguoi_dung: kh3.id } });
  await prisma.chi_tiet_gio_hang.createMany({
    data: [
      { ma_gio_hang: gh2.id, ma_bien_the: btXoai1!.id, so_luong: 3 },
    ],
  });

  // Yêu cầu đổi trả cho đơn hàng dh1 (đã giao)
  const ycdt = await prisma.yeu_cau_doi_tra.create({
    data: {
      ma_don_hang: dh1.id, ma_nguoi_dung: kh1.id, loai_yeu_cau: "DOI_HANG", trang_thai: "DA_DUYET",
      so_tien_hoan: 0, ly_do_hoan_tra: "Dâu tây 1 hộp bị dập khi vận chuyển, muốn đổi hộp khác",
      chi_tiet_doi_tra: { create: [
        { ma_bien_the: btDauTay500!.id, so_luong: 1, ly_do: "Hộp bị dập nát" },
      ] },
    },
  });

  // Lịch sử hoàn tiền
  const gdtt = await prisma.giao_dich_thanh_toan.findFirst({ where: { ma_don_hang: dh4.id } });
  if (gdtt) {
    await prisma.lich_su_hoan_tien.create({
      data: { ma_giao_dich: gdtt.id, so_tien: 155000, trang_thai: "HOAN_THANH", ngay_tao: addDays(today, -18) },
    });
  }

  // Sản phẩm yêu thích
  await prisma.san_pham_yeu_thich.createMany({
    data: [
      { ma_nguoi_dung: kh1.id, ma_san_pham: sp5.id, ngay_them: addDays(today, -20) },
      { ma_nguoi_dung: kh1.id, ma_san_pham: sp10.id, ngay_them: addDays(today, -15) },
      { ma_nguoi_dung: kh1.id, ma_san_pham: sp14.id, ngay_them: addDays(today, -10) },
      { ma_nguoi_dung: kh2.id, ma_san_pham: sp1.id, ngay_them: addDays(today, -5) },
      { ma_nguoi_dung: kh2.id, ma_san_pham: sp6.id, ngay_them: addDays(today, -3) },
      { ma_nguoi_dung: kh3.id, ma_san_pham: sp18.id, ngay_them: addDays(today, -7) },
      { ma_nguoi_dung: kh3.id, ma_san_pham: sp19.id, ngay_them: addDays(today, -2) },
    ],
  });

  // ══════════════════════════════════════════════════════════════════
  // 19. BANNER QUẢNG CÁO & THÔNG BÁO & NHIỆM VỤ & AI CHAT
  // ══════════════════════════════════════════════════════════════════
  console.log("🎨 [19/20] Tạo banner, thông báo, nhiệm vụ, chat AI...");

  await prisma.banner_quang_cao.createMany({
    data: [
      { tieu_de: "Dâu Tây Đà Lạt - Mùa Thu Hoạch 2026", mo_ta: "Giảm 15% toàn bộ dâu tây từ nay đến hết tháng 6!", duong_dan_anh: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=1200", lien_ket: "/products?category=trai-cay", loai_banner: "hero", thu_tu_sap_xep: 1, dang_hoat_dong: true, ngay_bat_dau: today, ngay_ket_thuc: addDays(today, 30) },
      { tieu_de: "Gạo ST25 Sóc Trăng Mới Về", mo_ta: "Gạo ngon nhất thế giới, vụ xuân 2026", duong_dan_anh: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=1200", lien_ket: "/products?category=gao", loai_banner: "hero", thu_tu_sap_xep: 2, dang_hoat_dong: true, ngay_bat_dau: today, ngay_ket_thuc: addDays(today, 60) },
      { tieu_de: "Free Ship Đơn Từ 200K", mo_ta: "Áp dụng mã FREESHIP50", duong_dan_anh: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200", lien_ket: "/promotions", loai_banner: "sub", thu_tu_sap_xep: 3, dang_hoat_dong: true, ngay_bat_dau: today, ngay_ket_thuc: addDays(today, 15) },
      { tieu_de: "Nấm Linh Chi Đà Lạt", mo_ta: "Bổ sung sức khỏe cho gia đình bạn", duong_dan_anh: "https://images.unsplash.com/photo-1547592180-85f173990554?w=800", lien_ket: "/products?category=nam", loai_banner: "sub", thu_tu_sap_xep: 4, dang_hoat_dong: true },
    ],
  });

  // Thông báo
  await prisma.thong_bao.createMany({
    data: [
      { ma_nguoi_dung: kh1.id, tieu_de: "Đơn hàng đã giao thành công", noi_dung: `Đơn hàng #${dh1.id} đã được giao thành công. Cảm ơn bạn!`, loai_thong_bao: "DON_HANG", da_doc: true, ngay_tao: addDays(today, -11) },
      { ma_nguoi_dung: kh1.id, tieu_de: "Yêu cầu đổi hàng đã được duyệt", noi_dung: "Yêu cầu đổi dâu tây đã được admin duyệt. Shipper sẽ đến lấy hàng.", loai_thong_bao: "DOI_TRA", da_doc: true, ngay_tao: addDays(today, -9) },
      { ma_nguoi_dung: kh2.id, tieu_de: "Đơn hàng đang được giao", noi_dung: `Đơn hàng #${dh2.id} đang trên đường giao đến bạn.`, loai_thong_bao: "DON_HANG", da_doc: false, ngay_tao: addDays(today, -1) },
      { ma_nguoi_dung: kh3.id, tieu_de: "Đơn hàng mới đã đặt", noi_dung: `Đơn hàng #${dh3.id} đã được đặt thành công. Chờ xác nhận.`, loai_thong_bao: "DON_HANG", da_doc: false, ngay_tao: addDays(today, -1) },
      { ma_nguoi_dung: admin.id, tieu_de: "Lô hàng sắp hết hạn", noi_dung: "Lô LO-RM-WARN-001 sẽ hết hạn trong 1 ngày. Vui lòng xử lý.", loai_thong_bao: "CANH_BAO", da_doc: false, ngay_tao: today },
      { ma_nguoi_dung: staff.id, tieu_de: "Nhiệm vụ mới: Đóng gói đơn #" + dh5.id, noi_dung: "Bạn được giao nhiệm vụ đóng gói đơn hàng mới.", loai_thong_bao: "NHIEM_VU", da_doc: false, ngay_tao: today },
    ],
  });

  // Nhiệm vụ công việc
  await prisma.nhiem_vu_cong_viec.createMany({
    data: [
      { ma_nguoi_dung: staff.id, ma_don_hang: dh5.id, loai_nhiem_vu: "DONG_GOI", trang_thai: "DANG_THUC_HIEN", thoi_gian_giao: today },
      { ma_nguoi_dung: staff.id, ma_don_hang: dh2.id, loai_nhiem_vu: "XUAT_KHO", trang_thai: "HOAN_THANH", thoi_gian_giao: addDays(today, -2), thoi_gian_hoan_thanh: addDays(today, -1) },
      { ma_nguoi_dung: thukho.id, ma_don_hang: dh3.id, loai_nhiem_vu: "KIEM_HANG", trang_thai: "CHUA_THUC_HIEN", thoi_gian_giao: today },
    ],
  });

  // Phiên chat AI
  const phien = await prisma.phien_chat_ai.create({ data: { ma_nguoi_dung: kh1.id, ma_phien_chat: "CHAT-001-" + Date.now() } });
  await prisma.tin_nhan_chat_ai.createMany({
    data: [
      { ma_phien_chat: phien.id, vai_tro_nguoi_gui: "user", noi_dung: "Xoài Cát Hoà Lộc có ship được ra Đà Nẵng không?" },
      { ma_phien_chat: phien.id, vai_tro_nguoi_gui: "assistant", noi_dung: "Dạ có ạ! Xoài Cát Hoà Lộc hiện ship toàn quốc. Với đơn hàng đi Đà Nẵng, thời gian giao dự kiến 2-3 ngày. Phí ship khoảng 30.000-35.000đ tùy trọng lượng." },
      { ma_phien_chat: phien.id, vai_tro_nguoi_gui: "user", noi_dung: "Tốt, cho tôi 5kg nhé" },
      { ma_phien_chat: phien.id, vai_tro_nguoi_gui: "assistant", noi_dung: "Tuyệt vời! Tôi đã thêm Xoài Cát Hoà Lộc - Thùng 5kg (350.000đ) vào giỏ hàng của bạn. Bạn muốn thanh toán luôn hay tiếp tục mua sắm?" },
    ],
  });

  // ══════════════════════════════════════════════════════════════════
  // 20. LỊCH SỬ ĐĂNG NHẬP & FILE & KHO TRI THỨC AI & CA LÀM VIỆC
  // ══════════════════════════════════════════════════════════════════
  console.log("📊 [20/20] Tạo lịch sử đăng nhập, file, ca làm việc...");

  // Lịch sử đăng nhập
  await prisma.lich_su_dang_nhap.createMany({
    data: [
      { ma_nguoi_dung: admin.id, thoi_gian_dang_nhap: addDays(today, -1), thiet_bi: "Chrome 125 / Windows 11 / Desktop" },
      { ma_nguoi_dung: admin.id, thoi_gian_dang_nhap: today, thiet_bi: "Chrome 125 / Windows 11 / Desktop" },
      { ma_nguoi_dung: kh1.id, thoi_gian_dang_nhap: addDays(today, -2), thiet_bi: "Safari / iPhone 15 / iOS 18" },
      { ma_nguoi_dung: kh1.id, thoi_gian_dang_nhap: today, thiet_bi: "Chrome 125 / MacOS Sequoia / Laptop" },
      { ma_nguoi_dung: kh2.id, thoi_gian_dang_nhap: addDays(today, -3), thiet_bi: "Firefox 126 / Ubuntu 24 / Desktop" },
      { ma_nguoi_dung: staff.id, thoi_gian_dang_nhap: today, thiet_bi: "Chrome 125 / Android 14 / Mobile" },
      { ma_nguoi_dung: thukho.id, thoi_gian_dang_nhap: today, thiet_bi: "Edge / Windows 11 / Desktop" },
    ],
  });

  // File tải lên
  await prisma.quan_ly_file_tai_len.createMany({
    data: [
      { duong_dan_file: "/uploads/products/rau-muong-vietgap-01.jpg", loai_file: "image/jpeg" },
      { duong_dan_file: "/uploads/products/dau-tay-dalat-01.jpg", loai_file: "image/jpeg" },
      { duong_dan_file: "/uploads/contracts/HD-2024-001.pdf", loai_file: "application/pdf" },
      { duong_dan_file: "/uploads/certificates/vietgap-cert.png", loai_file: "image/png" },
      { duong_dan_file: "/uploads/reviews/review-dautay-01.jpg", loai_file: "image/jpeg" },
    ],
  });

  // Kho tri thức AI
  await prisma.kho_tri_thuc_ai.createMany({
    data: [
      { loai_du_lieu: "SAN_PHAM", ma_thuc_the: sp5.id, noi_dung_van_ban: "Dâu tây Đà Lạt giống Nhật, trồng nhà kính độ cao 1500m. Ship toàn quốc bảo quản lạnh. Mùa thu hoạch: quanh năm, ngon nhất tháng 11-3." },
      { loai_du_lieu: "SAN_PHAM", ma_thuc_the: sp10.id, noi_dung_van_ban: "Gạo ST25 Sóc Trăng - Giải nhì gạo ngon nhất thế giới 2019. Hạt dài, cơm dẻo mềm, thơm lá dứa. Bảo quản nơi khô ráo, hạn sử dụng 12 tháng." },
      { loai_du_lieu: "CHINH_SACH", noi_dung_van_ban: "Chính sách đổi trả: 7 ngày kể từ ngày nhận hàng. Sản phẩm tươi sống đổi trả trong 24h nếu không đạt chất lượng. Hoàn tiền trong 3-5 ngày làm việc." },
      { loai_du_lieu: "VAN_CHUYEN", noi_dung_van_ban: "Ship COD toàn quốc. Free ship đơn từ 500K nội thành HCM/Đà Nẵng/Hà Nội. Thời gian giao: nội thành 1-2h, liên tỉnh 2-4 ngày." },
    ],
  });

  // Ca làm việc (dùng cho module HR)
  const caSang = await prisma.ca_lam_viec.create({ data: { ten_ca: "Ca Sáng", gio_bat_dau: new Date("1970-01-01T06:00:00.000Z"), gio_ket_thuc: new Date("1970-01-01T14:00:00.000Z") } });
  const caChieu = await prisma.ca_lam_viec.create({ data: { ten_ca: "Ca Chiều", gio_bat_dau: new Date("1970-01-01T14:00:00.000Z"), gio_ket_thuc: new Date("1970-01-01T22:00:00.000Z") } });
  const caToi = await prisma.ca_lam_viec.create({ data: { ten_ca: "Ca Tối", gio_bat_dau: new Date("1970-01-01T22:00:00.000Z"), gio_ket_thuc: new Date("1970-01-02T06:00:00.000Z") } });

  // Phân ca cho staff & thukho
  await prisma.lich_phan_cong_ca.createMany({
    data: [
      { ma_nguoi_dung: staff.id, ma_ca_lam: caSang.id, ngay_lam_viec: today },
      { ma_nguoi_dung: staff.id, ma_ca_lam: caSang.id, ngay_lam_viec: addDays(today, 1) },
      { ma_nguoi_dung: thukho.id, ma_ca_lam: caSang.id, ngay_lam_viec: today },
      { ma_nguoi_dung: thukho.id, ma_ca_lam: caChieu.id, ngay_lam_viec: addDays(today, 1) },
    ],
  });

  // Chấm công
  const gioVaoStaff = new Date(today);
  gioVaoStaff.setHours(5, 55, 0, 0);
  await prisma.lich_su_cham_cong.createMany({
    data: [
      { ma_nguoi_dung: staff.id, ma_ca_lam: caSang.id, gio_vao: gioVaoStaff, trang_thai: "DUNG_GIO", so_phut_tre: 0 },
      { ma_nguoi_dung: thukho.id, ma_ca_lam: caSang.id, gio_vao: new Date(today.getTime() + 6 * 60 * 60 * 1000 + 10 * 60 * 1000), trang_thai: "DI_TRE", so_phut_tre: 10 },
    ],
  });

  // Bảng lương tháng
  await prisma.bang_luong_thang.createMany({
    data: [
      { ma_nguoi_dung: staff.id, thang: 4, nam: 2026, tong_gio_thuc_te: 168, luong_co_ban: 5880000, phu_cap_ca_toi: 0, thuong_chuyen_can: 500000, khau_tru_tre: 0, thuc_nhan: 6380000, da_chot: true },
      { ma_nguoi_dung: thukho.id, thang: 4, nam: 2026, tong_gio_thuc_te: 176, luong_co_ban: 7920000, phu_cap_ca_toi: 200000, thuong_chuyen_can: 500000, khau_tru_tre: 75000, thuc_nhan: 8545000, da_chot: true },
      { ma_nguoi_dung: staff.id, thang: 5, nam: 2026, tong_gio_thuc_te: 40, luong_co_ban: 1400000, phu_cap_ca_toi: 0, thuong_chuyen_can: 0, khau_tru_tre: 0, thuc_nhan: 1400000, da_chot: false },
    ],
  });

  // Đơn xin nghỉ
  await prisma.don_xin_nghi.createMany({
    data: [
      { ma_nguoi_dung: staff.id, loai_nghi: "PHEP_NAM", ngay_bat_dau: addDays(today, 5), ngay_ket_thuc: addDays(today, 6), ly_do: "Về quê thăm gia đình", trang_thai: "CHO_DUYET", ngay_tao: today },
      { ma_nguoi_dung: thukho.id, loai_nghi: "NGHI_BENH", ngay_bat_dau: addDays(today, -10), ngay_ket_thuc: addDays(today, -9), ly_do: "Đau lưng cần nghỉ ngơi", trang_thai: "DA_DUYET", nguoi_duyet_id: admin.id, ngay_tao: addDays(today, -12) },
    ],
  });

  // ══════════════════════════════════════════════════════════════════
  // HOÀN THÀNH
  // ══════════════════════════════════════════════════════════════════
  console.log("\n" + "═".repeat(60));
  console.log("✅ SEED TOÀN BỘ DỮ LIỆU HOÀN THÀNH!");
  console.log("═".repeat(60));
  console.log(`
📊 Tổng kết:
  • Phân hệ hệ thống: 7 | Chức năng: 12 | Quyền hạn: 5
  • Vai trò: 4 (ADMIN, STAFF, THU_KHO, KHACH_HANG)
  • Người dùng: 6 (1 admin, 1 staff, 1 thủ kho, 3 khách hàng)
  • Địa chỉ: 5
  • Danh mục: 8 gốc + 4 con
  • Thẻ từ khóa: 8
  • Nhà cung cấp: 5 (đầy đủ thông tin)
  • Sản phẩm: 20 (với ảnh, chứng chỉ, biến thể, thẻ)
  • NCC-Sản phẩm: 11 liên kết
  • Hợp đồng NCC: 5 | Lịch đặt hàng: 4 | Công nợ: 5
  • Phương thức thanh toán: 4 | Mã giảm giá: 5
  • Đơn hàng: 5 (nhiều trạng thái) + lịch sử
  • Giao dịch thanh toán: 5
  • Đối tác vận chuyển: 3 | Đơn vận chuyển: 3
  • Kho hàng: 2 | Vị trí: 6 | Lô hàng: 5
  • Tồn kho: 5 | Kiện hàng: 15 | Cảnh báo: 1
  • Phiếu nhập: 2 | Phiếu xuất: 2 | Kiểm kê: 1
  • Đánh giá sản phẩm: 6 | Ảnh đánh giá: 2
  • Giỏ hàng: 2 | Yêu cầu đổi trả: 1 | Hoàn tiền: 1
  • Sản phẩm yêu thích: 7
  • Banner quảng cáo: 4
  • Thông báo: 6 | Nhiệm vụ: 3
  • Chat AI: 1 phiên + 4 tin nhắn
  • Kho tri thức AI: 4
  • Lịch sử đăng nhập: 7 | File: 5
  • Ca làm việc: 3 | Phân ca: 4 | Chấm công: 2
  • Bảng lương: 3 | Đơn xin nghỉ: 2
  • Đánh giá giao hàng NCC: 2

🔑 Tài khoản test:
  • Admin: admin@nongsan.vn / 123456
  • Staff: staff@nongsan.vn / 123456
  • Thủ kho: thukho@nongsan.vn / 123456
  • Khách 1: khach1@gmail.com / 123456
  • Khách 2: khach2@gmail.com / 123456
  • Khách 3: khach3@gmail.com / 123456
  `);
}

main()
  .catch((e) => { console.error("❌ Lỗi:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
