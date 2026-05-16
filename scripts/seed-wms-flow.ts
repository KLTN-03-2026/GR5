import prisma from '../src/lib/prisma';

async function main() {
  console.log('Seeding data for WMS Flow...');

  // 1. Tạo Nhà Cung Cấp
  const ncc = await prisma.nha_cung_cap.upsert({
    where: { ma_ncc: 'NCC_TEST_WMS' },
    update: {},
    create: {
      ma_ncc: 'NCC_TEST_WMS',
      ten_ncc: 'Nông Sản Sạch Đà Lạt (TEST WMS)',
      so_dien_thoai: '0901234567',
      diem_uy_tin: 4.8,
    }
  });
  console.log('- NCC:', ncc.ten_ncc);

  // 2. Tạo Danh mục
  const danhMuc = await prisma.danh_muc.upsert({
    where: { id: 9999 }, // Tạm dùng ID lớn
    update: {},
    create: {
      id: 9999,
      ten_danh_muc: 'Rau Củ Tươi (TEST)',
    }
  });

  // 3. Tạo Sản Phẩm & Biến Thể
  const sanPham1 = await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Cà Chua Cherry Đà Lạt (TEST)',
      ma_danh_muc: danhMuc.id,
      bien_the_san_pham: {
        create: [
          { ma_sku: 'SKU-CCH-500G', ten_bien_the: 'Hộp 500g', don_vi_tinh: 'Hộp', gia_ban: 25000, gia_goc: 15000 },
          { ma_sku: 'SKU-CCH-1KG', ten_bien_the: 'Thùng 1kg', don_vi_tinh: 'Thùng', gia_ban: 45000, gia_goc: 28000 }
        ]
      }
    },
    include: { bien_the_san_pham: true }
  });

  const sanPham2 = await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Rau Xà Lách Thủy Canh (TEST)',
      ma_danh_muc: danhMuc.id,
      bien_the_san_pham: {
        create: [
          { ma_sku: 'SKU-RXL-250G', ten_bien_the: 'Túi 250g', don_vi_tinh: 'Túi', gia_ban: 15000, gia_goc: 8000 }
        ]
      }
    },
    include: { bien_the_san_pham: true }
  });

  console.log('- Đã tạo 2 sản phẩm test');

  // Lấy ID biến thể
  const b1 = sanPham1.bien_the_san_pham[0].id; // 500g
  const b2 = sanPham1.bien_the_san_pham[1].id; // 1kg
  const b3 = sanPham2.bien_the_san_pham[0].id; // Rau 250g

  // 4. Lấy 1 User ngẫu nhiên (hoặc ID 1) làm người tạo
  let user = await prisma.nguoi_dung.findFirst({ where: { email: 'admin@gmail.com' } });
  if (!user) user = await prisma.nguoi_dung.findFirst();

  // 5. Tạo Phiếu Nhập Kho (PO) ở trạng thái PENDING
  const phieuNhap = await prisma.phieu_nhap_kho.create({
    data: {
      ma_ncc: ncc.id,
      ma_nguoi_tao: user?.id || 1,
      tong_tien: 1000000,
      trang_thai: 'PENDING', // PO chờ giao hàng tới cổng
      ghi_chu: 'PO Test cho WMS Flow (Check-in -> Dỡ hàng -> QC -> Tồn kho)',
      chi_tiet_phieu_nhap: {
        create: [
          { ma_bien_the: b1, so_luong_yeu_cau: 100, don_gia: 15000 },
          { ma_bien_the: b2, so_luong_yeu_cau: 50, don_gia: 28000 },
          { ma_bien_the: b3, so_luong_yeu_cau: 200, don_gia: 8000 },
        ]
      }
    }
  });

  console.log(`\n🎉 Đã tạo thành công Phiếu Nhập Kho mẫu!`);
  console.log(`Mã Phiếu: PN-${phieuNhap.id}`);
  console.log(`Trạng thái: PENDING`);
  console.log(`Sản phẩm: Cà chua cherry & Xà lách thủy canh`);
  console.log(`\n👉 BẠN CÓ THỂ TEST BẰNG CÁCH GỌI API THEO THỨ TỰ:`);
  console.log(`1. Lấy thông tin PO: GET /api/admin/warehouse/receiving/po/${phieuNhap.id}`);
  console.log(`2. Check-in (Tài xế tới): PUT /api/admin/warehouse/receiving/po/${phieuNhap.id}/status (body: {"status":"RECEIVING"})`);
  console.log(`3. Dỡ hàng & Chuyển QC: POST /api/admin/warehouse/receiving/submit`);
  console.log(`   (Gửi body chứa poId = ${phieuNhap.id} và items kèm actualQty)`);
  console.log(`4. Mở Dashboard QC trên UI: /admin/warehouse/qc để test quy trình duyệt.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
