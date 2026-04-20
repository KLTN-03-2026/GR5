-- Hồ sơ admin
INSERT INTO ho_so_nguoi_dung (ma_nguoi_dung, ho_ten, chuc_vu, bo_phan)
VALUES (6, 'Admin Hệ Thống', 'Quản Trị Viên', 'Ban Giám Đốc')
ON DUPLICATE KEY UPDATE ho_ten = VALUES(ho_ten);

-- Hồ sơ staff
INSERT INTO ho_so_nguoi_dung (ma_nguoi_dung, ho_ten, chuc_vu, bo_phan)
VALUES (7, 'Staff Vận Hành', 'Nhân Viên Kho', 'Kho Vận')
ON DUPLICATE KEY UPDATE ho_ten = VALUES(ho_ten);

-- Gán role ADMIN (id=1) cho admin
INSERT INTO vai_tro_nguoi_dung (ma_nguoi_dung, ma_vai_tro) VALUES (6, 1)
ON DUPLICATE KEY UPDATE ma_vai_tro = ma_vai_tro;

-- Gán role STAFF (id=2) cho staff
INSERT INTO vai_tro_nguoi_dung (ma_nguoi_dung, ma_vai_tro) VALUES (7, 2)
ON DUPLICATE KEY UPDATE ma_vai_tro = ma_vai_tro;

-- Xác nhận kết quả
SELECT nd.email, hs.ho_ten, vr.ten_vai_tro
FROM nguoi_dung nd
JOIN ho_so_nguoi_dung hs ON nd.id = hs.ma_nguoi_dung
JOIN vai_tro_nguoi_dung vnd ON nd.id = vnd.ma_nguoi_dung
JOIN vai_tro vr ON vnd.ma_vai_tro = vr.id
WHERE nd.email IN ('admin@nongsan.vn', 'staff@nongsan.vn');
