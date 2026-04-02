import prisma
 from "@/lib/prisma";
 
async function main() {
  // ==========================================
  // 1. MODULE TÀI KHOẢN & PHÂN QUYỀN
  // ==========================================
  console.log('👤 Đang tạo Vai trò và Người dùng...');

  const roleAdmin = await prisma.vai_tro.create({
    data: { ten_vai_tro: 'ADMIN', mo_ta: 'Quản trị viên toàn quyền hệ thống' }
  });
  const roleKhachHang = await prisma.vai_tro.create({
    data: { ten_vai_tro: 'KHACH_HANG', mo_ta: 'Khách hàng mua sắm' }
  });

  const admin = await prisma.nguoi_dung.create({
    data: {
      email: 'admin@agri.com',
      mat_khau: 'hashed_password_123', // Thực tế nên dùng bcrypt
      trang_thai: 1,
      ho_so_nguoi_dung: {
        create: { ho_ten: 'Lê Hưng (Admin)', so_dien_thoai: '0901234567' }
      },
      vai_tro_nguoi_dung: {
        create: { ma_vai_tro: roleAdmin.id }
      }
    }
  });

  // ==========================================
  // 2. MODULE DANH MỤC & SẢN PHẨM
  // ==========================================
  console.log('🍎 Đang tạo Danh mục và Sản phẩm nông sản...');

  const cateTraiCay = await prisma.danh_muc.create({
    data: { ten_danh_muc: 'Trái cây Tươi' }
  });
  const cateNguCoc = await prisma.danh_muc.create({
    data: { ten_danh_muc: 'Lương thực & Ngũ cốc' }
  });

  // Sản phẩm 1: Sầu Riêng Ri6
  const spSauRieng = await prisma.san_pham.create({
    data: {
      ma_danh_muc: cateTraiCay.id,
      ten_san_pham: 'Sầu Riêng Ri6 Hạt Lép',
      mo_ta: 'Sầu riêng chuẩn VietGAP, cơm vàng hạt lép, thơm ngon nức mũi.',
      xuat_xu: 'Bến Tre',
      trang_thai: 'DANG_BAN',
      bien_the_san_pham: {
        create: [
          { ma_sku: 'SR-RI6-1KG', ten_bien_the: 'Trái 1.5 - 2kg', don_vi_tinh: 'Kg', gia_ban: 120000, gia_goc: 100000 },
          { ma_sku: 'SR-RI6-BOX', ten_bien_the: 'Khay bóc sẵn 500g', don_vi_tinh: 'Hộp', gia_ban: 180000, gia_goc: 150000 }
        ]
      },
      anh_san_pham: {
        create: { duong_dan_anh: '/images/sau-rieng-ri6.jpg', la_anh_chinh: true }
      }
    }
  });

  // Sản phẩm 2: Gạo ST25
  const spGao = await prisma.san_pham.create({
    data: {
      ma_danh_muc: cateNguCoc.id,
      ten_san_pham: 'Gạo Ông Cua ST25 Lúa Tôm',
      mo_ta: 'Gạo ngon nhất thế giới, hạt dài, thơm dẻo.',
      xuat_xu: 'Sóc Trăng',
      bien_the_san_pham: {
        create: [
          { ma_sku: 'GAO-ST25-5KG', ten_bien_the: 'Túi 5Kg', don_vi_tinh: 'Túi', gia_ban: 190000, gia_goc: 170000 }
        ]
      }
    }
  });

  // ==========================================
  // 3. MODULE KHO BÃI & NHÀ CUNG CẤP
  // ==========================================
  console.log('🏭 Đang thiết lập Nhà cung cấp và Kho hàng...');

  const ncc = await prisma.nha_cung_cap.create({
    data: { ten_ncc: 'HTX Nông Nghiệp Xanh', so_dien_thoai: '02873001122', dia_chi: 'Miền Tây' }
  });

  const khoChinh = await prisma.kho_hang.create({
    data: { ten_kho: 'Kho Tổng Miền Nam', dia_chi: 'KCN Tân Bình, TP.HCM' }
  });

  const viTri = await prisma.vi_tri_kho.create({
    data: { ma_kho: khoChinh.id, khu_vuc: 'Khu Lạnh A', day: 'Dãy 1', ke: 'Kệ 3' }
  });

  // ==========================================
  // 4. MODULE THANH TOÁN & VẬN CHUYỂN
  // ==========================================
  console.log('🚚 Đang tạo Phương thức thanh toán...');

  await prisma.phuong_thuc_thanh_toan.createMany({
    data: [
      { ten_phuong_thuc: 'Thanh toán khi nhận hàng (COD)' },
      { ten_phuong_thuc: 'Chuyển khoản Ngân hàng (VietQR)' },
      { ten_phuong_thuc: 'Ví MoMo' }
    ]
  });

  await prisma.doi_tac_van_chuyen.create({
    data: { ten_doi_tac: 'Giao Hàng Tiết Kiệm', so_dien_thoai: '19001008' }
  });

  // ==========================================
  // 5. MODULE NHÂN SỰ & CA LÀM VIỆC
  // ==========================================
  console.log('⏰ Đang lên lịch Ca làm việc...');

  await prisma.ca_lam_viec.createMany({
    data: [
      { ten_ca: 'Ca Sáng (06:00 - 14:00)', gio_bat_dau: new Date('1970-01-01T06:00:00Z'), gio_ket_thuc: new Date('1970-01-01T14:00:00Z') },
      { ten_ca: 'Ca Chiều (14:00 - 22:00)', gio_bat_dau: new Date('1970-01-01T14:00:00Z'), gio_ket_thuc: new Date('1970-01-01T22:00:00Z') }
    ]
  });

  console.log('🎉 Xong! Database đã được nạp đầy đủ dữ liệu mồi.');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi trong quá trình Seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });