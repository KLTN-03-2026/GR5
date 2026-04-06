import * as dotenv from 'dotenv';
dotenv.config();

// 2. Sau đó mới import các thứ khác
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '@/app/generated/prisma/client';

// 3. Khởi tạo Adapter
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
}

main()
  .catch((e) => {
    console.error("❌ Xảy ra lỗi trong quá trình Seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });