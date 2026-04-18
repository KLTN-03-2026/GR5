-- Chỉ tạo các bảng mới (không ALTER bảng cũ)
CREATE TABLE IF NOT EXISTS ncc_san_pham (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ma_ncc INT NOT NULL,
  ma_san_pham INT NOT NULL,
  gia_nhap_gan_nhat DECIMAL(15,2),
  don_vi_tinh VARCHAR(20),
  so_luong_toi_thieu INT DEFAULT 1,
  thoi_gian_giao_hang_ngay INT DEFAULT 1,
  ghi_chu VARCHAR(255),
  ngay_cap_nhat_gia DATETIME DEFAULT NOW(),
  UNIQUE KEY uq_ncc_sp (ma_ncc, ma_san_pham),
  INDEX idx_ma_ncc (ma_ncc),
  INDEX idx_ma_san_pham (ma_san_pham),
  FOREIGN KEY (ma_ncc) REFERENCES nha_cung_cap(id) ON DELETE CASCADE,
  FOREIGN KEY (ma_san_pham) REFERENCES san_pham(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS hop_dong_ncc (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ma_ncc INT NOT NULL,
  so_hop_dong VARCHAR(50),
  loai_hop_dong VARCHAR(30),
  ngay_ky DATE,
  ngay_het_han DATE,
  gia_tri_hop_dong DECIMAL(15,2),
  dieu_khoan_phat TEXT,
  file_hop_dong VARCHAR(500),
  trang_thai VARCHAR(30) DEFAULT 'HIEU_LUC',
  ghi_chu TEXT,
  ngay_tao DATETIME DEFAULT NOW(),
  INDEX idx_ma_ncc (ma_ncc),
  FOREIGN KEY (ma_ncc) REFERENCES nha_cung_cap(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS danh_gia_giao_hang_ncc (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ma_phieu_nhap INT NOT NULL,
  ma_ncc INT NOT NULL,
  nguoi_danh_gia_id INT NOT NULL,
  diem_chat_luong INT,
  diem_dung_so_luong INT,
  diem_dung_han INT,
  diem_bao_goi INT,
  diem_trung_binh DECIMAL(3,1),
  co_van_de BOOLEAN DEFAULT false,
  mo_ta_van_de TEXT,
  hinh_anh_van_de JSON,
  da_xu_ly BOOLEAN DEFAULT false,
  ngay_danh_gia DATETIME DEFAULT NOW(),
  INDEX idx_ma_ncc (ma_ncc),
  INDEX idx_ma_phieu_nhap (ma_phieu_nhap),
  FOREIGN KEY (ma_ncc) REFERENCES nha_cung_cap(id) ON DELETE CASCADE,
  FOREIGN KEY (ma_phieu_nhap) REFERENCES phieu_nhap_kho(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lich_dat_hang_ncc (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ma_ncc INT NOT NULL,
  ma_san_pham INT NOT NULL,
  tan_suat VARCHAR(20),
  ngay_trong_tuan JSON,
  gio_giao VARCHAR(5),
  so_luong_mac_dinh INT,
  dang_hoat_dong BOOLEAN DEFAULT true,
  ghi_chu VARCHAR(255),
  INDEX idx_ma_ncc (ma_ncc),
  FOREIGN KEY (ma_ncc) REFERENCES nha_cung_cap(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cong_no_ncc (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ma_ncc INT NOT NULL,
  ma_phieu_nhap INT,
  loai_giao_dich VARCHAR(20),
  so_tien DECIMAL(15,2),
  so_du_sau DECIMAL(15,2),
  phuong_thuc VARCHAR(30),
  ma_giao_dich VARCHAR(100),
  nguoi_thuc_hien_id INT,
  ghi_chu TEXT,
  ngay_giao_dich DATETIME DEFAULT NOW(),
  INDEX idx_ma_ncc (ma_ncc),
  FOREIGN KEY (ma_ncc) REFERENCES nha_cung_cap(id) ON DELETE CASCADE
);

-- ALTER nha_cung_cap - thêm từng cột riêng
ALTER TABLE nha_cung_cap ADD COLUMN ma_ncc_code VARCHAR(20) UNIQUE;
ALTER TABLE nha_cung_cap ADD COLUMN loai_ncc VARCHAR(30);
ALTER TABLE nha_cung_cap ADD COLUMN tinh_thanh VARCHAR(100);
ALTER TABLE nha_cung_cap ADD COLUMN nguoi_lien_he VARCHAR(100);
ALTER TABLE nha_cung_cap ADD COLUMN zalo VARCHAR(15);
ALTER TABLE nha_cung_cap ADD COLUMN ma_so_thue VARCHAR(20);
ALTER TABLE nha_cung_cap ADD COLUMN co_hoa_don_vat BOOLEAN DEFAULT false;
ALTER TABLE nha_cung_cap ADD COLUMN hinh_thuc_thanh_toan VARCHAR(30);
ALTER TABLE nha_cung_cap ADD COLUMN so_tai_khoan VARCHAR(30);
ALTER TABLE nha_cung_cap ADD COLUMN ten_ngan_hang VARCHAR(100);
ALTER TABLE nha_cung_cap ADD COLUMN chu_ky_thanh_toan VARCHAR(30);
ALTER TABLE nha_cung_cap ADD COLUMN trang_thai VARCHAR(20) DEFAULT 'DANG_HOP_TAC';
ALTER TABLE nha_cung_cap ADD COLUMN diem_uy_tin DECIMAL(3,1) DEFAULT 5.0;
ALTER TABLE nha_cung_cap ADD COLUMN ghi_chu_noi_bo TEXT;
ALTER TABLE nha_cung_cap ADD COLUMN ngay_bat_dau_hop_tac DATE;
ALTER TABLE nha_cung_cap ADD COLUMN hinh_anh VARCHAR(500);
