import * as dotenv from 'dotenv';
dotenv.config();

// 2. Sau đó mới import các thứ khác
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '@/app/generated/prisma/client';

// 3. Khởi tạo Adapter
// Cấu hình Adapter theo đúng yêu cầu của bạn
const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT) || 3307, // Port Docker của bạn
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5,
  allowPublicKeyRetrieval: true,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🚀 Đang dọn dẹp dữ liệu cũ...");
  
  // Xóa dữ liệu cũ theo thứ tự (con trước, cha sau)
  await prisma.chi_tiet_don_hang.deleteMany();
  await prisma.don_hang.deleteMany();
  await prisma.ma_giam_gia.deleteMany();
  await prisma.dia_chi_nguoi_dung.deleteMany();
  await prisma.ho_so_nguoi_dung.deleteMany();
  await prisma.nguoi_dung.deleteMany();
  await prisma.bien_the_san_pham.deleteMany();
  await prisma.san_pham.deleteMany();
  await prisma.danh_muc.deleteMany();

  console.log("🌱 Bắt đầu gieo mầm (Seeding) dữ liệu mới...");

  // 1. TẠO DANH MỤC
  const dmRau = await prisma.danh_muc.create({
    data: { ten_danh_muc: "Rau củ hữu cơ" }
  });

  const dmTraiCay = await prisma.danh_muc.create({
    data: { ten_danh_muc: "Trái cây tươi" }
  });

  // 2. TẠO SẢN PHẨM & BIẾN THỂ
  const sanPham1 = await prisma.san_pham.create({
    data: {
      ten_san_pham: "Dâu tây Đà Lạt chuẩn VietGAP",
      mo_ta: "Dâu tây tươi mọng, ngọt thanh, hái tận vườn Đà Lạt.",
      xuat_xu: "Đà Lạt, Việt Nam",
      ma_danh_muc: dmTraiCay.id,
      bien_the_san_pham: {
        create: [
          {
            ten_bien_the: "Hộp 500g",
            don_vi_tinh: "Hộp",
            gia_ban: 150000,
            gia_goc: 130000,
            ma_sku: "DT-DALAT-500G"
          },
          {
            ten_bien_the: "Khay 1kg",
            don_vi_tinh: "Khay",
            gia_ban: 290000,
            gia_goc: 250000,
            ma_sku: "DT-DALAT-1KG"
          }
        ]
      }
    }
  });

  const sanPham2 = await prisma.san_pham.create({
    data: {
      ten_san_pham: "Cải Kale Khủng Long",
      mo_ta: "Rau cải Kale xanh tốt, giàu vitamin dùng làm salad.",
      xuat_xu: "Đà Lạt",
      ma_danh_muc: dmRau.id,
      bien_the_san_pham: {
        create: {
          ten_bien_the: "Bó 300g",
          don_vi_tinh: "Bó",
          gia_ban: 45000,
          gia_goc: 35000,
          ma_sku: "KALE-300G"
        }
      }
    }
  });

  // 3. TẠO NGƯỜI DÙNG KHÁCH HÀNG
  const user = await prisma.nguoi_dung.create({
    data: {
      email: "khachhang_vip@gmail.com",
      mat_khau: "123456789", 
      ho_so_nguoi_dung: {
        create: {
          ho_ten: "Nguyễn Văn Freshy",
          so_dien_thoai: "0901234567",
        }
      },
      dia_chi_nguoi_dung: {
        create: {
          chi_tiet_dia_chi: "123 Đường Rau Sạch, Phường Xanh, Đà Nẵng",
          la_mac_dinh: true
        }
      }
    }
  });

  // 4. TẠO MÃ GIẢM GIÁ
  const km = await prisma.ma_giam_gia.create({
    data: {
      ma_code: "FRESHY2026",
      loai_giam_gia: "FIXED",
      gia_tri_giam: 20000,
      don_toi_thieu: 100000,
      ngay_bat_dau: new Date(),
      ngay_ket_thuc: new Date(2026, 11, 31)
    }
  });

  // 5. TẠO ĐƠN HÀNG MẪU (Gắn với Dâu Tây 500g)
  const bienTheDauTay = await prisma.bien_the_san_pham.findUnique({
    where: { ma_sku: "DT-DALAT-500G" }
  });

  if (bienTheDauTay) {
    const so_luong_mua = 2; // Mua 2 hộp
    const don_gia = Number(bienTheDauTay.gia_ban); // 150k
    const tien_hang = don_gia * so_luong_mua; // 300k
    const phi_ship = 30000;
    const giam_gia = Number(km.gia_tri_giam); // 20k

    await prisma.don_hang.create({
      data: {
        ma_nguoi_dung: user.id,
        ma_khuyen_mai: km.id,
        tong_tien: tien_hang + phi_ship - giam_gia, // 310k
        phi_van_chuyen: phi_ship,
        trang_thai: "DANG_GIAO_HANG",
        chi_tiet_don_hang: {
          create: {
            ma_bien_the: bienTheDauTay.id,
            so_luong: so_luong_mua,
            don_gia: don_gia
          }
        }
      }
    });
  }

  console.log("✅ TUYỆT VỜI! Dữ liệu đã được tạo thành công.");

  console.log('🌱 Đang bắt đầu bơm (seed) dữ liệu cho Module Kho...');

  // ==========================================
  // 1. TẠO DATA CƠ BẢN (Nhà cung cấp, Danh mục, Sản phẩm)
  // ==========================================
  const ncc = await prisma.nha_cung_cap.create({
    data: { ten_ncc: 'Nông Trại Đà Lạt', so_dien_thoai: '0901234567', email: 'contact@dalatfarm.vn' }
  });

  const danhMuc = await prisma.danh_muc.create({
    data: { ten_danh_muc: 'Rau củ quả sạch' }
  });

  const sanPham = await prisma.san_pham.create({
    data: { ten_san_pham: 'Rau Muống Thủy Canh', ma_danh_muc: danhMuc.id, trang_thai: 'DANG_BAN' }
  });

  const bienThe = await prisma.bien_the_san_pham.create({
    data: { 
      ma_san_pham: sanPham.id, 
      ma_sku: `RM-500G-${Date.now()}`, 
      ten_bien_the: 'Rau Muống Thủy Canh (Gói 500g)', 
      don_vi_tinh: 'Gói', 
      gia_ban: 15000 
    }
  });

  // ==========================================
  // 2. TẠO KHO HÀNG & VỊ TRÍ
  // ==========================================
  const kho = await prisma.kho_hang.create({
    data: { ten_kho: 'Tổng Kho Đà Nẵng', dia_chi: 'Hòa Khánh, Liên Chiểu, Đà Nẵng' }
  });

  const viTriA = await prisma.vi_tri_kho.create({ data: { ma_kho: kho.id, khu_vuc: 'Khu A', day: 'D1', ke: 'K1', tang: 'T1' }});
  const viTriB = await prisma.vi_tri_kho.create({ data: { ma_kho: kho.id, khu_vuc: 'Khu B', day: 'D2', ke: 'K1', tang: 'T1' }});

  // ==========================================
  // 3. TẠO LÔ HÀNG 1 (Bình thường - Tồn kho nhiều)
  // ==========================================
  const loHang1 = await prisma.lo_hang.create({
    data: {
      ma_lo_hang: `LO-RM-SAFE-${Date.now()}`,
      ma_ncc: ncc.id,
      ma_bien_the: bienThe.id,
      ngay_nhap_kho: new Date(),
      han_su_dung: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // HSD: 30 ngày tới
    }
  });

  await prisma.ton_kho_tong.create({
    data: { ma_lo_hang: loHang1.id, ma_vi_tri: viTriA.id, so_luong: 80 }
  });

  // Đẻ 5 mã QR mẫu cho lô này
  for(let i=1; i<=5; i++) {
    await prisma.kien_hang_chi_tiet.create({
      data: { ma_lo_hang: loHang1.id, ma_vi_tri: viTriA.id, ma_vach_quet: `QR-${loHang1.ma_lo_hang}-00${i}`, trang_thai: 'TRONG_KHO' }
    });
  }

  // ==========================================
  // 4. TẠO LÔ HÀNG 2 (Sắp hết hạn - Để test chuông cảnh báo)
  // ==========================================
  const loHang2 = await prisma.lo_hang.create({
    data: {
      ma_lo_hang: `LO-RM-WARNING-${Date.now()}`,
      ma_ncc: ncc.id,
      ma_bien_the: bienThe.id,
      ngay_nhap_kho: new Date(),
      han_su_dung: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // HSD: Chỉ còn 2 ngày
    }
  });

  await prisma.ton_kho_tong.create({
    data: { ma_lo_hang: loHang2.id, ma_vi_tri: viTriB.id, so_luong: 25 }
  });

  for(let i=1; i<=3; i++) {
    await prisma.kien_hang_chi_tiet.create({
      data: { ma_lo_hang: loHang2.id, ma_vi_tri: viTriB.id, ma_vach_quet: `QR-${loHang2.ma_lo_hang}-00${i}`, trang_thai: 'TRONG_KHO' }
    });
  }

  // Đẻ 1 record vào bảng cảnh báo
  await prisma.canh_bao_lo_hang.create({
    data: { ma_lo_hang: loHang2.id, loai_canh_bao: 'CON_2_NGAY', da_xu_ly: false, so_ngay_con: 2 }
  });

  // ==========================================
  // 5. TẠO LỊCH SỬ XUẤT KHO MẪU
  // ==========================================
  const phieuXuat = await prisma.phieu_xuat_kho.create({
    data: { ma_kho: kho.id, ly_do_xuat: 'Xuất giao hàng Winmart', trang_thai: 'HOAN_THANH' }
  });

  await prisma.kien_hang_da_xuat.createMany({
    data: [
      { ma_phieu_xuat: phieuXuat.id, ma_vach_quet: `QR-OLD-001`, ma_bien_the: bienThe.id, ngay_xuat: new Date() },
      { ma_phieu_xuat: phieuXuat.id, ma_vach_quet: `QR-OLD-002`, ma_bien_the: bienThe.id, ngay_xuat: new Date(Date.now() - 3600000) } // Xuất cách đây 1 tiếng
    ]
  });

  // ==========================================
  // 6. TẠO DATA MODULE NHÂN SỰ (HR) ĐỂ TEST
  // ==========================================
  console.log('⏳ Đang tạo dữ liệu Nhân sự (Nhân viên, Ca làm, Chấm công)...');

  // Xóa data cũ (nếu chạy seed nhiều lần để tránh lỗi trùng lặp)
  await prisma.lich_su_cham_cong.deleteMany();
  await prisma.lich_phan_cong_ca.deleteMany();
  await prisma.ca_lam_viec.deleteMany();
  await prisma.ho_so_nguoi_dung.deleteMany({ where: { cccd: { in: ['001099111111', '001099222222', '001099333333'] } } });
  await prisma.nguoi_dung.deleteMany({ where: { email: { in: ['nva@nongsan.vn', 'ttb@nongsan.vn', 'lvc@nongsan.vn'] } } });

  // A. TẠO 3 CA LÀM VIỆC CHUẨN (Dùng mốc 1970 theo chuẩn db.Time)
  const caSang = await prisma.ca_lam_viec.create({
    data: { ten_ca: 'Ca Sáng', gio_bat_dau: new Date('1970-01-01T06:00:00.000Z'), gio_ket_thuc: new Date('1970-01-01T14:00:00.000Z') }
  });
  const caChieu = await prisma.ca_lam_viec.create({
    data: { ten_ca: 'Ca Chiều', gio_bat_dau: new Date('1970-01-01T14:00:00.000Z'), gio_ket_thuc: new Date('1970-01-01T22:00:00.000Z') }
  });
  const caToi = await prisma.ca_lam_viec.create({
    data: { ten_ca: 'Ca Tối (Đêm)', gio_bat_dau: new Date('1970-01-01T22:00:00.000Z'), gio_ket_thuc: new Date('1970-01-02T06:00:00.000Z') }
  });

  // B. TẠO 3 NHÂN VIÊN MẪU
  const nv1 = await prisma.nguoi_dung.create({ data: { email: 'nva@nongsan.vn', mat_khau: '123456', trang_thai: 1 } });
  await prisma.ho_so_nguoi_dung.create({
    data: { ma_nguoi_dung: nv1.id, ho_ten: 'Nguyễn Văn A', so_dien_thoai: '0901111111', cccd: '001099111111', chuc_vu: 'Nhân viên kho', bo_phan: 'Kho Tổng', luong_theo_gio: 25000, ngay_vao_lam: new Date('2025-01-01') }
  });

  const nv2 = await prisma.nguoi_dung.create({ data: { email: 'ttb@nongsan.vn', mat_khau: '123456', trang_thai: 1 } });
  await prisma.ho_so_nguoi_dung.create({
    data: { ma_nguoi_dung: nv2.id, ho_ten: 'Trần Thị B', so_dien_thoai: '0902222222', cccd: '001099222222', chuc_vu: 'Kiểm kê', bo_phan: 'Kho Tổng', luong_theo_gio: 27000, ngay_vao_lam: new Date('2025-06-15') }
  });

  const nv3 = await prisma.nguoi_dung.create({ data: { email: 'lvc@nongsan.vn', mat_khau: '123456', trang_thai: 1 } });
  await prisma.ho_so_nguoi_dung.create({
    data: { ma_nguoi_dung: nv3.id, ho_ten: 'Lê Văn C', so_dien_thoai: '0903333333', cccd: '001099333333', chuc_vu: 'Thủ kho', bo_phan: 'Quản lý', luong_theo_gio: 35000, ngay_vao_lam: new Date('2024-02-10') }
  });

  // C. PHÂN CA CHO "HÔM NAY" & "NGÀY MAI"
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const startOfTomorrow = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());

  // NV1: Làm sáng hôm nay và mai
  await prisma.lich_phan_cong_ca.createMany({
    data: [
      { ma_nguoi_dung: nv1.id, ma_ca_lam: caSang.id, ngay_lam_viec: startOfToday },
      { ma_nguoi_dung: nv1.id, ma_ca_lam: caSang.id, ngay_lam_viec: startOfTomorrow },
    ]
  });

  // NV2: Làm chiều hôm nay
  await prisma.lich_phan_cong_ca.create({
    data: { ma_nguoi_dung: nv2.id, ma_ca_lam: caChieu.id, ngay_lam_viec: startOfToday }
  });

  // NV3: Làm tối hôm nay
  await prisma.lich_phan_cong_ca.create({
    data: { ma_nguoi_dung: nv3.id, ma_ca_lam: caToi.id, ngay_lam_viec: startOfToday }
  });

  // D. TẠO DỮ LIỆU CHẤM CÔNG (Giả lập thực tế)
  // NV1: Đi làm đúng giờ (Chấm vào lúc 05:55 sáng) - Chưa chấm ra
  const gioVaoNV1 = new Date(today);
  gioVaoNV1.setHours(5, 55, 0, 0);
  await prisma.lich_su_cham_cong.create({
    data: { ma_nguoi_dung: nv1.id, ma_ca_lam: caSang.id, gio_vao: gioVaoNV1, trang_thai: 'DUNG_GIO', so_phut_tre: 0 }
  });

  // NV2: Đi làm TRỄ (Ca chiều 14h, nhưng 14h30 mới chấm) - Đã về
  const gioVaoNV2 = new Date(today);
  gioVaoNV2.setHours(14, 30, 0, 0);
  const gioRaNV2 = new Date(today);
  gioRaNV2.setHours(22, 5, 0, 0);
  await prisma.lich_su_cham_cong.create({
    data: { ma_nguoi_dung: nv2.id, ma_ca_lam: caChieu.id, gio_vao: gioVaoNV2, gio_ra: gioRaNV2, trang_thai: 'TRE', so_phut_tre: 30 }
  });

  // NV3: Ca tối - Chưa chấm (Màn hình sẽ hiển thị "Chưa vào ca" hoặc "Vắng" tùy giờ hiện tại)

  console.log('✅ Seed dữ liệu Kho thành công! Mọi thứ đã sẵn sàng!');
}

main()
  .catch((e) => {

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

