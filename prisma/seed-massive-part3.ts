/**
 * SEED MASSIVE PART 3 - Dữ liệu đơn hàng, thanh toán, vận chuyển, kho hàng
 * File dữ liệu STANDALONE - chỉ export constants, không có logic Prisma
 *
 * Chạy bằng cách import vào seed chính hoặc dùng trực tiếp
 */

// ═══════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function subDays(date: Date, days: number): Date {
  return addDays(date, -days);
}

const today = new Date('2026-05-14T00:00:00.000Z');

// ═══════════════════════════════════════════════════════════════════
// 1. PHƯƠNG THỨC THANH TOÁN (4)
// ═══════════════════════════════════════════════════════════════════

export const phuongThucThanhToan = [
  { id: 1, ten_phuong_thuc: 'COD' },
  { id: 2, ten_phuong_thuc: 'VNPAY' },
  { id: 3, ten_phuong_thuc: 'MOMO' },
  { id: 4, ten_phuong_thuc: 'BANK_TRANSFER' },
];

// ═══════════════════════════════════════════════════════════════════
// 2. MÃ GIẢM GIÁ (10)
// ═══════════════════════════════════════════════════════════════════

export const maGiamGia = [
  {
    id: 1, ma_code: 'WELCOME10', loai_giam_gia: 'PHAN_TRAM',
    gia_tri_giam: 10, don_toi_thieu: 100000, gioi_han_su_dung: 100,
    ngay_bat_dau: subDays(today, 30), ngay_ket_thuc: addDays(today, 60),
    ma_bien_the_ap_dung: null,
  },
  {
    id: 2, ma_code: 'SUMMER20', loai_giam_gia: 'PHAN_TRAM',
    gia_tri_giam: 20, don_toi_thieu: 200000, gioi_han_su_dung: 50,
    ngay_bat_dau: subDays(today, 10), ngay_ket_thuc: addDays(today, 45),
    ma_bien_the_ap_dung: null,
  },
  {
    id: 3, ma_code: 'FREESHIP', loai_giam_gia: 'CO_DINH',
    gia_tri_giam: 30000, don_toi_thieu: 150000, gioi_han_su_dung: 200,
    ngay_bat_dau: subDays(today, 15), ngay_ket_thuc: addDays(today, 30),
    ma_bien_the_ap_dung: null,
  },
  {
    id: 4, ma_code: 'VIP50', loai_giam_gia: 'CO_DINH',
    gia_tri_giam: 50000, don_toi_thieu: 500000, gioi_han_su_dung: 20,
    ngay_bat_dau: subDays(today, 5), ngay_ket_thuc: addDays(today, 90),
    ma_bien_the_ap_dung: null,
  },
  {
    id: 5, ma_code: 'NOEL2025', loai_giam_gia: 'PHAN_TRAM',
    gia_tri_giam: 15, don_toi_thieu: 300000, gioi_han_su_dung: 80,
    ngay_bat_dau: new Date('2025-12-20T00:00:00.000Z'), ngay_ket_thuc: new Date('2025-12-31T23:59:59.000Z'),
    ma_bien_the_ap_dung: null,
  },
  {
    id: 6, ma_code: 'TETAM', loai_giam_gia: 'PHAN_TRAM',
    gia_tri_giam: 25, don_toi_thieu: 400000, gioi_han_su_dung: 60,
    ngay_bat_dau: new Date('2026-01-20T00:00:00.000Z'), ngay_ket_thuc: new Date('2026-02-10T23:59:59.000Z'),
    ma_bien_the_ap_dung: null,
  },
  {
    id: 7, ma_code: 'ORGANIC10', loai_giam_gia: 'PHAN_TRAM',
    gia_tri_giam: 10, don_toi_thieu: 250000, gioi_han_su_dung: 150,
    ngay_bat_dau: subDays(today, 20), ngay_ket_thuc: addDays(today, 40),
    ma_bien_the_ap_dung: 1,
  },
  {
    id: 8, ma_code: 'NEWUSER', loai_giam_gia: 'CO_DINH',
    gia_tri_giam: 20000, don_toi_thieu: 50000, gioi_han_su_dung: 500,
    ngay_bat_dau: subDays(today, 60), ngay_ket_thuc: addDays(today, 120),
    ma_bien_the_ap_dung: null,
  },
  {
    id: 9, ma_code: 'BUNDLE100', loai_giam_gia: 'CO_DINH',
    gia_tri_giam: 100000, don_toi_thieu: 1000000, gioi_han_su_dung: 10,
    ngay_bat_dau: subDays(today, 7), ngay_ket_thuc: addDays(today, 14),
    ma_bien_the_ap_dung: null,
  },
  {
    id: 10, ma_code: 'FLASH50', loai_giam_gia: 'CO_DINH',
    gia_tri_giam: 50000, don_toi_thieu: 200000, gioi_han_su_dung: 30,
    ngay_bat_dau: subDays(today, 1), ngay_ket_thuc: addDays(today, 2),
    ma_bien_the_ap_dung: null,
  },
];

// ═══════════════════════════════════════════════════════════════════
// 3. ĐƠN HÀNG (50)
// Status distribution: 5 CHO_XAC_NHAN, 5 DA_XAC_NHAN, 5 DANG_DONG_GOI,
//                      10 DANG_GIAO, 20 DA_GIAO, 5 DA_HUY
// ═══════════════════════════════════════════════════════════════════

export const donHang = [
  // --- CHO_XAC_NHAN (5) ---
  { id: 1, ma_nguoi_dung: 4, ma_khuyen_mai: null, tong_tien: 245000, phi_van_chuyen: 30000, trang_thai: 'CHO_XAC_NHAN', ngay_tao: subDays(today, 0), ghi_chu: 'Giao buoi sang', ma_dia_chi: 1, ho_ten_nguoi_nhan: 'Nguyen Van Khach', sdt_nguoi_nhan: '0901234567', dia_chi_giao_hang: '123 Nguyen Trai, Q1, HCM', ma_tinh_ghn: 202, ma_quan_huyen_ghn: 1442, ma_phuong_xa_ghn: '20304' },
  { id: 2, ma_nguoi_dung: 5, ma_khuyen_mai: null, tong_tien: 480000, phi_van_chuyen: 25000, trang_thai: 'CHO_XAC_NHAN', ngay_tao: subDays(today, 0), ghi_chu: null, ma_dia_chi: 2, ho_ten_nguoi_nhan: 'Tran Thi Lan', sdt_nguoi_nhan: '0912345678', dia_chi_giao_hang: '45 Le Loi, Q3, HCM', ma_tinh_ghn: 202, ma_quan_huyen_ghn: 1443, ma_phuong_xa_ghn: '20401' },
  { id: 3, ma_nguoi_dung: 6, ma_khuyen_mai: 1, tong_tien: 367000, phi_van_chuyen: 30000, trang_thai: 'CHO_XAC_NHAN', ngay_tao: subDays(today, 1), ghi_chu: 'De truoc cua', ma_dia_chi: 3, ho_ten_nguoi_nhan: 'Le Minh Tuan', sdt_nguoi_nhan: '0923456789', dia_chi_giao_hang: '78 Hai Ba Trung, Hai Chau, Da Nang', ma_tinh_ghn: 203, ma_quan_huyen_ghn: 1527, ma_phuong_xa_ghn: '30101' },
  { id: 4, ma_nguoi_dung: 7, ma_khuyen_mai: null, tong_tien: 152000, phi_van_chuyen: 20000, trang_thai: 'CHO_XAC_NHAN', ngay_tao: subDays(today, 0), ghi_chu: null, ma_dia_chi: 4, ho_ten_nguoi_nhan: 'Pham Thi Hoa', sdt_nguoi_nhan: '0934567890', dia_chi_giao_hang: '12 Tran Phu, Thanh Khe, Da Nang', ma_tinh_ghn: 203, ma_quan_huyen_ghn: 1528, ma_phuong_xa_ghn: '30201' },
  { id: 5, ma_nguoi_dung: 8, ma_khuyen_mai: null, tong_tien: 890000, phi_van_chuyen: 35000, trang_thai: 'CHO_XAC_NHAN', ngay_tao: subDays(today, 1), ghi_chu: 'Goi ky truoc khi giao', ma_dia_chi: 5, ho_ten_nguoi_nhan: 'Vo Quoc Dat', sdt_nguoi_nhan: '0945678901', dia_chi_giao_hang: '90 Nguyen Hue, Hoan Kiem, Ha Noi', ma_tinh_ghn: 201, ma_quan_huyen_ghn: 1482, ma_phuong_xa_ghn: '10101' },

  // --- DA_XAC_NHAN (5) ---
  { id: 6, ma_nguoi_dung: 4, ma_khuyen_mai: 2, tong_tien: 520000, phi_van_chuyen: 25000, trang_thai: 'DA_XAC_NHAN', ngay_tao: subDays(today, 2), ghi_chu: null, ma_dia_chi: 1, ho_ten_nguoi_nhan: 'Nguyen Van Khach', sdt_nguoi_nhan: '0901234567', dia_chi_giao_hang: '123 Nguyen Trai, Q1, HCM', ma_tinh_ghn: 202, ma_quan_huyen_ghn: 1442, ma_phuong_xa_ghn: '20304' },
  { id: 7, ma_nguoi_dung: 9, ma_khuyen_mai: null, tong_tien: 310000, phi_van_chuyen: 30000, trang_thai: 'DA_XAC_NHAN', ngay_tao: subDays(today, 2), ghi_chu: 'Lien he truoc khi giao', ma_dia_chi: 6, ho_ten_nguoi_nhan: 'Hoang Duc Manh', sdt_nguoi_nhan: '0956789012', dia_chi_giao_hang: '56 Ly Tu Trong, Q1, HCM', ma_tinh_ghn: 202, ma_quan_huyen_ghn: 1442, ma_phuong_xa_ghn: '20305' },
  { id: 8, ma_nguoi_dung: 10, ma_khuyen_mai: null, tong_tien: 675000, phi_van_chuyen: 30000, trang_thai: 'DA_XAC_NHAN', ngay_tao: subDays(today, 1), ghi_chu: null, ma_dia_chi: 7, ho_ten_nguoi_nhan: 'Bui Thi Mai', sdt_nguoi_nhan: '0967890123', dia_chi_giao_hang: '34 Ba Trieu, Q.Thanh Xuan, Ha Noi', ma_tinh_ghn: 201, ma_quan_huyen_ghn: 1490, ma_phuong_xa_ghn: '10501' },
  { id: 9, ma_nguoi_dung: 11, ma_khuyen_mai: null, tong_tien: 198000, phi_van_chuyen: 20000, trang_thai: 'DA_XAC_NHAN', ngay_tao: subDays(today, 1), ghi_chu: null, ma_dia_chi: 8, ho_ten_nguoi_nhan: 'Dang Van Son', sdt_nguoi_nhan: '0978901234', dia_chi_giao_hang: '67 Phan Chau Trinh, Hai Chau, Da Nang', ma_tinh_ghn: 203, ma_quan_huyen_ghn: 1527, ma_phuong_xa_ghn: '30102' },
  { id: 10, ma_nguoi_dung: 12, ma_khuyen_mai: 3, tong_tien: 445000, phi_van_chuyen: 0, trang_thai: 'DA_XAC_NHAN', ngay_tao: subDays(today, 2), ghi_chu: 'Freeship', ma_dia_chi: 9, ho_ten_nguoi_nhan: 'Ly Thanh Nha', sdt_nguoi_nhan: '0989012345', dia_chi_giao_hang: '23 Ton Duc Thang, Q.Binh Thanh, HCM', ma_tinh_ghn: 202, ma_quan_huyen_ghn: 1444, ma_phuong_xa_ghn: '20501' },

  // --- DANG_DONG_GOI (5) ---
  { id: 11, ma_nguoi_dung: 5, ma_khuyen_mai: null, tong_tien: 720000, phi_van_chuyen: 30000, trang_thai: 'DANG_DONG_GOI', ngay_tao: subDays(today, 3), ghi_chu: null, ma_dia_chi: 2, ho_ten_nguoi_nhan: 'Tran Thi Lan', sdt_nguoi_nhan: '0912345678', dia_chi_giao_hang: '45 Le Loi, Q3, HCM', ma_tinh_ghn: 202, ma_quan_huyen_ghn: 1443, ma_phuong_xa_ghn: '20401' },
  { id: 12, ma_nguoi_dung: 6, ma_khuyen_mai: null, tong_tien: 256000, phi_van_chuyen: 25000, trang_thai: 'DANG_DONG_GOI', ngay_tao: subDays(today, 3), ghi_chu: 'Dong goi can than', ma_dia_chi: 3, ho_ten_nguoi_nhan: 'Le Minh Tuan', sdt_nguoi_nhan: '0923456789', dia_chi_giao_hang: '78 Hai Ba Trung, Hai Chau, Da Nang', ma_tinh_ghn: 203, ma_quan_huyen_ghn: 1527, ma_phuong_xa_ghn: '30101' },
  { id: 13, ma_nguoi_dung: 7, ma_khuyen_mai: null, tong_tien: 1150000, phi_van_chuyen: 0, trang_thai: 'DANG_DONG_GOI', ngay_tao: subDays(today, 2), ghi_chu: 'Don B2B', ma_dia_chi: 4, ho_ten_nguoi_nhan: 'Pham Thi Hoa', sdt_nguoi_nhan: '0934567890', dia_chi_giao_hang: '12 Tran Phu, Thanh Khe, Da Nang', ma_tinh_ghn: 203, ma_quan_huyen_ghn: 1528, ma_phuong_xa_ghn: '30201' },
  { id: 14, ma_nguoi_dung: 13, ma_khuyen_mai: null, tong_tien: 395000, phi_van_chuyen: 30000, trang_thai: 'DANG_DONG_GOI', ngay_tao: subDays(today, 2), ghi_chu: null, ma_dia_chi: 10, ho_ten_nguoi_nhan: 'Ngo Bao Ngoc', sdt_nguoi_nhan: '0990123456', dia_chi_giao_hang: '99 Vo Van Ngan, Thu Duc, HCM', ma_tinh_ghn: 202, ma_quan_huyen_ghn: 3695, ma_phuong_xa_ghn: '20901' },
  { id: 15, ma_nguoi_dung: 8, ma_khuyen_mai: null, tong_tien: 580000, phi_van_chuyen: 35000, trang_thai: 'DANG_DONG_GOI', ngay_tao: subDays(today, 3), ghi_chu: null, ma_dia_chi: 5, ho_ten_nguoi_nhan: 'Vo Quoc Dat', sdt_nguoi_nhan: '0945678901', dia_chi_giao_hang: '90 Nguyen Hue, Hoan Kiem, Ha Noi', ma_tinh_ghn: 201, ma_quan_huyen_ghn: 1482, ma_phuong_xa_ghn: '10101' },

  // --- DANG_GIAO (10) ---
  { id: 16, ma_nguoi_dung: 4, ma_khuyen_mai: null, tong_tien: 340000, phi_van_chuyen: 25000, trang_thai: 'DANG_GIAO', ngay_tao: subDays(today, 5), ghi_chu: null, ma_dia_chi: 1, ho_ten_nguoi_nhan: 'Nguyen Van Khach', sdt_nguoi_nhan: '0901234567', dia_chi_giao_hang: '123 Nguyen Trai, Q1, HCM', ma_tinh_ghn: 202, ma_quan_huyen_ghn: 1442, ma_phuong_xa_ghn: '20304' },
  { id: 17, ma_nguoi_dung: 5, ma_khuyen_mai: null, tong_tien: 620000, phi_van_chuyen: 30000, trang_thai: 'DANG_GIAO', ngay_tao: subDays(today, 4), ghi_chu: 'Giao chieu', ma_dia_chi: 2, ho_ten_nguoi_nhan: 'Tran Thi Lan', sdt_nguoi_nhan: '0912345678', dia_chi_giao_hang: '45 Le Loi, Q3, HCM', ma_tinh_ghn: 202, ma_quan_huyen_ghn: 1443, ma_phuong_xa_ghn: '20401' },
  { id: 18, ma_nguoi_dung: 6, ma_khuyen_mai: 8, tong_tien: 185000, phi_van_chuyen: 20000, trang_thai: 'DANG_GIAO', ngay_tao: subDays(today, 5), ghi_chu: null, ma_dia_chi: 3, ho_ten_nguoi_nhan: 'Le Minh Tuan', sdt_nguoi_nhan: '0923456789', dia_chi_giao_hang: '78 Hai Ba Trung, Hai Chau, Da Nang', ma_tinh_ghn: 203, ma_quan_huyen_ghn: 1527, ma_phuong_xa_ghn: '30101' },
  { id: 19, ma_nguoi_dung: 9, ma_khuyen_mai: null, tong_tien: 950000, phi_van_chuyen: 0, trang_thai: 'DANG_GIAO', ngay_tao: subDays(today, 4), ghi_chu: 'Don lon mien phi ship', ma_dia_chi: 6, ho_ten_nguoi_nhan: 'Hoang Duc Manh', sdt_nguoi_nhan: '0956789012', dia_chi_giao_hang: '56 Ly Tu Trong, Q1, HCM', ma_tinh_ghn: 202, ma_quan_huyen_ghn: 1442, ma_phuong_xa_ghn: '20305' },
  { id: 20, ma_nguoi_dung: 10, ma_khuyen_mai: null, tong_tien: 275000, phi_van_chuyen: 30000, trang_thai: 'DANG_GIAO', ngay_tao: subDays(today, 3), ghi_chu: null, ma_dia_chi: 7, ho_ten_nguoi_nhan: 'Bui Thi Mai', sdt_nguoi_nhan: '0967890123', dia_chi_giao_hang: '34 Ba Trieu, Q.Thanh Xuan, Ha Noi', ma_tinh_ghn: 201, ma_quan_huyen_ghn: 1490, ma_phuong_xa_ghn: '10501' },
  { id: 21, ma_nguoi_dung: 11, ma_khuyen_mai: null, tong_tien: 430000, phi_van_chuyen: 25000, trang_thai: 'DANG_GIAO', ngay_tao: subDays(today, 4), ghi_chu: null, ma_dia_chi: 8, ho_ten_nguoi_nhan: 'Dang Van Son', sdt_nguoi_nhan: '0978901234', dia_chi_giao_hang: '67 Phan Chau Trinh, Hai Chau, Da Nang', ma_tinh_ghn: 203, ma_quan_huyen_ghn: 1527, ma_phuong_xa_ghn: '30102' },
  { id: 22, ma_nguoi_dung: 12, ma_khuyen_mai: null, tong_tien: 560000, phi_van_chuyen: 30000, trang_thai: 'DANG_GIAO', ngay_tao: subDays(today, 5), ghi_chu: 'Giao sang som', ma_dia_chi: 9, ho_ten_nguoi_nhan: 'Ly Thanh Nha', sdt_nguoi_nhan: '0989012345', dia_chi_giao_hang: '23 Ton Duc Thang, Q.Binh Thanh, HCM', ma_tinh_ghn: 202, ma_quan_huyen_ghn: 1444, ma_phuong_xa_ghn: '20501' },
  { id: 23, ma_nguoi_dung: 13, ma_khuyen_mai: null, tong_tien: 815000, phi_van_chuyen: 0, trang_thai: 'DANG_GIAO', ngay_tao: subDays(today, 3), ghi_chu: null, ma_dia_chi: 10, ho_ten_nguoi_nhan: 'Ngo Bao Ngoc', sdt_nguoi_nhan: '0990123456', dia_chi_giao_hang: '99 Vo Van Ngan, Thu Duc, HCM', ma_tinh_ghn: 202, ma_quan_huyen_ghn: 3695, ma_phuong_xa_ghn: '20901' },
  { id: 24, ma_nguoi_dung: 4, ma_khuyen_mai: null, tong_tien: 198000, phi_van_chuyen: 25000, trang_thai: 'DANG_GIAO', ngay_tao: subDays(today, 4), ghi_chu: null, ma_dia_chi: 1, ho_ten_nguoi_nhan: 'Nguyen Van Khach', sdt_nguoi_nhan: '0901234567', dia_chi_giao_hang: '123 Nguyen Trai, Q1, HCM', ma_tinh_ghn: 202, ma_quan_huyen_ghn: 1442, ma_phuong_xa_ghn: '20304' },
  { id: 25, ma_nguoi_dung: 7, ma_khuyen_mai: null, tong_tien: 1250000, phi_van_chuyen: 0, trang_thai: 'DANG_GIAO', ngay_tao: subDays(today, 3), ghi_chu: 'Don B2B so luong lon', ma_dia_chi: 4, ho_ten_nguoi_nhan: 'Pham Thi Hoa', sdt_nguoi_nhan: '0934567890', dia_chi_giao_hang: '12 Tran Phu, Thanh Khe, Da Nang', ma_tinh_ghn: 203, ma_quan_huyen_ghn: 1528, ma_phuong_xa_ghn: '30201' },

  // --- DA_GIAO (20) ---
  { id: 26, ma_nguoi_dung: 4, ma_khuyen_mai: null, tong_tien: 320000, phi_van_chuyen: 25000, trang_thai: 'DA_GIAO', ngay_tao: subDays(today, 14), ghi_chu: null, ma_dia_chi: 1, ho_ten_nguoi_nhan: 'Nguyen Van Khach', sdt_nguoi_nhan: '0901234567', dia_chi_giao_hang: '123 Nguyen Trai, Q1, HCM', ma_tinh_ghn: 202, ma_quan_huyen_ghn: 1442, ma_phuong_xa_ghn: '20304' },
  { id: 27, ma_nguoi_dung: 5, ma_khuyen_mai: null, tong_tien: 450000, phi_van_chuyen: 30000, trang_thai: 'DA_GIAO', ngay_tao: subDays(today, 12), ghi_chu: null, ma_dia_chi: 2, ho_ten_nguoi_nhan: 'Tran Thi Lan', sdt_nguoi_nhan: '0912345678', dia_chi_giao_hang: '45 Le Loi, Q3, HCM', ma_tinh_ghn: 202, ma_quan_huyen_ghn: 1443, ma_phuong_xa_ghn: '20401' },
  { id: 28, ma_nguoi_dung: 6, ma_khuyen_mai: 1, tong_tien: 287000, phi_van_chuyen: 25000, trang_thai: 'DA_GIAO', ngay_tao: subDays(today, 20), ghi_chu: null, ma_dia_chi: 3, ho_ten_nguoi_nhan: 'Le Minh Tuan', sdt_nguoi_nhan: '0923456789', dia_chi_giao_hang: '78 Hai Ba Trung, Hai Chau, Da Nang', ma_tinh_ghn: 203, ma_quan_huyen_ghn: 1527, ma_phuong_xa_ghn: '30101' },
  { id: 29, ma_nguoi_dung: 7, ma_khuyen_mai: null, tong_tien: 156000, phi_van_chuyen: 20000, trang_thai: 'DA_GIAO', ngay_tao: subDays(today, 18), ghi_chu: null, ma_dia_chi: 4, ho_ten_nguoi_nhan: 'Pham Thi Hoa', sdt_nguoi_nhan: '0934567890', dia_chi_giao_hang: '12 Tran Phu, Thanh Khe, Da Nang', ma_tinh_ghn: 203, ma_quan_huyen_ghn: 1528, ma_phuong_xa_ghn: '30201' },
  { id: 30, ma_nguoi_dung: 8, ma_khuyen_mai: null, tong_tien: 780000, phi_van_chuyen: 0, trang_thai: 'DA_GIAO', ngay_tao: subDays(today, 15), ghi_chu: null, ma_dia_chi: 5, ho_ten_nguoi_nhan: 'Vo Quoc Dat', sdt_nguoi_nhan: '0945678901', dia_chi_giao_hang: '90 Nguyen Hue, Hoan Kiem, Ha Noi', ma_tinh_ghn: 201, ma_quan_huyen_ghn: 1482, ma_phuong_xa_ghn: '10101' },
  { id: 31, ma_nguoi_dung: 9, ma_khuyen_mai: null, tong_tien: 410000, phi_van_chuyen: 30000, trang_thai: 'DA_GIAO', ngay_tao: subDays(today, 10), ghi_chu: null, ma_dia_chi: 6, ho_ten_nguoi_nhan: 'Hoang Duc Manh', sdt_nguoi_nhan: '0956789012', dia_chi_giao_hang: '56 Ly Tu Trong, Q1, HCM', ma_tinh_ghn: 202, ma_quan_huyen_ghn: 1442, ma_phuong_xa_ghn: '20305' },
  { id: 32, ma_nguoi_dung: 10, ma_khuyen_mai: null, tong_tien: 590000, phi_van_chuyen: 25000, trang_thai: 'DA_GIAO', ngay_tao: subDays(today, 11), ghi_chu: null, ma_dia_chi: 7, ho_ten_nguoi_nhan: 'Bui Thi Mai', sdt_nguoi_nhan: '0967890123', dia_chi_giao_hang: '34 Ba Trieu, Q.Thanh Xuan, Ha Noi', ma_tinh_ghn: 201, ma_quan_huyen_ghn: 1490, ma_phuong_xa_ghn: '10501' },
  { id: 33, ma_nguoi_dung: 11, ma_khuyen_mai: null, tong_tien: 235000, phi_van_chuyen: 30000, trang_thai: 'DA_GIAO', ngay_tao: subDays(today, 9), ghi_chu: null, ma_dia_chi: 8, ho_ten_nguoi_nhan: 'Dang Van Son', sdt_nguoi_nhan: '0978901234', dia_chi_giao_hang: '67 Phan Chau Trinh, Hai Chau, Da Nang', ma_tinh_ghn: 203, ma_quan_huyen_ghn: 1527, ma_phuong_xa_ghn: '30102' },
  { id: 34, ma_nguoi_dung: 12, ma_khuyen_mai: null, tong_tien: 870000, phi_van_chuyen: 0, trang_thai: 'DA_GIAO', ngay_tao: subDays(today, 13), ghi_chu: null, ma_dia_chi: 9, ho_ten_nguoi_nhan: 'Ly Thanh Nha', sdt_nguoi_nhan: '0989012345', dia_chi_giao_hang: '23 Ton Duc Thang, Q.Binh Thanh, HCM', ma_tinh_ghn: 202, ma_quan_huyen_ghn: 1444, ma_phuong_xa_ghn: '20501' },
  { id: 35, ma_nguoi_dung: 13, ma_khuyen_mai: null, tong_tien: 345000, phi_van_chuyen: 25000, trang_thai: 'DA_GIAO', ngay_tao: subDays(today, 8), ghi_chu: null, ma_dia_chi: 10, ho_ten_nguoi_nhan: 'Ngo Bao Ngoc', sdt_nguoi_nhan: '0990123456', dia_chi_giao_hang: '99 Vo Van Ngan, Thu Duc, HCM', ma_tinh_ghn: 202, ma_quan_huyen_ghn: 3695, ma_phuong_xa_ghn: '20901' },
  { id: 36, ma_nguoi_dung: 4, ma_khuyen_mai: 4, tong_tien: 1200000, phi_van_chuyen: 0, trang_thai: 'DA_GIAO', ngay_tao: subDays(today, 25), ghi_chu: 'Don VIP', ma_dia_chi: 1, ho_ten_nguoi_nhan: 'Nguyen Van Khach', sdt_nguoi_nhan: '0901234567', dia_chi_giao_hang: '123 Nguyen Trai, Q1, HCM', ma_tinh_ghn: 202, ma_quan_huyen_ghn: 1442, ma_phuong_xa_ghn: '20304' },
  { id: 37, ma_nguoi_dung: 5, ma_khuyen_mai: null, tong_tien: 189000, phi_van_chuyen: 25000, trang_thai: 'DA_GIAO', ngay_tao: subDays(today, 22), ghi_chu: null, ma_dia_chi: 2, ho_ten_nguoi_nhan: 'Tran Thi Lan', sdt_nguoi_nhan: '0912345678', dia_chi_giao_hang: '45 Le Loi, Q3, HCM', ma_tinh_ghn: 202, ma_quan_huyen_ghn: 1443, ma_phuong_xa_ghn: '20401' },
  { id: 38, ma_nguoi_dung: 6, ma_khuyen_mai: null, tong_tien: 530000, phi_van_chuyen: 30000, trang_thai: 'DA_GIAO', ngay_tao: subDays(today, 19), ghi_chu: null, ma_dia_chi: 3, ho_ten_nguoi_nhan: 'Le Minh Tuan', sdt_nguoi_nhan: '0923456789', dia_chi_giao_hang: '78 Hai Ba Trung, Hai Chau, Da Nang', ma_tinh_ghn: 203, ma_quan_huyen_ghn: 1527, ma_phuong_xa_ghn: '30101' },
  { id: 39, ma_nguoi_dung: 9, ma_khuyen_mai: null, tong_tien: 425000, phi_van_chuyen: 25000, trang_thai: 'DA_GIAO', ngay_tao: subDays(today, 17), ghi_chu: null, ma_dia_chi: 6, ho_ten_nguoi_nhan: 'Hoang Duc Manh', sdt_nguoi_nhan: '0956789012', dia_chi_giao_hang: '56 Ly Tu Trong, Q1, HCM', ma_tinh_ghn: 202, ma_quan_huyen_ghn: 1442, ma_phuong_xa_ghn: '20305' },
  { id: 40, ma_nguoi_dung: 10, ma_khuyen_mai: null, tong_tien: 695000, phi_van_chuyen: 0, trang_thai: 'DA_GIAO', ngay_tao: subDays(today, 16), ghi_chu: null, ma_dia_chi: 7, ho_ten_nguoi_nhan: 'Bui Thi Mai', sdt_nguoi_nhan: '0967890123', dia_chi_giao_hang: '34 Ba Trieu, Q.Thanh Xuan, Ha Noi', ma_tinh_ghn: 201, ma_quan_huyen_ghn: 1490, ma_phuong_xa_ghn: '10501' },
  { id: 41, ma_nguoi_dung: 11, ma_khuyen_mai: null, tong_tien: 310000, phi_van_chuyen: 30000, trang_thai: 'DA_GIAO', ngay_tao: subDays(today, 21), ghi_chu: null, ma_dia_chi: 8, ho_ten_nguoi_nhan: 'Dang Van Son', sdt_nguoi_nhan: '0978901234', dia_chi_giao_hang: '67 Phan Chau Trinh, Hai Chau, Da Nang', ma_tinh_ghn: 203, ma_quan_huyen_ghn: 1527, ma_phuong_xa_ghn: '30102' },
  { id: 42, ma_nguoi_dung: 12, ma_khuyen_mai: null, tong_tien: 480000, phi_van_chuyen: 25000, trang_thai: 'DA_GIAO', ngay_tao: subDays(today, 7), ghi_chu: null, ma_dia_chi: 9, ho_ten_nguoi_nhan: 'Ly Thanh Nha', sdt_nguoi_nhan: '0989012345', dia_chi_giao_hang: '23 Ton Duc Thang, Q.Binh Thanh, HCM', ma_tinh_ghn: 202, ma_quan_huyen_ghn: 1444, ma_phuong_xa_ghn: '20501' },
  { id: 43, ma_nguoi_dung: 13, ma_khuyen_mai: null, tong_tien: 210000, phi_van_chuyen: 20000, trang_thai: 'DA_GIAO', ngay_tao: subDays(today, 6), ghi_chu: null, ma_dia_chi: 10, ho_ten_nguoi_nhan: 'Ngo Bao Ngoc', sdt_nguoi_nhan: '0990123456', dia_chi_giao_hang: '99 Vo Van Ngan, Thu Duc, HCM', ma_tinh_ghn: 202, ma_quan_huyen_ghn: 3695, ma_phuong_xa_ghn: '20901' },
  { id: 44, ma_nguoi_dung: 4, ma_khuyen_mai: null, tong_tien: 567000, phi_van_chuyen: 30000, trang_thai: 'DA_GIAO', ngay_tao: subDays(today, 30), ghi_chu: null, ma_dia_chi: 1, ho_ten_nguoi_nhan: 'Nguyen Van Khach', sdt_nguoi_nhan: '0901234567', dia_chi_giao_hang: '123 Nguyen Trai, Q1, HCM', ma_tinh_ghn: 202, ma_quan_huyen_ghn: 1442, ma_phuong_xa_ghn: '20304' },
  { id: 45, ma_nguoi_dung: 8, ma_khuyen_mai: null, tong_tien: 390000, phi_van_chuyen: 30000, trang_thai: 'DA_GIAO', ngay_tao: subDays(today, 28), ghi_chu: null, ma_dia_chi: 5, ho_ten_nguoi_nhan: 'Vo Quoc Dat', sdt_nguoi_nhan: '0945678901', dia_chi_giao_hang: '90 Nguyen Hue, Hoan Kiem, Ha Noi', ma_tinh_ghn: 201, ma_quan_huyen_ghn: 1482, ma_phuong_xa_ghn: '10101' },

  // --- DA_HUY (5) ---
  { id: 46, ma_nguoi_dung: 4, ma_khuyen_mai: null, tong_tien: 175000, phi_van_chuyen: 25000, trang_thai: 'DA_HUY', ngay_tao: subDays(today, 10), ghi_chu: 'Khach huy vi doi y', ma_dia_chi: 1, ho_ten_nguoi_nhan: 'Nguyen Van Khach', sdt_nguoi_nhan: '0901234567', dia_chi_giao_hang: '123 Nguyen Trai, Q1, HCM', ma_tinh_ghn: 202, ma_quan_huyen_ghn: 1442, ma_phuong_xa_ghn: '20304' },
  { id: 47, ma_nguoi_dung: 5, ma_khuyen_mai: null, tong_tien: 290000, phi_van_chuyen: 30000, trang_thai: 'DA_HUY', ngay_tao: subDays(today, 8), ghi_chu: 'Het hang', ma_dia_chi: 2, ho_ten_nguoi_nhan: 'Tran Thi Lan', sdt_nguoi_nhan: '0912345678', dia_chi_giao_hang: '45 Le Loi, Q3, HCM', ma_tinh_ghn: 202, ma_quan_huyen_ghn: 1443, ma_phuong_xa_ghn: '20401' },
  { id: 48, ma_nguoi_dung: 9, ma_khuyen_mai: null, tong_tien: 540000, phi_van_chuyen: 25000, trang_thai: 'DA_HUY', ngay_tao: subDays(today, 12), ghi_chu: 'Khong lien lac duoc', ma_dia_chi: 6, ho_ten_nguoi_nhan: 'Hoang Duc Manh', sdt_nguoi_nhan: '0956789012', dia_chi_giao_hang: '56 Ly Tu Trong, Q1, HCM', ma_tinh_ghn: 202, ma_quan_huyen_ghn: 1442, ma_phuong_xa_ghn: '20305' },
  { id: 49, ma_nguoi_dung: 11, ma_khuyen_mai: null, tong_tien: 125000, phi_van_chuyen: 20000, trang_thai: 'DA_HUY', ngay_tao: subDays(today, 15), ghi_chu: 'Khach yeu cau huy', ma_dia_chi: 8, ho_ten_nguoi_nhan: 'Dang Van Son', sdt_nguoi_nhan: '0978901234', dia_chi_giao_hang: '67 Phan Chau Trinh, Hai Chau, Da Nang', ma_tinh_ghn: 203, ma_quan_huyen_ghn: 1527, ma_phuong_xa_ghn: '30102' },
  { id: 50, ma_nguoi_dung: 13, ma_khuyen_mai: null, tong_tien: 670000, phi_van_chuyen: 30000, trang_thai: 'DA_HUY', ngay_tao: subDays(today, 9), ghi_chu: 'Dia chi khong hop le', ma_dia_chi: 10, ho_ten_nguoi_nhan: 'Ngo Bao Ngoc', sdt_nguoi_nhan: '0990123456', dia_chi_giao_hang: '99 Vo Van Ngan, Thu Duc, HCM', ma_tinh_ghn: 202, ma_quan_huyen_ghn: 3695, ma_phuong_xa_ghn: '20901' },
];

// ═══════════════════════════════════════════════════════════════════
// 4. CHI TIẾT ĐƠN HÀNG (2-4 items per order, ~130 total)
// ═══════════════════════════════════════════════════════════════════

export const chiTietDonHang = [
  // Order 1 (245k) - 2 items
  { id: 1, ma_don_hang: 1, ma_bien_the: 1, so_luong: 3, don_gia: 35000 },
  { id: 2, ma_don_hang: 1, ma_bien_the: 5, so_luong: 2, don_gia: 55000 },
  // Order 2 (480k) - 3 items
  { id: 3, ma_don_hang: 2, ma_bien_the: 9, so_luong: 2, don_gia: 120000 },
  { id: 4, ma_don_hang: 2, ma_bien_the: 3, so_luong: 1, don_gia: 85000 },
  { id: 5, ma_don_hang: 2, ma_bien_the: 12, so_luong: 3, don_gia: 55000 },
  // Order 3 (367k) - 3 items
  { id: 6, ma_don_hang: 3, ma_bien_the: 14, so_luong: 2, don_gia: 89000 },
  { id: 7, ma_don_hang: 3, ma_bien_the: 7, so_luong: 1, don_gia: 65000 },
  { id: 8, ma_don_hang: 3, ma_bien_the: 2, so_luong: 4, don_gia: 28000 },
  // Order 4 (152k) - 2 items
  { id: 9, ma_don_hang: 4, ma_bien_the: 1, so_luong: 2, don_gia: 35000 },
  { id: 10, ma_don_hang: 4, ma_bien_the: 6, so_luong: 1, don_gia: 72000 },
  // Order 5 (890k) - 4 items
  { id: 11, ma_don_hang: 5, ma_bien_the: 10, so_luong: 3, don_gia: 150000 },
  { id: 12, ma_don_hang: 5, ma_bien_the: 13, so_luong: 2, don_gia: 95000 },
  { id: 13, ma_don_hang: 5, ma_bien_the: 4, so_luong: 1, don_gia: 110000 },
  { id: 14, ma_don_hang: 5, ma_bien_the: 8, so_luong: 2, don_gia: 45000 },
  // Order 6 (520k) - 3 items
  { id: 15, ma_don_hang: 6, ma_bien_the: 11, so_luong: 2, don_gia: 130000 },
  { id: 16, ma_don_hang: 6, ma_bien_the: 5, so_luong: 3, don_gia: 55000 },
  { id: 17, ma_don_hang: 6, ma_bien_the: 15, so_luong: 1, don_gia: 75000 },
  // Order 7 (310k) - 2 items
  { id: 18, ma_don_hang: 7, ma_bien_the: 2, so_luong: 5, don_gia: 28000 },
  { id: 19, ma_don_hang: 7, ma_bien_the: 9, so_luong: 1, don_gia: 120000 },
  // Order 8 (675k) - 3 items
  { id: 20, ma_don_hang: 8, ma_bien_the: 14, so_luong: 3, don_gia: 89000 },
  { id: 21, ma_don_hang: 8, ma_bien_the: 10, so_luong: 2, don_gia: 150000 },
  { id: 22, ma_don_hang: 8, ma_bien_the: 1, so_luong: 2, don_gia: 35000 },
  // Order 9 (198k) - 2 items
  { id: 23, ma_don_hang: 9, ma_bien_the: 3, so_luong: 1, don_gia: 85000 },
  { id: 24, ma_don_hang: 9, ma_bien_the: 7, so_luong: 1, don_gia: 65000 },
  // Order 10 (445k) - 3 items
  { id: 25, ma_don_hang: 10, ma_bien_the: 12, so_luong: 3, don_gia: 55000 },
  { id: 26, ma_don_hang: 10, ma_bien_the: 6, so_luong: 2, don_gia: 72000 },
  { id: 27, ma_don_hang: 10, ma_bien_the: 8, so_luong: 3, don_gia: 45000 },
  // Order 11 (720k) - 3 items
  { id: 28, ma_don_hang: 11, ma_bien_the: 10, so_luong: 3, don_gia: 150000 },
  { id: 29, ma_don_hang: 11, ma_bien_the: 4, so_luong: 1, don_gia: 110000 },
  { id: 30, ma_don_hang: 11, ma_bien_the: 2, so_luong: 3, don_gia: 28000 },
  // Order 12 (256k) - 2 items
  { id: 31, ma_don_hang: 12, ma_bien_the: 1, so_luong: 4, don_gia: 35000 },
  { id: 32, ma_don_hang: 12, ma_bien_the: 5, so_luong: 2, don_gia: 55000 },
  // Order 13 (1150k) - 4 items
  { id: 33, ma_don_hang: 13, ma_bien_the: 14, so_luong: 5, don_gia: 89000 },
  { id: 34, ma_don_hang: 13, ma_bien_the: 13, so_luong: 3, don_gia: 95000 },
  { id: 35, ma_don_hang: 13, ma_bien_the: 11, so_luong: 2, don_gia: 130000 },
  { id: 36, ma_don_hang: 13, ma_bien_the: 8, so_luong: 2, don_gia: 45000 },
  // Order 14 (395k) - 2 items
  { id: 37, ma_don_hang: 14, ma_bien_the: 9, so_luong: 2, don_gia: 120000 },
  { id: 38, ma_don_hang: 14, ma_bien_the: 12, so_luong: 3, don_gia: 55000 },
  // Order 15 (580k) - 3 items
  { id: 39, ma_don_hang: 15, ma_bien_the: 10, so_luong: 2, don_gia: 150000 },
  { id: 40, ma_don_hang: 15, ma_bien_the: 3, so_luong: 2, don_gia: 85000 },
  { id: 41, ma_don_hang: 15, ma_bien_the: 6, so_luong: 1, don_gia: 72000 },
  // Order 16-25 (DANG_GIAO) - 2-3 items each
  { id: 42, ma_don_hang: 16, ma_bien_the: 5, so_luong: 4, don_gia: 55000 },
  { id: 43, ma_don_hang: 16, ma_bien_the: 1, so_luong: 2, don_gia: 35000 },
  { id: 44, ma_don_hang: 17, ma_bien_the: 14, so_luong: 4, don_gia: 89000 },
  { id: 45, ma_don_hang: 17, ma_bien_the: 7, so_luong: 3, don_gia: 65000 },
  { id: 46, ma_don_hang: 18, ma_bien_the: 2, so_luong: 3, don_gia: 28000 },
  { id: 47, ma_don_hang: 18, ma_bien_the: 8, so_luong: 2, don_gia: 45000 },
  { id: 48, ma_don_hang: 19, ma_bien_the: 10, so_luong: 4, don_gia: 150000 },
  { id: 49, ma_don_hang: 19, ma_bien_the: 13, so_luong: 2, don_gia: 95000 },
  { id: 50, ma_don_hang: 20, ma_bien_the: 3, so_luong: 2, don_gia: 85000 },
  { id: 51, ma_don_hang: 20, ma_bien_the: 12, so_luong: 2, don_gia: 55000 },
  { id: 52, ma_don_hang: 21, ma_bien_the: 11, so_luong: 2, don_gia: 130000 },
  { id: 53, ma_don_hang: 21, ma_bien_the: 6, so_luong: 2, don_gia: 72000 },
  { id: 54, ma_don_hang: 22, ma_bien_the: 9, so_luong: 3, don_gia: 120000 },
  { id: 55, ma_don_hang: 22, ma_bien_the: 4, so_luong: 1, don_gia: 110000 },
  { id: 56, ma_don_hang: 22, ma_bien_the: 1, so_luong: 2, don_gia: 35000 },
  { id: 57, ma_don_hang: 23, ma_bien_the: 14, so_luong: 5, don_gia: 89000 },
  { id: 58, ma_don_hang: 23, ma_bien_the: 15, so_luong: 4, don_gia: 75000 },
  { id: 59, ma_don_hang: 24, ma_bien_the: 2, so_luong: 4, don_gia: 28000 },
  { id: 60, ma_don_hang: 24, ma_bien_the: 5, so_luong: 1, don_gia: 55000 },
  { id: 61, ma_don_hang: 25, ma_bien_the: 10, so_luong: 5, don_gia: 150000 },
  { id: 62, ma_don_hang: 25, ma_bien_the: 13, so_luong: 3, don_gia: 95000 },
  { id: 63, ma_don_hang: 25, ma_bien_the: 4, so_luong: 2, don_gia: 110000 },
  // Order 26-45 (DA_GIAO) - 2-3 items each
  { id: 64, ma_don_hang: 26, ma_bien_the: 1, so_luong: 5, don_gia: 35000 },
  { id: 65, ma_don_hang: 26, ma_bien_the: 7, so_luong: 2, don_gia: 65000 },
  { id: 66, ma_don_hang: 27, ma_bien_the: 9, so_luong: 2, don_gia: 120000 },
  { id: 67, ma_don_hang: 27, ma_bien_the: 12, so_luong: 3, don_gia: 55000 },
  { id: 68, ma_don_hang: 28, ma_bien_the: 3, so_luong: 2, don_gia: 85000 },
  { id: 69, ma_don_hang: 28, ma_bien_the: 6, so_luong: 1, don_gia: 72000 },
  { id: 70, ma_don_hang: 29, ma_bien_the: 2, so_luong: 3, don_gia: 28000 },
  { id: 71, ma_don_hang: 29, ma_bien_the: 8, so_luong: 2, don_gia: 45000 },
  { id: 72, ma_don_hang: 30, ma_bien_the: 10, so_luong: 3, don_gia: 150000 },
  { id: 73, ma_don_hang: 30, ma_bien_the: 14, so_luong: 2, don_gia: 89000 },
  { id: 74, ma_don_hang: 30, ma_bien_the: 5, so_luong: 2, don_gia: 55000 },
  { id: 75, ma_don_hang: 31, ma_bien_the: 11, so_luong: 2, don_gia: 130000 },
  { id: 76, ma_don_hang: 31, ma_bien_the: 4, so_luong: 1, don_gia: 110000 },
  { id: 77, ma_don_hang: 32, ma_bien_the: 13, so_luong: 3, don_gia: 95000 },
  { id: 78, ma_don_hang: 32, ma_bien_the: 9, so_luong: 2, don_gia: 120000 },
  { id: 79, ma_don_hang: 32, ma_bien_the: 1, so_luong: 3, don_gia: 35000 },
  { id: 80, ma_don_hang: 33, ma_bien_the: 5, so_luong: 3, don_gia: 55000 },
  { id: 81, ma_don_hang: 33, ma_bien_the: 2, so_luong: 2, don_gia: 28000 },
  { id: 82, ma_don_hang: 34, ma_bien_the: 14, so_luong: 5, don_gia: 89000 },
  { id: 83, ma_don_hang: 34, ma_bien_the: 10, so_luong: 2, don_gia: 150000 },
  { id: 84, ma_don_hang: 34, ma_bien_the: 7, so_luong: 1, don_gia: 65000 },
  { id: 85, ma_don_hang: 35, ma_bien_the: 12, so_luong: 4, don_gia: 55000 },
  { id: 86, ma_don_hang: 35, ma_bien_the: 6, so_luong: 1, don_gia: 72000 },
  { id: 87, ma_don_hang: 36, ma_bien_the: 10, so_luong: 5, don_gia: 150000 },
  { id: 88, ma_don_hang: 36, ma_bien_the: 14, so_luong: 3, don_gia: 89000 },
  { id: 89, ma_don_hang: 36, ma_bien_the: 11, so_luong: 1, don_gia: 130000 },
  { id: 90, ma_don_hang: 37, ma_bien_the: 2, so_luong: 4, don_gia: 28000 },
  { id: 91, ma_don_hang: 37, ma_bien_the: 8, so_luong: 1, don_gia: 45000 },
  { id: 92, ma_don_hang: 38, ma_bien_the: 13, so_luong: 3, don_gia: 95000 },
  { id: 93, ma_don_hang: 38, ma_bien_the: 9, so_luong: 2, don_gia: 120000 },
  { id: 94, ma_don_hang: 39, ma_bien_the: 5, so_luong: 5, don_gia: 55000 },
  { id: 95, ma_don_hang: 39, ma_bien_the: 3, so_luong: 1, don_gia: 85000 },
  { id: 96, ma_don_hang: 39, ma_bien_the: 1, so_luong: 2, don_gia: 35000 },
  { id: 97, ma_don_hang: 40, ma_bien_the: 10, so_luong: 3, don_gia: 150000 },
  { id: 98, ma_don_hang: 40, ma_bien_the: 6, so_luong: 2, don_gia: 72000 },
  { id: 99, ma_don_hang: 40, ma_bien_the: 15, so_luong: 1, don_gia: 75000 },
  { id: 100, ma_don_hang: 41, ma_bien_the: 4, so_luong: 2, don_gia: 110000 },
  { id: 101, ma_don_hang: 41, ma_bien_the: 2, so_luong: 3, don_gia: 28000 },
  { id: 102, ma_don_hang: 42, ma_bien_the: 11, so_luong: 2, don_gia: 130000 },
  { id: 103, ma_don_hang: 42, ma_bien_the: 12, so_luong: 3, don_gia: 55000 },
  { id: 104, ma_don_hang: 42, ma_bien_the: 8, so_luong: 1, don_gia: 45000 },
  { id: 105, ma_don_hang: 43, ma_bien_the: 1, so_luong: 3, don_gia: 35000 },
  { id: 106, ma_don_hang: 43, ma_bien_the: 7, so_luong: 1, don_gia: 65000 },
  { id: 107, ma_don_hang: 44, ma_bien_the: 14, so_luong: 3, don_gia: 89000 },
  { id: 108, ma_don_hang: 44, ma_bien_the: 9, so_luong: 2, don_gia: 120000 },
  { id: 109, ma_don_hang: 45, ma_bien_the: 5, so_luong: 4, don_gia: 55000 },
  { id: 110, ma_don_hang: 45, ma_bien_the: 3, so_luong: 1, don_gia: 85000 },
  { id: 111, ma_don_hang: 45, ma_bien_the: 12, so_luong: 1, don_gia: 55000 },
  // Order 46-50 (DA_HUY) - 2 items each
  { id: 112, ma_don_hang: 46, ma_bien_the: 1, so_luong: 3, don_gia: 35000 },
  { id: 113, ma_don_hang: 46, ma_bien_the: 8, so_luong: 1, don_gia: 45000 },
  { id: 114, ma_don_hang: 47, ma_bien_the: 9, so_luong: 1, don_gia: 120000 },
  { id: 115, ma_don_hang: 47, ma_bien_the: 12, so_luong: 3, don_gia: 55000 },
  { id: 116, ma_don_hang: 48, ma_bien_the: 14, so_luong: 3, don_gia: 89000 },
  { id: 117, ma_don_hang: 48, ma_bien_the: 10, so_luong: 2, don_gia: 150000 },
  { id: 118, ma_don_hang: 49, ma_bien_the: 2, so_luong: 2, don_gia: 28000 },
  { id: 119, ma_don_hang: 49, ma_bien_the: 5, so_luong: 1, don_gia: 55000 },
  { id: 120, ma_don_hang: 50, ma_bien_the: 13, so_luong: 4, don_gia: 95000 },
  { id: 121, ma_don_hang: 50, ma_bien_the: 11, so_luong: 2, don_gia: 130000 },
];

// ═══════════════════════════════════════════════════════════════════
// 5. LỊCH SỬ ĐƠN HÀNG (status transitions)
// ═══════════════════════════════════════════════════════════════════

function buildOrderHistory(orderId: number, status: string, createdAt: Date): Array<{ ma_don_hang: number; trang_thai: string; thoi_gian_doi: Date }> {
  const steps: string[] = [];
  const flow = ['CHO_XAC_NHAN', 'DA_XAC_NHAN', 'DANG_DONG_GOI', 'DANG_GIAO', 'DA_GIAO'];

  if (status === 'DA_HUY') {
    steps.push('CHO_XAC_NHAN', 'DA_HUY');
  } else {
    const idx = flow.indexOf(status);
    for (let i = 0; i <= idx; i++) steps.push(flow[i]);
  }

  return steps.map((s, i) => ({
    ma_don_hang: orderId,
    trang_thai: s,
    thoi_gian_doi: addDays(createdAt, i * 1),
  }));
}

export const lichSuDonHang: Array<{ ma_don_hang: number; trang_thai: string; thoi_gian_doi: Date }> = donHang.flatMap(dh =>
  buildOrderHistory(dh.id, dh.trang_thai, dh.ngay_tao)
);

// ═══════════════════════════════════════════════════════════════════
// 6. GIAO DỊCH THANH TOÁN (1 per order = 50)
// ═══════════════════════════════════════════════════════════════════

export const giaoDichThanhToan = donHang.map((dh, idx) => {
  let trangThai = 'CHO_THANH_TOAN';
  let phuongThuc = 'COD';
  let maPhuongThuc = 1;
  let maGiaoDichBenNgoai: string | null = null;

  if (dh.trang_thai === 'DA_GIAO') {
    trangThai = 'THANH_CONG';
  } else if (dh.trang_thai === 'DA_HUY') {
    trangThai = 'THAT_BAI';
  } else if (dh.trang_thai === 'DANG_GIAO' || dh.trang_thai === 'DANG_DONG_GOI') {
    trangThai = 'THANH_CONG';
  }

  // Rotate payment methods
  const methods = ['COD', 'VNPAY', 'MOMO', 'BANK_TRANSFER'];
  const methodIdx = idx % 4;
  phuongThuc = methods[methodIdx];
  maPhuongThuc = methodIdx + 1;

  if (phuongThuc !== 'COD' && trangThai === 'THANH_CONG') {
    maGiaoDichBenNgoai = `TXN${String(dh.id).padStart(8, '0')}${Date.now().toString().slice(-6)}`;
  }

  return {
    id: idx + 1,
    ma_don_hang: dh.id,
    ma_phuong_thuc: maPhuongThuc,
    so_tien: dh.tong_tien + dh.phi_van_chuyen,
    trang_thai: trangThai,
    ma_giao_dich_ben_ngoai: maGiaoDichBenNgoai,
    ngay_tao: dh.ngay_tao,
    phuong_thuc_thanh_toan: phuongThuc,
  };
});

// ═══════════════════════════════════════════════════════════════════
// 7. ĐỐI TÁC VẬN CHUYỂN (3)
// ═══════════════════════════════════════════════════════════════════

export const doiTacVanChuyen = [
  { id: 1, ten_doi_tac: 'Giao Hang Nhanh (GHN)', so_dien_thoai: '1900636677' },
  { id: 2, ten_doi_tac: 'Giao Hang Tiet Kiem (GHTK)', so_dien_thoai: '1900545436' },
  { id: 3, ten_doi_tac: 'Viettel Post', so_dien_thoai: '1900886688' },
];

// ═══════════════════════════════════════════════════════════════════
// 8. ĐƠN VẬN CHUYỂN (for DANG_GIAO + DA_GIAO orders = 30)
// ═══════════════════════════════════════════════════════════════════

const shippingOrders = donHang.filter(dh => dh.trang_thai === 'DANG_GIAO' || dh.trang_thai === 'DA_GIAO');

export const donVanChuyen = shippingOrders.map((dh, idx) => {
  const partnerId = (idx % 3) + 1;
  const trangThai = dh.trang_thai === 'DA_GIAO' ? 'DA_GIAO' : 'DANG_VAN_CHUYEN';
  const maVanDon = `VD${String(dh.id).padStart(6, '0')}${partnerId}`;

  return {
    id: idx + 1,
    ma_don_hang: dh.id,
    ma_doi_tac: partnerId,
    ma_van_don: maVanDon,
    trang_thai: trangThai,
    ngay_giao_du_kien: addDays(dh.ngay_tao, 3),
  };
});

// ═══════════════════════════════════════════════════════════════════
// 9. KHO HÀNG (3)
// ═══════════════════════════════════════════════════════════════════

export const khoHang = [
  { id: 1, ten_kho: 'Tong Kho HCM', dia_chi: 'KCN Tan Binh, Quan Tan Phu, TP Ho Chi Minh' },
  { id: 2, ten_kho: 'Kho Da Nang', dia_chi: 'Hoa Khanh, Lien Chieu, Da Nang' },
  { id: 3, ten_kho: 'Kho Ha Noi', dia_chi: 'KCN Bac Thang Long, Dong Anh, Ha Noi' },
];

// ═══════════════════════════════════════════════════════════════════
// 10. VỊ TRÍ KHO (20)
// ═══════════════════════════════════════════════════════════════════

export const viTriKho = [
  // Kho HCM (id=1) - 8 vi tri
  { id: 1, ma_kho: 1, khu_vuc: 'Khu A', day: 'D1', ke: 'K1', tang: 'T1', suc_chua_toi_da: 200, ghi_chu: 'Rau cu tuoi' },
  { id: 2, ma_kho: 1, khu_vuc: 'Khu A', day: 'D1', ke: 'K2', tang: 'T1', suc_chua_toi_da: 200, ghi_chu: 'Rau cu tuoi' },
  { id: 3, ma_kho: 1, khu_vuc: 'Khu A', day: 'D2', ke: 'K1', tang: 'T1', suc_chua_toi_da: 200, ghi_chu: null },
  { id: 4, ma_kho: 1, khu_vuc: 'Khu B', day: 'D1', ke: 'K1', tang: 'T1', suc_chua_toi_da: 300, ghi_chu: 'Trai cay' },
  { id: 5, ma_kho: 1, khu_vuc: 'Khu B', day: 'D1', ke: 'K2', tang: 'T1', suc_chua_toi_da: 300, ghi_chu: 'Trai cay' },
  { id: 6, ma_kho: 1, khu_vuc: 'Khu C', day: 'D1', ke: 'K1', tang: 'T1', suc_chua_toi_da: 500, ghi_chu: 'Gao, hat, kho' },
  { id: 7, ma_kho: 1, khu_vuc: 'Khu C', day: 'D1', ke: 'K2', tang: 'T1', suc_chua_toi_da: 500, ghi_chu: 'Gao, hat, kho' },
  { id: 8, ma_kho: 1, khu_vuc: 'Khu Lanh', day: 'D1', ke: 'K1', tang: 'T1', suc_chua_toi_da: 100, ghi_chu: 'Nhiet do 2-8 do C' },
  // Kho Da Nang (id=2) - 7 vi tri
  { id: 9, ma_kho: 2, khu_vuc: 'Khu A', day: 'D1', ke: 'K1', tang: 'T1', suc_chua_toi_da: 200, ghi_chu: null },
  { id: 10, ma_kho: 2, khu_vuc: 'Khu A', day: 'D1', ke: 'K2', tang: 'T1', suc_chua_toi_da: 200, ghi_chu: null },
  { id: 11, ma_kho: 2, khu_vuc: 'Khu B', day: 'D1', ke: 'K1', tang: 'T1', suc_chua_toi_da: 300, ghi_chu: 'Trai cay + rau' },
  { id: 12, ma_kho: 2, khu_vuc: 'Khu B', day: 'D1', ke: 'K2', tang: 'T1', suc_chua_toi_da: 300, ghi_chu: null },
  { id: 13, ma_kho: 2, khu_vuc: 'Khu C', day: 'D1', ke: 'K1', tang: 'T1', suc_chua_toi_da: 400, ghi_chu: 'Kho' },
  { id: 14, ma_kho: 2, khu_vuc: 'Khu Lanh', day: 'D1', ke: 'K1', tang: 'T1', suc_chua_toi_da: 100, ghi_chu: 'Nhiet do 2-8 do C' },
  { id: 15, ma_kho: 2, khu_vuc: 'Khu Lanh', day: 'D1', ke: 'K2', tang: 'T1', suc_chua_toi_da: 100, ghi_chu: 'Nhiet do 0-4 do C' },
  // Kho Ha Noi (id=3) - 5 vi tri
  { id: 16, ma_kho: 3, khu_vuc: 'Khu A', day: 'D1', ke: 'K1', tang: 'T1', suc_chua_toi_da: 250, ghi_chu: null },
  { id: 17, ma_kho: 3, khu_vuc: 'Khu A', day: 'D1', ke: 'K2', tang: 'T1', suc_chua_toi_da: 250, ghi_chu: null },
  { id: 18, ma_kho: 3, khu_vuc: 'Khu B', day: 'D1', ke: 'K1', tang: 'T1', suc_chua_toi_da: 300, ghi_chu: 'Trai cay mien Bac' },
  { id: 19, ma_kho: 3, khu_vuc: 'Khu C', day: 'D1', ke: 'K1', tang: 'T1', suc_chua_toi_da: 400, ghi_chu: 'Gao, ngu coc' },
  { id: 20, ma_kho: 3, khu_vuc: 'Khu Lanh', day: 'D1', ke: 'K1', tang: 'T1', suc_chua_toi_da: 80, ghi_chu: 'Nhiet do 2-8 do C' },
];

// ═══════════════════════════════════════════════════════════════════
// 11. LÔ HÀNG (20)
// ═══════════════════════════════════════════════════════════════════

export const loHang = [
  { id: 1, ma_bien_the: 1, ma_ncc: 1, ma_lo_hang: 'LO-RMUONG-001', ngay_thu_hoach: subDays(today, 2), han_su_dung: addDays(today, 7), ngay_nhap_kho: subDays(today, 1), trang_thai: 'BINH_THUONG' },
  { id: 2, ma_bien_the: 2, ma_ncc: 1, ma_lo_hang: 'LO-RMUONG-002', ngay_thu_hoach: subDays(today, 3), han_su_dung: addDays(today, 5), ngay_nhap_kho: subDays(today, 2), trang_thai: 'BINH_THUONG' },
  { id: 3, ma_bien_the: 3, ma_ncc: 1, ma_lo_hang: 'LO-KALE-001', ngay_thu_hoach: subDays(today, 1), han_su_dung: addDays(today, 6), ngay_nhap_kho: subDays(today, 1), trang_thai: 'BINH_THUONG' },
  { id: 4, ma_bien_the: 5, ma_ncc: 1, ma_lo_hang: 'LO-CACHUA-001', ngay_thu_hoach: subDays(today, 2), han_su_dung: addDays(today, 10), ngay_nhap_kho: subDays(today, 1), trang_thai: 'BINH_THUONG' },
  { id: 5, ma_bien_the: 7, ma_ncc: 2, ma_lo_hang: 'LO-BROC-001', ngay_thu_hoach: subDays(today, 2), han_su_dung: addDays(today, 8), ngay_nhap_kho: subDays(today, 1), trang_thai: 'BINH_THUONG' },
  { id: 6, ma_bien_the: 9, ma_ncc: 1, ma_lo_hang: 'LO-DAUTAY-001', ngay_thu_hoach: subDays(today, 1), han_su_dung: addDays(today, 5), ngay_nhap_kho: subDays(today, 0), trang_thai: 'BINH_THUONG' },
  { id: 7, ma_bien_the: 10, ma_ncc: 1, ma_lo_hang: 'LO-DAUTAY-002', ngay_thu_hoach: subDays(today, 4), han_su_dung: addDays(today, 2), ngay_nhap_kho: subDays(today, 3), trang_thai: 'GAN_HET_HAN' },
  { id: 8, ma_bien_the: 12, ma_ncc: 4, ma_lo_hang: 'LO-XOAI-001', ngay_thu_hoach: subDays(today, 3), han_su_dung: addDays(today, 14), ngay_nhap_kho: subDays(today, 2), trang_thai: 'BINH_THUONG' },
  { id: 9, ma_bien_the: 13, ma_ncc: 4, ma_lo_hang: 'LO-XOAI-002', ngay_thu_hoach: subDays(today, 5), han_su_dung: addDays(today, 10), ngay_nhap_kho: subDays(today, 4), trang_thai: 'BINH_THUONG' },
  { id: 10, ma_bien_the: 14, ma_ncc: 2, ma_lo_hang: 'LO-BO-001', ngay_thu_hoach: subDays(today, 4), han_su_dung: addDays(today, 12), ngay_nhap_kho: subDays(today, 3), trang_thai: 'BINH_THUONG' },
  { id: 11, ma_bien_the: 15, ma_ncc: 2, ma_lo_hang: 'LO-BO-002', ngay_thu_hoach: subDays(today, 6), han_su_dung: addDays(today, 8), ngay_nhap_kho: subDays(today, 5), trang_thai: 'BINH_THUONG' },
  { id: 12, ma_bien_the: 4, ma_ncc: 3, ma_lo_hang: 'LO-ST25-001', ngay_thu_hoach: subDays(today, 30), han_su_dung: addDays(today, 365), ngay_nhap_kho: subDays(today, 15), trang_thai: 'BINH_THUONG' },
  { id: 13, ma_bien_the: 6, ma_ncc: 3, ma_lo_hang: 'LO-GAOLUT-001', ngay_thu_hoach: subDays(today, 25), han_su_dung: addDays(today, 365), ngay_nhap_kho: subDays(today, 12), trang_thai: 'BINH_THUONG' },
  { id: 14, ma_bien_the: 8, ma_ncc: 5, ma_lo_hang: 'LO-MATONG-001', ngay_thu_hoach: subDays(today, 90), han_su_dung: addDays(today, 720), ngay_nhap_kho: subDays(today, 60), trang_thai: 'BINH_THUONG' },
  { id: 15, ma_bien_the: 11, ma_ncc: 5, ma_lo_hang: 'LO-TIEU-001', ngay_thu_hoach: subDays(today, 45), han_su_dung: addDays(today, 365), ngay_nhap_kho: subDays(today, 30), trang_thai: 'BINH_THUONG' },
  { id: 16, ma_bien_the: 1, ma_ncc: 1, ma_lo_hang: 'LO-RMUONG-003', ngay_thu_hoach: subDays(today, 8), han_su_dung: subDays(today, 1), ngay_nhap_kho: subDays(today, 7), trang_thai: 'DA_HET_HAN' },
  { id: 17, ma_bien_the: 3, ma_ncc: 1, ma_lo_hang: 'LO-KALE-002', ngay_thu_hoach: subDays(today, 7), han_su_dung: addDays(today, 1), ngay_nhap_kho: subDays(today, 6), trang_thai: 'GAN_HET_HAN' },
  { id: 18, ma_bien_the: 5, ma_ncc: 1, ma_lo_hang: 'LO-CACHUA-002', ngay_thu_hoach: subDays(today, 10), han_su_dung: subDays(today, 3), ngay_nhap_kho: subDays(today, 9), trang_thai: 'DA_HET_HAN' },
  { id: 19, ma_bien_the: 9, ma_ncc: 1, ma_lo_hang: 'LO-DAUTAY-003', ngay_thu_hoach: subDays(today, 6), han_su_dung: addDays(today, 1), ngay_nhap_kho: subDays(today, 5), trang_thai: 'GAN_HET_HAN' },
  { id: 20, ma_bien_the: 14, ma_ncc: 2, ma_lo_hang: 'LO-BO-003', ngay_thu_hoach: subDays(today, 15), han_su_dung: subDays(today, 2), ngay_nhap_kho: subDays(today, 14), trang_thai: 'DA_HET_HAN' },
];

// ═══════════════════════════════════════════════════════════════════
// 12. KIỆN HÀNG CHI TIẾT (40)
// ═══════════════════════════════════════════════════════════════════

export const kienHangChiTiet = [
  // Lo 1 - Rau muong tuoi
  { id: 1, ma_lo_hang: 1, ma_vi_tri: 1, ma_vach_quet: 'QR-LO-RMUONG-001-001', trang_thai: 'TRONG_KHO' },
  { id: 2, ma_lo_hang: 1, ma_vi_tri: 1, ma_vach_quet: 'QR-LO-RMUONG-001-002', trang_thai: 'TRONG_KHO' },
  { id: 3, ma_lo_hang: 1, ma_vi_tri: 1, ma_vach_quet: 'QR-LO-RMUONG-001-003', trang_thai: 'DA_XUAT' },
  // Lo 2
  { id: 4, ma_lo_hang: 2, ma_vi_tri: 2, ma_vach_quet: 'QR-LO-RMUONG-002-001', trang_thai: 'TRONG_KHO' },
  { id: 5, ma_lo_hang: 2, ma_vi_tri: 2, ma_vach_quet: 'QR-LO-RMUONG-002-002', trang_thai: 'TRONG_KHO' },
  // Lo 3 - Kale
  { id: 6, ma_lo_hang: 3, ma_vi_tri: 8, ma_vach_quet: 'QR-LO-KALE-001-001', trang_thai: 'TRONG_KHO' },
  { id: 7, ma_lo_hang: 3, ma_vi_tri: 8, ma_vach_quet: 'QR-LO-KALE-001-002', trang_thai: 'TRONG_KHO' },
  // Lo 4 - Ca chua
  { id: 8, ma_lo_hang: 4, ma_vi_tri: 1, ma_vach_quet: 'QR-LO-CACHUA-001-001', trang_thai: 'TRONG_KHO' },
  { id: 9, ma_lo_hang: 4, ma_vi_tri: 1, ma_vach_quet: 'QR-LO-CACHUA-001-002', trang_thai: 'DA_XUAT' },
  // Lo 5 - Broccoli
  { id: 10, ma_lo_hang: 5, ma_vi_tri: 8, ma_vach_quet: 'QR-LO-BROC-001-001', trang_thai: 'TRONG_KHO' },
  { id: 11, ma_lo_hang: 5, ma_vi_tri: 8, ma_vach_quet: 'QR-LO-BROC-001-002', trang_thai: 'TRONG_KHO' },
  // Lo 6 - Dau tay
  { id: 12, ma_lo_hang: 6, ma_vi_tri: 8, ma_vach_quet: 'QR-LO-DAUTAY-001-001', trang_thai: 'TRONG_KHO' },
  { id: 13, ma_lo_hang: 6, ma_vi_tri: 8, ma_vach_quet: 'QR-LO-DAUTAY-001-002', trang_thai: 'DANG_VAN_CHUYEN' },
  // Lo 7 - Dau tay gan het han
  { id: 14, ma_lo_hang: 7, ma_vi_tri: 8, ma_vach_quet: 'QR-LO-DAUTAY-002-001', trang_thai: 'TRONG_KHO' },
  // Lo 8 - Xoai
  { id: 15, ma_lo_hang: 8, ma_vi_tri: 4, ma_vach_quet: 'QR-LO-XOAI-001-001', trang_thai: 'TRONG_KHO' },
  { id: 16, ma_lo_hang: 8, ma_vi_tri: 4, ma_vach_quet: 'QR-LO-XOAI-001-002', trang_thai: 'TRONG_KHO' },
  { id: 17, ma_lo_hang: 8, ma_vi_tri: 5, ma_vach_quet: 'QR-LO-XOAI-001-003', trang_thai: 'DA_XUAT' },
  // Lo 9
  { id: 18, ma_lo_hang: 9, ma_vi_tri: 4, ma_vach_quet: 'QR-LO-XOAI-002-001', trang_thai: 'TRONG_KHO' },
  { id: 19, ma_lo_hang: 9, ma_vi_tri: 5, ma_vach_quet: 'QR-LO-XOAI-002-002', trang_thai: 'DANG_VAN_CHUYEN' },
  // Lo 10 - Bo
  { id: 20, ma_lo_hang: 10, ma_vi_tri: 4, ma_vach_quet: 'QR-LO-BO-001-001', trang_thai: 'TRONG_KHO' },
  { id: 21, ma_lo_hang: 10, ma_vi_tri: 5, ma_vach_quet: 'QR-LO-BO-001-002', trang_thai: 'TRONG_KHO' },
  { id: 22, ma_lo_hang: 10, ma_vi_tri: 5, ma_vach_quet: 'QR-LO-BO-001-003', trang_thai: 'DA_XUAT' },
  // Lo 11
  { id: 23, ma_lo_hang: 11, ma_vi_tri: 5, ma_vach_quet: 'QR-LO-BO-002-001', trang_thai: 'TRONG_KHO' },
  { id: 24, ma_lo_hang: 11, ma_vi_tri: 5, ma_vach_quet: 'QR-LO-BO-002-002', trang_thai: 'TRONG_KHO' },
  // Lo 12 - Gao ST25
  { id: 25, ma_lo_hang: 12, ma_vi_tri: 6, ma_vach_quet: 'QR-LO-ST25-001-001', trang_thai: 'TRONG_KHO' },
  { id: 26, ma_lo_hang: 12, ma_vi_tri: 6, ma_vach_quet: 'QR-LO-ST25-001-002', trang_thai: 'TRONG_KHO' },
  { id: 27, ma_lo_hang: 12, ma_vi_tri: 7, ma_vach_quet: 'QR-LO-ST25-001-003', trang_thai: 'TRONG_KHO' },
  // Lo 13 - Gao lut
  { id: 28, ma_lo_hang: 13, ma_vi_tri: 7, ma_vach_quet: 'QR-LO-GAOLUT-001-001', trang_thai: 'TRONG_KHO' },
  { id: 29, ma_lo_hang: 13, ma_vi_tri: 7, ma_vach_quet: 'QR-LO-GAOLUT-001-002', trang_thai: 'TRONG_KHO' },
  // Lo 14 - Mat ong
  { id: 30, ma_lo_hang: 14, ma_vi_tri: 3, ma_vach_quet: 'QR-LO-MATONG-001-001', trang_thai: 'TRONG_KHO' },
  { id: 31, ma_lo_hang: 14, ma_vi_tri: 3, ma_vach_quet: 'QR-LO-MATONG-001-002', trang_thai: 'TRONG_KHO' },
  // Lo 15 - Tieu
  { id: 32, ma_lo_hang: 15, ma_vi_tri: 3, ma_vach_quet: 'QR-LO-TIEU-001-001', trang_thai: 'TRONG_KHO' },
  { id: 33, ma_lo_hang: 15, ma_vi_tri: 3, ma_vach_quet: 'QR-LO-TIEU-001-002', trang_thai: 'DA_XUAT' },
  // Lo 16 - Rau muong het han
  { id: 34, ma_lo_hang: 16, ma_vi_tri: 1, ma_vach_quet: 'QR-LO-RMUONG-003-001', trang_thai: 'TRONG_KHO' },
  // Lo 17 - Kale gan het han
  { id: 35, ma_lo_hang: 17, ma_vi_tri: 8, ma_vach_quet: 'QR-LO-KALE-002-001', trang_thai: 'TRONG_KHO' },
  // Lo 18 - Ca chua het han
  { id: 36, ma_lo_hang: 18, ma_vi_tri: 1, ma_vach_quet: 'QR-LO-CACHUA-002-001', trang_thai: 'TRONG_KHO' },
  // Lo 19 - Dau tay gan het han
  { id: 37, ma_lo_hang: 19, ma_vi_tri: 8, ma_vach_quet: 'QR-LO-DAUTAY-003-001', trang_thai: 'TRONG_KHO' },
  // Lo 20 - Bo het han
  { id: 38, ma_lo_hang: 20, ma_vi_tri: 5, ma_vach_quet: 'QR-LO-BO-003-001', trang_thai: 'TRONG_KHO' },
  { id: 39, ma_lo_hang: 20, ma_vi_tri: 5, ma_vach_quet: 'QR-LO-BO-003-002', trang_thai: 'TRONG_KHO' },
  // Extra kien at Kho Da Nang
  { id: 40, ma_lo_hang: 12, ma_vi_tri: 13, ma_vach_quet: 'QR-LO-ST25-DN-001', trang_thai: 'TRONG_KHO' },
];

// ═══════════════════════════════════════════════════════════════════
// 13. TỒN KHO TỔNG (records matching lo_hang + vi_tri)
// ═══════════════════════════════════════════════════════════════════

export const tonKhoTong = [
  { id: 1, ma_lo_hang: 1, ma_vi_tri: 1, so_luong: 120 },
  { id: 2, ma_lo_hang: 2, ma_vi_tri: 2, so_luong: 100 },
  { id: 3, ma_lo_hang: 3, ma_vi_tri: 8, so_luong: 80 },
  { id: 4, ma_lo_hang: 4, ma_vi_tri: 1, so_luong: 95 },
  { id: 5, ma_lo_hang: 5, ma_vi_tri: 8, so_luong: 70 },
  { id: 6, ma_lo_hang: 6, ma_vi_tri: 8, so_luong: 55 },
  { id: 7, ma_lo_hang: 7, ma_vi_tri: 8, so_luong: 20 },
  { id: 8, ma_lo_hang: 8, ma_vi_tri: 4, so_luong: 85 },
  { id: 9, ma_lo_hang: 8, ma_vi_tri: 5, so_luong: 40 },
  { id: 10, ma_lo_hang: 9, ma_vi_tri: 4, so_luong: 60 },
  { id: 11, ma_lo_hang: 9, ma_vi_tri: 5, so_luong: 30 },
  { id: 12, ma_lo_hang: 10, ma_vi_tri: 4, so_luong: 65 },
  { id: 13, ma_lo_hang: 10, ma_vi_tri: 5, so_luong: 45 },
  { id: 14, ma_lo_hang: 11, ma_vi_tri: 5, so_luong: 70 },
  { id: 15, ma_lo_hang: 12, ma_vi_tri: 6, so_luong: 180 },
  { id: 16, ma_lo_hang: 12, ma_vi_tri: 7, so_luong: 90 },
  { id: 17, ma_lo_hang: 12, ma_vi_tri: 13, so_luong: 50 },
  { id: 18, ma_lo_hang: 13, ma_vi_tri: 7, so_luong: 140 },
  { id: 19, ma_lo_hang: 14, ma_vi_tri: 3, so_luong: 38 },
  { id: 20, ma_lo_hang: 15, ma_vi_tri: 3, so_luong: 75 },
  { id: 21, ma_lo_hang: 16, ma_vi_tri: 1, so_luong: 15 },
  { id: 22, ma_lo_hang: 17, ma_vi_tri: 8, so_luong: 25 },
  { id: 23, ma_lo_hang: 18, ma_vi_tri: 1, so_luong: 10 },
  { id: 24, ma_lo_hang: 19, ma_vi_tri: 8, so_luong: 18 },
  { id: 25, ma_lo_hang: 20, ma_vi_tri: 5, so_luong: 30 },
];

// ═══════════════════════════════════════════════════════════════════
// 14. PHIẾU NHẬP KHO (10)
// ═══════════════════════════════════════════════════════════════════

export const phieuNhapKho = [
  { id: 1, ma_ncc: 1, ma_nguoi_tao: 3, ma_kho: 1, tong_tien: 3500000, trang_thai: 'HOAN_THANH', ngay_tao: subDays(today, 1), ghi_chu: 'Nhap rau cu tuoi hang ngay' },
  { id: 2, ma_ncc: 1, ma_nguoi_tao: 3, ma_kho: 1, tong_tien: 5200000, trang_thai: 'HOAN_THANH', ngay_tao: subDays(today, 2), ghi_chu: 'Nhap dau tay Da Lat' },
  { id: 3, ma_ncc: 2, ma_nguoi_tao: 3, ma_kho: 1, tong_tien: 4800000, trang_thai: 'HOAN_THANH', ngay_tao: subDays(today, 3), ghi_chu: 'Nhap bo + broccoli' },
  { id: 4, ma_ncc: 3, ma_nguoi_tao: 3, ma_kho: 1, tong_tien: 12000000, trang_thai: 'HOAN_THANH', ngay_tao: subDays(today, 15), ghi_chu: 'Nhap gao ST25 + gao lut' },
  { id: 5, ma_ncc: 4, ma_nguoi_tao: 3, ma_kho: 1, tong_tien: 6500000, trang_thai: 'HOAN_THANH', ngay_tao: subDays(today, 2), ghi_chu: 'Nhap xoai Cat Hoa Loc' },
  { id: 6, ma_ncc: 5, ma_nguoi_tao: 3, ma_kho: 1, tong_tien: 8900000, trang_thai: 'HOAN_THANH', ngay_tao: subDays(today, 30), ghi_chu: 'Nhap mat ong + tieu' },
  { id: 7, ma_ncc: 1, ma_nguoi_tao: 3, ma_kho: 2, tong_tien: 2800000, trang_thai: 'HOAN_THANH', ngay_tao: subDays(today, 5), ghi_chu: 'Nhap rau cu cho kho Da Nang' },
  { id: 8, ma_ncc: 3, ma_nguoi_tao: 3, ma_kho: 2, tong_tien: 9500000, trang_thai: 'HOAN_THANH', ngay_tao: subDays(today, 12), ghi_chu: 'Nhap gao cho kho Da Nang' },
  { id: 9, ma_ncc: 2, ma_nguoi_tao: 3, ma_kho: 3, tong_tien: 4200000, trang_thai: 'HOAN_THANH', ngay_tao: subDays(today, 7), ghi_chu: 'Nhap hang cho kho Ha Noi' },
  { id: 10, ma_ncc: 4, ma_nguoi_tao: 3, ma_kho: 1, tong_tien: 3100000, trang_thai: 'CHO_KIEM_TRA', ngay_tao: subDays(today, 0), ghi_chu: 'Nhap xoai moi - cho kiem tra' },
];

// ═══════════════════════════════════════════════════════════════════
// 15. CHI TIẾT PHIẾU NHẬP (2-3 per receipt = ~23)
// ═══════════════════════════════════════════════════════════════════

export const chiTietPhieuNhap = [
  // Phieu 1
  { id: 1, ma_phieu_nhap: 1, ma_bien_the: 1, so_luong_yeu_cau: 100, so_luong_thuc_nhan: 100, don_gia: 15000 },
  { id: 2, ma_phieu_nhap: 1, ma_bien_the: 5, so_luong_yeu_cau: 80, so_luong_thuc_nhan: 80, don_gia: 25000 },
  // Phieu 2
  { id: 3, ma_phieu_nhap: 2, ma_bien_the: 9, so_luong_yeu_cau: 50, so_luong_thuc_nhan: 48, don_gia: 80000 },
  { id: 4, ma_phieu_nhap: 2, ma_bien_the: 10, so_luong_yeu_cau: 30, so_luong_thuc_nhan: 30, don_gia: 95000 },
  // Phieu 3
  { id: 5, ma_phieu_nhap: 3, ma_bien_the: 14, so_luong_yeu_cau: 60, so_luong_thuc_nhan: 60, don_gia: 50000 },
  { id: 6, ma_phieu_nhap: 3, ma_bien_the: 7, so_luong_yeu_cau: 40, so_luong_thuc_nhan: 38, don_gia: 35000 },
  // Phieu 4
  { id: 7, ma_phieu_nhap: 4, ma_bien_the: 4, so_luong_yeu_cau: 200, so_luong_thuc_nhan: 200, don_gia: 35000 },
  { id: 8, ma_phieu_nhap: 4, ma_bien_the: 6, so_luong_yeu_cau: 150, so_luong_thuc_nhan: 150, don_gia: 42000 },
  // Phieu 5
  { id: 9, ma_phieu_nhap: 5, ma_bien_the: 12, so_luong_yeu_cau: 100, so_luong_thuc_nhan: 98, don_gia: 30000 },
  { id: 10, ma_phieu_nhap: 5, ma_bien_the: 13, so_luong_yeu_cau: 80, so_luong_thuc_nhan: 80, don_gia: 55000 },
  { id: 11, ma_phieu_nhap: 5, ma_bien_the: 8, so_luong_yeu_cau: 30, so_luong_thuc_nhan: 30, don_gia: 20000 },
  // Phieu 6
  { id: 12, ma_phieu_nhap: 6, ma_bien_the: 8, so_luong_yeu_cau: 50, so_luong_thuc_nhan: 50, don_gia: 120000 },
  { id: 13, ma_phieu_nhap: 6, ma_bien_the: 11, so_luong_yeu_cau: 100, so_luong_thuc_nhan: 100, don_gia: 65000 },
  // Phieu 7
  { id: 14, ma_phieu_nhap: 7, ma_bien_the: 1, so_luong_yeu_cau: 80, so_luong_thuc_nhan: 78, don_gia: 15000 },
  { id: 15, ma_phieu_nhap: 7, ma_bien_the: 3, so_luong_yeu_cau: 60, so_luong_thuc_nhan: 60, don_gia: 28000 },
  // Phieu 8
  { id: 16, ma_phieu_nhap: 8, ma_bien_the: 4, so_luong_yeu_cau: 150, so_luong_thuc_nhan: 150, don_gia: 35000 },
  { id: 17, ma_phieu_nhap: 8, ma_bien_the: 6, so_luong_yeu_cau: 100, so_luong_thuc_nhan: 100, don_gia: 42000 },
  { id: 18, ma_phieu_nhap: 8, ma_bien_the: 15, so_luong_yeu_cau: 40, so_luong_thuc_nhan: 40, don_gia: 45000 },
  // Phieu 9
  { id: 19, ma_phieu_nhap: 9, ma_bien_the: 14, so_luong_yeu_cau: 50, so_luong_thuc_nhan: 50, don_gia: 50000 },
  { id: 20, ma_phieu_nhap: 9, ma_bien_the: 12, so_luong_yeu_cau: 70, so_luong_thuc_nhan: 68, don_gia: 30000 },
  // Phieu 10 (cho kiem tra)
  { id: 21, ma_phieu_nhap: 10, ma_bien_the: 12, so_luong_yeu_cau: 60, so_luong_thuc_nhan: 0, don_gia: 30000 },
  { id: 22, ma_phieu_nhap: 10, ma_bien_the: 13, so_luong_yeu_cau: 40, so_luong_thuc_nhan: 0, don_gia: 55000 },
  { id: 23, ma_phieu_nhap: 10, ma_bien_the: 8, so_luong_yeu_cau: 20, so_luong_thuc_nhan: 0, don_gia: 20000 },
];

// ═══════════════════════════════════════════════════════════════════
// 16. PHIẾU XUẤT KHO (8)
// ═══════════════════════════════════════════════════════════════════

export const phieuXuatKho = [
  { id: 1, ma_nguoi_tao: 3, ma_kho: 1, ma_don_hang: 26, ma_phieu_tra_ncc: null, ly_do_xuat: 'Xuat theo don hang #26', trang_thai: 'HOAN_THANH', ngay_tao: subDays(today, 12) },
  { id: 2, ma_nguoi_tao: 3, ma_kho: 1, ma_don_hang: 27, ma_phieu_tra_ncc: null, ly_do_xuat: 'Xuat theo don hang #27', trang_thai: 'HOAN_THANH', ngay_tao: subDays(today, 10) },
  { id: 3, ma_nguoi_tao: 3, ma_kho: 1, ma_don_hang: 30, ma_phieu_tra_ncc: null, ly_do_xuat: 'Xuat theo don hang #30', trang_thai: 'HOAN_THANH', ngay_tao: subDays(today, 13) },
  { id: 4, ma_nguoi_tao: 3, ma_kho: 1, ma_don_hang: 34, ma_phieu_tra_ncc: null, ly_do_xuat: 'Xuat theo don hang #34', trang_thai: 'HOAN_THANH', ngay_tao: subDays(today, 11) },
  { id: 5, ma_nguoi_tao: 3, ma_kho: 1, ma_don_hang: 36, ma_phieu_tra_ncc: null, ly_do_xuat: 'Xuat theo don hang #36 - VIP', trang_thai: 'HOAN_THANH', ngay_tao: subDays(today, 23) },
  { id: 6, ma_nguoi_tao: 3, ma_kho: 1, ma_don_hang: 16, ma_phieu_tra_ncc: null, ly_do_xuat: 'Xuat theo don hang #16 - dang giao', trang_thai: 'HOAN_THANH', ngay_tao: subDays(today, 4) },
  { id: 7, ma_nguoi_tao: 3, ma_kho: 2, ma_don_hang: 18, ma_phieu_tra_ncc: null, ly_do_xuat: 'Xuat kho Da Nang - don #18', trang_thai: 'HOAN_THANH', ngay_tao: subDays(today, 4) },
  { id: 8, ma_nguoi_tao: 3, ma_kho: 1, ma_don_hang: null, ma_phieu_tra_ncc: null, ly_do_xuat: 'Xuat huy hang het han', trang_thai: 'HOAN_THANH', ngay_tao: subDays(today, 1) },
];

// ═══════════════════════════════════════════════════════════════════
// 17. CHI TIẾT PHIẾU XUẤT (2-3 per receipt = ~22)
// ═══════════════════════════════════════════════════════════════════

export const chiTietPhieuXuat = [
  // Phieu xuat 1 (don 26)
  { id: 1, ma_phieu_xuat: 1, ma_bien_the: 1, so_luong_yeu_cau: 5, so_luong_thuc_xuat: 5 },
  { id: 2, ma_phieu_xuat: 1, ma_bien_the: 7, so_luong_yeu_cau: 2, so_luong_thuc_xuat: 2 },
  // Phieu xuat 2 (don 27)
  { id: 3, ma_phieu_xuat: 2, ma_bien_the: 9, so_luong_yeu_cau: 2, so_luong_thuc_xuat: 2 },
  { id: 4, ma_phieu_xuat: 2, ma_bien_the: 12, so_luong_yeu_cau: 3, so_luong_thuc_xuat: 3 },
  // Phieu xuat 3 (don 30)
  { id: 5, ma_phieu_xuat: 3, ma_bien_the: 10, so_luong_yeu_cau: 3, so_luong_thuc_xuat: 3 },
  { id: 6, ma_phieu_xuat: 3, ma_bien_the: 14, so_luong_yeu_cau: 2, so_luong_thuc_xuat: 2 },
  { id: 7, ma_phieu_xuat: 3, ma_bien_the: 5, so_luong_yeu_cau: 2, so_luong_thuc_xuat: 2 },
  // Phieu xuat 4 (don 34)
  { id: 8, ma_phieu_xuat: 4, ma_bien_the: 14, so_luong_yeu_cau: 5, so_luong_thuc_xuat: 5 },
  { id: 9, ma_phieu_xuat: 4, ma_bien_the: 10, so_luong_yeu_cau: 2, so_luong_thuc_xuat: 2 },
  { id: 10, ma_phieu_xuat: 4, ma_bien_the: 7, so_luong_yeu_cau: 1, so_luong_thuc_xuat: 1 },
  // Phieu xuat 5 (don 36 - VIP)
  { id: 11, ma_phieu_xuat: 5, ma_bien_the: 10, so_luong_yeu_cau: 5, so_luong_thuc_xuat: 5 },
  { id: 12, ma_phieu_xuat: 5, ma_bien_the: 14, so_luong_yeu_cau: 3, so_luong_thuc_xuat: 3 },
  { id: 13, ma_phieu_xuat: 5, ma_bien_the: 11, so_luong_yeu_cau: 1, so_luong_thuc_xuat: 1 },
  // Phieu xuat 6 (don 16)
  { id: 14, ma_phieu_xuat: 6, ma_bien_the: 5, so_luong_yeu_cau: 4, so_luong_thuc_xuat: 4 },
  { id: 15, ma_phieu_xuat: 6, ma_bien_the: 1, so_luong_yeu_cau: 2, so_luong_thuc_xuat: 2 },
  // Phieu xuat 7 (don 18 - kho Da Nang)
  { id: 16, ma_phieu_xuat: 7, ma_bien_the: 2, so_luong_yeu_cau: 3, so_luong_thuc_xuat: 3 },
  { id: 17, ma_phieu_xuat: 7, ma_bien_the: 8, so_luong_yeu_cau: 2, so_luong_thuc_xuat: 2 },
  // Phieu xuat 8 (huy hang het han)
  { id: 18, ma_phieu_xuat: 8, ma_bien_the: 1, so_luong_yeu_cau: 15, so_luong_thuc_xuat: 15 },
  { id: 19, ma_phieu_xuat: 8, ma_bien_the: 5, so_luong_yeu_cau: 10, so_luong_thuc_xuat: 10 },
  { id: 20, ma_phieu_xuat: 8, ma_bien_the: 9, so_luong_yeu_cau: 18, so_luong_thuc_xuat: 18 },
  { id: 21, ma_phieu_xuat: 8, ma_bien_the: 14, so_luong_yeu_cau: 30, so_luong_thuc_xuat: 30 },
  { id: 22, ma_phieu_xuat: 8, ma_bien_the: 3, so_luong_yeu_cau: 25, so_luong_thuc_xuat: 25 },
];
