import * as dotenv from 'dotenv';
dotenv.config();

import prisma from '../src/lib/prisma';

async function main() {
  console.log("🚀 Đang dọn dẹp dữ liệu cũ...");
  
  // Xóa dữ liệu cũ theo thứ tự (con trước, cha sau)
  // Chỉ xóa user sample (test order), KHÔNG xóa toàn bộ nguoi_dung để giữ admin/staff/thukho
  await prisma.chi_tiet_don_hang.deleteMany();
  await prisma.don_hang.deleteMany();
  await prisma.ma_giam_gia.deleteMany();
  await prisma.dia_chi_nguoi_dung.deleteMany({ where: { nguoi_dung: { email: "khachhang_vip@gmail.com" } } });
  await prisma.ho_so_nguoi_dung.deleteMany({ where: { nguoi_dung: { email: "khachhang_vip@gmail.com" } } });
  await prisma.nguoi_dung.deleteMany({ where: { email: "khachhang_vip@gmail.com" } });
  await prisma.bien_the_san_pham.deleteMany();
  await prisma.san_pham.deleteMany();
  await prisma.danh_muc.deleteMany();

  console.log("🌱 Bắt đầu gieo mầm (Seeding) dữ liệu mới...");

  // ==========================================
  // 1. DANH MỤC
  // ==========================================
  const dmRau = await prisma.danh_muc.create({ data: { ten_danh_muc: "Rau củ" } });
  const dmTraiCay = await prisma.danh_muc.create({ data: { ten_danh_muc: "Trái cây" } });
  const dmGao = await prisma.danh_muc.create({ data: { ten_danh_muc: "Gạo & Ngũ cốc" } });
  const dmNam = await prisma.danh_muc.create({ data: { ten_danh_muc: "Nấm tươi" } });
  const dmGiaVi = await prisma.danh_muc.create({ data: { ten_danh_muc: "Gia vị & Mật ong" } });
  const dmHat = await prisma.danh_muc.create({ data: { ten_danh_muc: "Hạt & Đậu" } });
  const dmCuQua = await prisma.danh_muc.create({ data: { ten_danh_muc: "Củ & Quả" } });
  const dmTraHoa = await prisma.danh_muc.create({ data: { ten_danh_muc: "Trà & Hoa thảo mộc" } });

  // ==========================================
  // 2. NHÀ CUNG CẤP
  // ==========================================
  const nccDaLat = await prisma.nha_cung_cap.create({
    data: { ten_ncc: "Nông trại Xanh Đà Lạt", so_dien_thoai: "0901234567", email: "contact@xanhdalat.vn", dia_chi: "Phường 5, TP. Đà Lạt, Lâm Đồng" }
  });

  const nccGiaLai = await prisma.nha_cung_cap.create({
    data: { ten_ncc: "HTX Nông nghiệp Gia Lai", so_dien_thoai: "0907654321", email: "htx@gialai.vn", dia_chi: "Pleiku, Gia Lai" }
  });

  const nccSocTrang = await prisma.nha_cung_cap.create({
    data: { ten_ncc: "HTX Lúa Gạo Sóc Trăng", so_dien_thoai: "0912345678", email: "gao@soctrang.vn", dia_chi: "Mỹ Xuyên, Sóc Trăng" }
  });

  const nccTienGiang = await prisma.nha_cung_cap.create({
    data: { ten_ncc: "Vườn Cây Tiền Giang", so_dien_thoai: "0934567890", email: "vuon@tiengiang.vn", dia_chi: "Cái Bè, Tiền Giang" }
  });

  const nccPhuQuoc = await prisma.nha_cung_cap.create({
    data: { ten_ncc: "Trang trại Mật Ong Phú Quốc", so_dien_thoai: "0945678901", email: "matong@phuquoc.vn", dia_chi: "Phú Quốc, Kiên Giang" }
  });

  // ==========================================
  // 3. SẢN PHẨM (20 sản phẩm)
  // ==========================================

  // --- RAU CỦ (dmRau) ---
  await prisma.san_pham.create({
    data: {
      ten_san_pham: "Rau Muống Thủy Canh VietGAP",
      mo_ta: "Rau muống trồng thủy canh trong nhà màng, không thuốc trừ sâu, thu hoạch mỗi sáng sớm. Thân mập, lá xanh đậm, không xơ.",
      xuat_xu: "Đà Lạt, Lâm Đồng",
      trang_thai: "DANG_BAN",
      ma_danh_muc: dmRau.id,
      anh_san_pham: { create: [{ duong_dan_anh: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=800", la_anh_chinh: true }] },
      chung_chi_san_pham: { create: [{ ten_chung_chi: "VietGAP" }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: "Bó 300g", don_vi_tinh: "Bó", gia_ban: 18000, gia_goc: 14000, ma_sku: "RMUONG-300G" },
          { ten_bien_the: "Thùng 5kg", don_vi_tinh: "Thùng", gia_ban: 260000, gia_goc: 210000, ma_sku: "RMUONG-5KG" },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: "Cải Kale Đà Lạt Hữu Cơ",
      mo_ta: "Cải kale giống Lacinato (kale khủng long) và Red Russian, trồng hữu cơ tại Đà Lạt. Giàu vitamin K, C, sắt. Dùng làm salad, sinh tố xanh hoặc xào tỏi.",
      xuat_xu: "Đà Lạt, Lâm Đồng",
      trang_thai: "DANG_BAN",
      ma_danh_muc: dmRau.id,
      anh_san_pham: { create: [{ duong_dan_anh: "https://images.unsplash.com/photo-1524179091875-bf99a9a6af57?w=800", la_anh_chinh: true }] },
      chung_chi_san_pham: { create: [{ ten_chung_chi: "Hữu cơ" }, { ten_chung_chi: "VietGAP" }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: "Bó 200g", don_vi_tinh: "Bó", gia_ban: 35000, gia_goc: 28000, ma_sku: "KALE-200G" },
          { ten_bien_the: "Túi 500g", don_vi_tinh: "Túi", gia_ban: 78000, gia_goc: 62000, ma_sku: "KALE-500G" },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: "Cà Chua Beef Đà Lạt VietGAP",
      mo_ta: "Cà chua beef (cà chua thịt) trồng trong nhà kính tại Đà Lạt. Quả to, thịt dày, ít hạt, vị chua ngọt cân bằng. Dùng nấu canh, làm sốt hoặc ăn sống.",
      xuat_xu: "Đà Lạt, Lâm Đồng",
      trang_thai: "DANG_BAN",
      ma_danh_muc: dmRau.id,
      anh_san_pham: { create: [{ duong_dan_anh: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=800", la_anh_chinh: true }] },
      chung_chi_san_pham: { create: [{ ten_chung_chi: "VietGAP" }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: "Túi 500g", don_vi_tinh: "Túi", gia_ban: 32000, gia_goc: 25000, ma_sku: "CACHUA-500G" },
          { ten_bien_the: "Thùng 5kg", don_vi_tinh: "Thùng", gia_ban: 290000, gia_goc: 230000, ma_sku: "CACHUA-5KG" },
          { ten_bien_the: "Thùng 10kg", don_vi_tinh: "Thùng", gia_ban: 560000, gia_goc: 450000, ma_sku: "CACHUA-10KG" },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: "Súp Lơ Xanh (Broccoli) Đà Lạt",
      mo_ta: "Súp lơ xanh thu hoạch khi bông còn chặt, màu xanh tươi sáng. Giàu chất chống oxy hóa, vitamin C. Trồng theo tiêu chuẩn GlobalGAP.",
      xuat_xu: "Đà Lạt, Lâm Đồng",
      trang_thai: "DANG_BAN",
      ma_danh_muc: dmRau.id,
      anh_san_pham: { create: [{ duong_dan_anh: "https://images.unsplash.com/photo-1550350981-a1e8218bfa97?w=800", la_anh_chinh: true }] },
      chung_chi_san_pham: { create: [{ ten_chung_chi: "GlobalGAP" }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: "Cây ~500g", don_vi_tinh: "Cây", gia_ban: 45000, gia_goc: 36000, ma_sku: "BROCCOLI-CY" },
          { ten_bien_the: "Túi 1kg", don_vi_tinh: "Túi", gia_ban: 82000, gia_goc: 65000, ma_sku: "BROCCOLI-1KG" },
        ]
      }
    }
  });

  // --- TRÁI CÂY (dmTraiCay) ---
  await prisma.san_pham.create({
    data: {
      ten_san_pham: "Dâu Tây Đà Lạt Chuẩn VietGAP",
      mo_ta: "Dâu tây giống Nhật, trồng trong nhà kính tại Đà Lạt ở độ cao 1.500m. Quả to đều, màu đỏ tươi, ngọt thanh, thơm dịu. Thu hoạch buổi sáng sớm, đóng hộp lạnh ngay tại vườn.",
      xuat_xu: "Đà Lạt, Lâm Đồng",
      trang_thai: "DANG_BAN",
      ma_danh_muc: dmTraiCay.id,
      anh_san_pham: { create: [{ duong_dan_anh: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800", la_anh_chinh: true }] },
      chung_chi_san_pham: { create: [{ ten_chung_chi: "VietGAP" }, { ten_chung_chi: "GlobalGAP" }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: "Hộp 250g", don_vi_tinh: "Hộp", gia_ban: 85000, gia_goc: 70000, ma_sku: "DAUTAY-250G" },
          { ten_bien_the: "Hộp 500g", don_vi_tinh: "Hộp", gia_ban: 155000, gia_goc: 128000, ma_sku: "DAUTAY-500G" },
          { ten_bien_the: "Khay 1kg", don_vi_tinh: "Khay", gia_ban: 295000, gia_goc: 245000, ma_sku: "DAUTAY-1KG" },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: "Xoài Cát Hoà Lộc Tiền Giang",
      mo_ta: "Xoài Cát Hoà Lộc đặc sản Tiền Giang — vỏ mỏng, thịt vàng dày, ít xơ, vị ngọt đậm thơm. Thu hoạch tháng 4–6, bảo quản tự nhiên không hóa chất.",
      xuat_xu: "Cái Bè, Tiền Giang",
      trang_thai: "DANG_BAN",
      ma_danh_muc: dmTraiCay.id,
      anh_san_pham: { create: [{ duong_dan_anh: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=800", la_anh_chinh: true }] },
      chung_chi_san_pham: { create: [{ ten_chung_chi: "VietGAP" }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: "Kg lẻ", don_vi_tinh: "kg", gia_ban: 75000, gia_goc: 60000, ma_sku: "XOAI-1KG" },
          { ten_bien_the: "Thùng 5kg", don_vi_tinh: "Thùng", gia_ban: 350000, gia_goc: 285000, ma_sku: "XOAI-5KG" },
          { ten_bien_the: "Thùng 10kg", don_vi_tinh: "Thùng", gia_ban: 680000, gia_goc: 550000, ma_sku: "XOAI-10KG" },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: "Bơ Booth Đắk Lắk Cỡ Lớn",
      mo_ta: "Bơ booth (bơ sáp) Đắk Lắk — loại A, trọng lượng 300–500g/quả. Thịt vàng ươm, béo ngậy, không đắng. Thu hoạch thứ 2, 4, 6 hàng tuần.",
      xuat_xu: "Buôn Ma Thuột, Đắk Lắk",
      trang_thai: "DANG_BAN",
      ma_danh_muc: dmTraiCay.id,
      anh_san_pham: { create: [{ duong_dan_anh: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=800", la_anh_chinh: true }] },
      chung_chi_san_pham: { create: [{ ten_chung_chi: "VietGAP" }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: "Kg lẻ", don_vi_tinh: "kg", gia_ban: 62000, gia_goc: 50000, ma_sku: "BO-1KG" },
          { ten_bien_the: "Thùng 10kg", don_vi_tinh: "Thùng", gia_ban: 580000, gia_goc: 470000, ma_sku: "BO-10KG" },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: "Chuối Laba Đà Lạt Chín Tự Nhiên",
      mo_ta: "Chuối Laba giống đặc sản Đà Lạt, chín vàng tự nhiên không dùng đất đèn. Quả nhỏ vừa, vỏ mỏng, ruột thơm, ngọt dịu. Thích hợp ăn tươi và chế biến.",
      xuat_xu: "Lạc Dương, Lâm Đồng",
      trang_thai: "DANG_BAN",
      ma_danh_muc: dmTraiCay.id,
      anh_san_pham: { create: [{ duong_dan_anh: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=800", la_anh_chinh: true }] },
      chung_chi_san_pham: { create: [{ ten_chung_chi: "VietGAP" }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: "Nải ~1kg", don_vi_tinh: "Nải", gia_ban: 48000, gia_goc: 38000, ma_sku: "CHUOI-1KG" },
          { ten_bien_the: "Buồng 10kg", don_vi_tinh: "Buồng", gia_ban: 430000, gia_goc: 350000, ma_sku: "CHUOI-10KG" },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: "Khoai Lang Mật Nhật Bản (Vĩnh Long)",
      mo_ta: "Khoai lang mật giống Nhật, trồng trên đất cát pha ven sông Vĩnh Long. Vỏ tím đậm, ruột vàng sậm, vị ngọt đậm như mật. Nướng than hoặc hấp đều tuyệt.",
      xuat_xu: "Bình Tân, Vĩnh Long",
      trang_thai: "DANG_BAN",
      ma_danh_muc: dmCuQua.id,
      anh_san_pham: { create: [{ duong_dan_anh: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800", la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: "Túi 1kg", don_vi_tinh: "Túi", gia_ban: 52000, gia_goc: 42000, ma_sku: "KHOAILANG-1KG" },
          { ten_bien_the: "Thùng 10kg", don_vi_tinh: "Thùng", gia_ban: 490000, gia_goc: 400000, ma_sku: "KHOAILANG-10KG" },
        ]
      }
    }
  });

  // --- GẠO & NGŨ CỐC (dmGao) ---
  await prisma.san_pham.create({
    data: {
      ten_san_pham: "Gạo ST25 Đặc Sản Sóc Trăng",
      mo_ta: "Gạo ST25 — giải nhì gạo ngon nhất thế giới 2019. Hạt dài thon, cơm dẻo mềm, thơm thoảng mùi lá dứa khi nấu. Vùng nguyên liệu Mỹ Xuyên, Sóc Trăng.",
      xuat_xu: "Mỹ Xuyên, Sóc Trăng",
      trang_thai: "DANG_BAN",
      ma_danh_muc: dmGao.id,
      anh_san_pham: { create: [{ duong_dan_anh: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800", la_anh_chinh: true }] },
      chung_chi_san_pham: { create: [{ ten_chung_chi: "VietGAP" }, { ten_chung_chi: "HACCP" }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: "Túi 2kg", don_vi_tinh: "Túi", gia_ban: 78000, gia_goc: 62000, ma_sku: "ST25-2KG" },
          { ten_bien_the: "Túi 5kg", don_vi_tinh: "Túi", gia_ban: 185000, gia_goc: 150000, ma_sku: "ST25-5KG" },
          { ten_bien_the: "Bao 25kg", don_vi_tinh: "Bao", gia_ban: 880000, gia_goc: 720000, ma_sku: "ST25-25KG" },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: "Gạo Lứt Đỏ Hữu Cơ Điện Biên",
      mo_ta: "Gạo lứt đỏ (gạo huyết rồng) trồng hữu cơ ở Điện Biên. Chưa xát trắng nên giữ nguyên lớp cám đỏ giàu anthocyanin và chất xơ. Tốt cho tim mạch, người ăn kiêng.",
      xuat_xu: "Điện Biên",
      trang_thai: "DANG_BAN",
      ma_danh_muc: dmGao.id,
      anh_san_pham: { create: [{ duong_dan_anh: "https://images.unsplash.com/photo-1614728263952-84ea256f9697?w=800", la_anh_chinh: true }] },
      chung_chi_san_pham: { create: [{ ten_chung_chi: "Hữu cơ" }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: "Túi 1kg", don_vi_tinh: "Túi", gia_ban: 55000, gia_goc: 44000, ma_sku: "GAOLUT-1KG" },
          { ten_bien_the: "Túi 5kg", don_vi_tinh: "Túi", gia_ban: 260000, gia_goc: 210000, ma_sku: "GAOLUT-5KG" },
        ]
      }
    }
  });

  // --- NẤM TƯƠI (dmNam) ---
  await prisma.san_pham.create({
    data: {
      ten_san_pham: "Nấm Đùi Gà Tươi Loại 1",
      mo_ta: "Nấm đùi gà (Pleurotus eryngii) trồng trong phòng sạch tại Lâm Đồng. Thân dày chắc, mũ dày, vị umami đậm. Thu hoạch hàng ngày lúc 5h sáng, giao trong ngày.",
      xuat_xu: "Đức Trọng, Lâm Đồng",
      trang_thai: "DANG_BAN",
      ma_danh_muc: dmNam.id,
      anh_san_pham: { create: [{ duong_dan_anh: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800", la_anh_chinh: true }] },
      chung_chi_san_pham: { create: [{ ten_chung_chi: "HACCP" }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: "Hộp 300g", don_vi_tinh: "Hộp", gia_ban: 48000, gia_goc: 38000, ma_sku: "NAMDG-300G" },
          { ten_bien_the: "Khay 1kg", don_vi_tinh: "Khay", gia_ban: 145000, gia_goc: 116000, ma_sku: "NAMDG-1KG" },
          { ten_bien_the: "Thùng 5kg", don_vi_tinh: "Thùng", gia_ban: 680000, gia_goc: 550000, ma_sku: "NAMDG-5KG" },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: "Nấm Linh Chi Đỏ Đà Lạt",
      mo_ta: "Nấm linh chi đỏ (Ganoderma lucidum) sấy khô tại Đà Lạt. Nụ nấm dày, bóng, màu nâu đỏ đặc trưng. Dùng hãm trà, nấu canh xương hoặc ngâm rượu bổ.",
      xuat_xu: "Đà Lạt, Lâm Đồng",
      trang_thai: "DANG_BAN",
      ma_danh_muc: dmNam.id,
      anh_san_pham: { create: [{ duong_dan_anh: "https://images.unsplash.com/photo-1547592180-85f173990554?w=800", la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: "Hộp 100g", don_vi_tinh: "Hộp", gia_ban: 185000, gia_goc: 150000, ma_sku: "NAMLC-100G" },
          { ten_bien_the: "Hộp 500g", don_vi_tinh: "Hộp", gia_ban: 880000, gia_goc: 720000, ma_sku: "NAMLC-500G" },
        ]
      }
    }
  });

  // --- GIA VỊ & MẬT ONG (dmGiaVi) ---
  await prisma.san_pham.create({
    data: {
      ten_san_pham: "Mật Ong Rừng Tràm Phú Quốc",
      mo_ta: "Mật ong rừng tràm từ đảo Phú Quốc — thu hoạch mỗi mùa hoa tràm (tháng 1–3). Màu vàng cánh gián trong suốt, vị ngọt thanh nhẹ hậu, thơm đặc trưng hoa tràm. Không pha trộn, không đun sôi.",
      xuat_xu: "Phú Quốc, Kiên Giang",
      trang_thai: "DANG_BAN",
      ma_danh_muc: dmGiaVi.id,
      anh_san_pham: { create: [{ duong_dan_anh: "https://images.unsplash.com/photo-1587049352847-4d4b126a3109?w=800", la_anh_chinh: true }] },
      chung_chi_san_pham: { create: [{ ten_chung_chi: "HACCP" }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: "Chai 380ml", don_vi_tinh: "Chai", gia_ban: 285000, gia_goc: 235000, ma_sku: "MATONG-380ML" },
          { ten_bien_the: "Chai 750ml", don_vi_tinh: "Chai", gia_ban: 520000, gia_goc: 430000, ma_sku: "MATONG-750ML" },
          { ten_bien_the: "Can 5 lít", don_vi_tinh: "Can", gia_ban: 3200000, gia_goc: 2700000, ma_sku: "MATONG-5L" },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: "Tiêu Đen Hạt Phú Quốc Loại 1",
      mo_ta: "Tiêu đen Phú Quốc thu hoạch khi quả còn xanh rồi phơi khô tự nhiên 10–15 ngày. Hạt đều, vỏ nhăn đặc trưng, cay nồng, thơm dầu tinh. Khác hoàn toàn tiêu thương mại thông thường.",
      xuat_xu: "Phú Quốc, Kiên Giang",
      trang_thai: "DANG_BAN",
      ma_danh_muc: dmGiaVi.id,
      anh_san_pham: { create: [{ duong_dan_anh: "https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=800", la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: "Túi 100g", don_vi_tinh: "Túi", gia_ban: 55000, gia_goc: 44000, ma_sku: "TIEU-100G" },
          { ten_bien_the: "Túi 500g", don_vi_tinh: "Túi", gia_ban: 245000, gia_goc: 198000, ma_sku: "TIEU-500G" },
          { ten_bien_the: "Túi 1kg", don_vi_tinh: "Túi", gia_ban: 465000, gia_goc: 380000, ma_sku: "TIEU-1KG" },
        ]
      }
    }
  });

  // --- HẠT & ĐẬU (dmHat) ---
  await prisma.san_pham.create({
    data: {
      ten_san_pham: "Đậu Đen Hữu Cơ Sơn La",
      mo_ta: "Đậu đen nhỏ hạt giống bản địa Sơn La, trồng hữu cơ trên nương cao. Vỏ đen bóng, ruột xanh, luộc nhanh mềm. Giàu anthocyanin, sắt, kẽm. Dùng nấu chè, xay sữa, đắp mặt.",
      xuat_xu: "Mộc Châu, Sơn La",
      trang_thai: "DANG_BAN",
      ma_danh_muc: dmHat.id,
      anh_san_pham: { create: [{ duong_dan_anh: "https://images.unsplash.com/photo-1515543904379-3d757abe528b?w=800", la_anh_chinh: true }] },
      chung_chi_san_pham: { create: [{ ten_chung_chi: "Hữu cơ" }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: "Túi 500g", don_vi_tinh: "Túi", gia_ban: 52000, gia_goc: 42000, ma_sku: "DAUДЕН-500G" },
          { ten_bien_the: "Túi 2kg", don_vi_tinh: "Túi", gia_ban: 192000, gia_goc: 156000, ma_sku: "DAUDÉN-2KG" },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: "Hạt Điều Rang Muối Bình Phước",
      mo_ta: "Hạt điều W240 Bình Phước — loại chọn lọc hạt to đều không vỡ. Rang muối biển vừa chín, không dầu công nghiệp. Giòn, béo, bùi. Bảo quản túi hút chân không.",
      xuat_xu: "Đồng Phú, Bình Phước",
      trang_thai: "DANG_BAN",
      ma_danh_muc: dmHat.id,
      anh_san_pham: { create: [{ duong_dan_anh: "https://images.unsplash.com/photo-1609501676725-7186f017a4b7?w=800", la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: "Túi 200g", don_vi_tinh: "Túi", gia_ban: 68000, gia_goc: 55000, ma_sku: "DIEU-200G" },
          { ten_bien_the: "Túi 500g", don_vi_tinh: "Túi", gia_ban: 155000, gia_goc: 125000, ma_sku: "DIEU-500G" },
          { ten_bien_the: "Túi 1kg", don_vi_tinh: "Túi", gia_ban: 295000, gia_goc: 240000, ma_sku: "DIEU-1KG" },
        ]
      }
    }
  });

  // --- TRÀ & HOA THẢO MỘC (dmTraHoa) ---
  await prisma.san_pham.create({
    data: {
      ten_san_pham: "Trà Nõn Tôm Thái Nguyên Thượng Hạng",
      mo_ta: "Trà nõn tôm (búp 1 tôm 2 lá) hái tay lúc sáng sớm trên đồi chè trăm tuổi ở Thái Nguyên. Lên xoắn đều, nước xanh vàng, vị ngọt hậu chát dịu, hương hoa nhài thoang thoảng tự nhiên.",
      xuat_xu: "Đồng Hỷ, Thái Nguyên",
      trang_thai: "DANG_BAN",
      ma_danh_muc: dmTraHoa.id,
      anh_san_pham: { create: [{ duong_dan_anh: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=800", la_anh_chinh: true }] },
      chung_chi_san_pham: { create: [{ ten_chung_chi: "VietGAP" }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: "Túi 100g", don_vi_tinh: "Túi", gia_ban: 120000, gia_goc: 96000, ma_sku: "TRA-100G" },
          { ten_bien_the: "Hộp 200g", don_vi_tinh: "Hộp", gia_ban: 225000, gia_goc: 182000, ma_sku: "TRA-200G" },
          { ten_bien_the: "Hộp quà 500g", don_vi_tinh: "Hộp", gia_ban: 520000, gia_goc: 425000, ma_sku: "TRA-500G-QUA" },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: "Hoa Cúc Vàng Sấy Khô Đà Lạt",
      mo_ta: "Hoa cúc vàng (chrysanthemum) trồng hữu cơ tại Đà Lạt, sấy lạnh giữ nguyên màu vàng rực và tinh dầu. Pha trà giảm căng thẳng, sáng mắt. Hương thơm nhẹ dịu.",
      xuat_xu: "Đà Lạt, Lâm Đồng",
      trang_thai: "DANG_BAN",
      ma_danh_muc: dmTraHoa.id,
      anh_san_pham: { create: [{ duong_dan_anh: "https://images.unsplash.com/photo-1455853659719-4b521eebc76d?w=800", la_anh_chinh: true }] },
      chung_chi_san_pham: { create: [{ ten_chung_chi: "Hữu cơ" }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: "Túi 50g", don_vi_tinh: "Túi", gia_ban: 65000, gia_goc: 52000, ma_sku: "HOACUC-50G" },
          { ten_bien_the: "Hộp 150g", don_vi_tinh: "Hộp", gia_ban: 175000, gia_goc: 142000, ma_sku: "HOACUC-150G" },
        ]
      }
    }
  });

  // ==========================================
  // 4. NGƯỜI DÙNG MẪU
  // ==========================================
  const user = await prisma.nguoi_dung.create({
    data: {
      email: "khachhang_vip@gmail.com",
      mat_khau: "123456789",
      ho_so_nguoi_dung: { create: { ho_ten: "Nguyễn Văn Freshy", so_dien_thoai: "0901234567" } },
      dia_chi_nguoi_dung: { create: { chi_tiet_dia_chi: "123 Đường Rau Sạch, Phường Xanh, Đà Nẵng", la_mac_dinh: true } }
    }
  });

  // ==========================================
  // 5. MÃ GIẢM GIÁ
  // ==========================================
  const km = await prisma.ma_giam_gia.create({
    data: {
      ma_code: "VERDANT2026",
      loai_giam_gia: "FIXED",
      gia_tri_giam: 30000,
      don_toi_thieu: 150000,
      ngay_bat_dau: new Date(),
      ngay_ket_thuc: new Date(2026, 11, 31)
    }
  });

  await prisma.ma_giam_gia.createMany({
    data: [
      { ma_code: "FREESHIP50", loai_giam_gia: "FIXED", gia_tri_giam: 20000, don_toi_thieu: 200000, ngay_bat_dau: new Date(), ngay_ket_thuc: new Date(2026, 5, 30) },
      { ma_code: "B2B10PCT", loai_giam_gia: "PERCENT", gia_tri_giam: 10, don_toi_thieu: 1000000, ngay_bat_dau: new Date(), ngay_ket_thuc: new Date(2026, 11, 31) },
      { ma_code: "SUMMER25", loai_giam_gia: "PERCENT", gia_tri_giam: 15, don_toi_thieu: 300000, ngay_bat_dau: new Date(), ngay_ket_thuc: new Date(2026, 7, 31) },
    ]
  });

  // ==========================================
  // 6. ĐƠN HÀNG MẪU
  // ==========================================
  const btDauTay = await prisma.bien_the_san_pham.findUnique({ where: { ma_sku: "DAUTAY-500G" } });
  const btGaoST25 = await prisma.bien_the_san_pham.findUnique({ where: { ma_sku: "ST25-5KG" } });

  if (btDauTay && btGaoST25) {
    const tien_hang = Number(btDauTay.gia_ban) * 2 + Number(btGaoST25.gia_ban) * 1;
    await prisma.don_hang.create({
      data: {
        ma_nguoi_dung: user.id,
        ma_khuyen_mai: km.id,
        tong_tien: tien_hang + 30000 - Number(km.gia_tri_giam),
        phi_van_chuyen: 30000,
        trang_thai: "DANG_GIAO_HANG",
        chi_tiet_don_hang: {
          create: [
            { ma_bien_the: btDauTay.id, so_luong: 2, don_gia: btDauTay.gia_ban },
            { ma_bien_the: btGaoST25.id, so_luong: 1, don_gia: btGaoST25.gia_ban },
          ]
        }
      }
    });
  }

  console.log("✅ TUYỆT VỜI! Dữ liệu sản phẩm đã được tạo thành công.");
  console.log("   - 8 danh mục nông sản");
  console.log("   - 5 nhà cung cấp");
  console.log("   - 20 sản phẩm với đầy đủ biến thể, ảnh, chứng chỉ");
  console.log("   - 4 mã giảm giá");
  console.log("   - 1 đơn hàng mẫu");

  console.log('🌱 Đang bắt đầu bơm (seed) dữ liệu cho Module Kho...');

  // ==========================================
  // MODULE KHO (giữ nguyên, chỉ dùng sản phẩm mới)
  // ==========================================
  const ncc = nccDaLat;

  // ==========================================
  // 2. TẠO KHO HÀNG & VỊ TRÍ
  // ==========================================
  const kho = await prisma.kho_hang.create({
    data: { ten_kho: 'Tổng Kho Đà Nẵng', dia_chi: 'Hòa Khánh, Liên Chiểu, Đà Nẵng' }
  });

  // Tạo nhiều vị trí kho
  const viTriA1 = await prisma.vi_tri_kho.create({ data: { ma_kho: kho.id, khu_vuc: 'Khu A', day: 'D1', ke: 'K1', tang: 'T1', suc_chua_toi_da: 100 }});
  const viTriA2 = await prisma.vi_tri_kho.create({ data: { ma_kho: kho.id, khu_vuc: 'Khu A', day: 'D1', ke: 'K2', tang: 'T1', suc_chua_toi_da: 100 }});
  const viTriA3 = await prisma.vi_tri_kho.create({ data: { ma_kho: kho.id, khu_vuc: 'Khu A', day: 'D2', ke: 'K1', tang: 'T1', suc_chua_toi_da: 100 }});
  const viTriB1 = await prisma.vi_tri_kho.create({ data: { ma_kho: kho.id, khu_vuc: 'Khu B', day: 'D1', ke: 'K1', tang: 'T1', suc_chua_toi_da: 100 }});
  const viTriB2 = await prisma.vi_tri_kho.create({ data: { ma_kho: kho.id, khu_vuc: 'Khu B', day: 'D2', ke: 'K1', tang: 'T1', suc_chua_toi_da: 100 }});
  const viTriC1 = await prisma.vi_tri_kho.create({ data: { ma_kho: kho.id, khu_vuc: 'Khu C', day: 'D1', ke: 'K1', tang: 'T1', suc_chua_toi_da: 100 }});

  // ==========================================
  // 3. LẤY BIEN_THE CỦA CÁC SẢN PHẨM ĐÃ SEED
  // ==========================================
  const skuMap: Record<string, any> = {};
  const skuList = [
    'RMUONG-300G', 'RMUONG-5KG',
    'KALE-200G', 'KALE-500G',
    'CACHUA-500G', 'CACHUA-5KG',
    'BROCCOLI-CY', 'BROCCOLI-1KG',
    'DAUTAY-250G', 'DAUTAY-500G',
    'XOAI-1KG', 'XOAI-5KG',
    'BO-1KG',
    'CHUOI-1KG',
    'ST25-2KG', 'ST25-5KG', 'ST25-25KG',
    'GAOLUT-1KG', 'GAOLUT-5KG',
  ];
  for (const sku of skuList) {
    const bt = await prisma.bien_the_san_pham.findUnique({ where: { ma_sku: sku } });
    if (bt) skuMap[sku] = bt;
  }

  // Helper: tạo lô hàng + ton_kho + QR
  async function taoLo(opts: {
    sku: string; nccId: number; viTri: any;
    soLuong: number; soKien: number;
    hsdDays: number; ten: string;
  }) {
    const bt = skuMap[opts.sku];
    if (!bt) return;
    const ts = Date.now() + Math.random() * 1000;
    const lo = await prisma.lo_hang.create({
      data: {
        ma_lo_hang: `LO-${opts.ten}-${Math.floor(ts)}`,
        ma_ncc: opts.nccId,
        ma_bien_the: bt.id,
        ngay_nhap_kho: new Date(),
        han_su_dung: new Date(Date.now() + opts.hsdDays * 24 * 60 * 60 * 1000),
      }
    });
    await prisma.ton_kho_tong.create({
      data: { ma_lo_hang: lo.id, ma_vi_tri: opts.viTri.id, so_luong: opts.soLuong }
    });
    for (let i = 1; i <= opts.soKien; i++) {
      await prisma.kien_hang_chi_tiet.create({
        data: { ma_lo_hang: lo.id, ma_vi_tri: opts.viTri.id, ma_vach_quet: `QR-${lo.ma_lo_hang}-${String(i).padStart(3,'0')}`, trang_thai: 'TRONG_KHO' }
      });
    }
    return lo;
  }

  // ==========================================
  // 4. TẠO LÔ HÀNG CHO NHIỀU SẢN PHẨM
  // ==========================================

  // Rau Muống — lô bình thường + lô sắp hết hạn
  const loRM1 = await taoLo({ sku:'RMUONG-300G', nccId:ncc.id, viTri:viTriA1, soLuong:80, soKien:5, hsdDays:30, ten:'RM1' });
  const loRM2 = await taoLo({ sku:'RMUONG-5KG',  nccId:ncc.id, viTri:viTriA1, soLuong:40, soKien:4, hsdDays:14, ten:'RM2' });
  // Lô cảnh báo (2 ngày)
  const loRMWarn = await taoLo({ sku:'RMUONG-300G', nccId:ncc.id, viTri:viTriB2, soLuong:25, soKien:3, hsdDays:2, ten:'RMWARN' });

  // Cải Kale
  await taoLo({ sku:'KALE-200G', nccId:ncc.id, viTri:viTriA2, soLuong:60, soKien:6, hsdDays:21, ten:'KALE1' });
  await taoLo({ sku:'KALE-500G', nccId:ncc.id, viTri:viTriA2, soLuong:35, soKien:4, hsdDays:15, ten:'KALE2' });

  // Cà Chua
  await taoLo({ sku:'CACHUA-500G', nccId:ncc.id, viTri:viTriA3, soLuong:90, soKien:8, hsdDays:10, ten:'CCH1' });
  await taoLo({ sku:'CACHUA-5KG',  nccId:ncc.id, viTri:viTriA3, soLuong:30, soKien:3, hsdDays:8,  ten:'CCH2' });

  // Dâu Tây — sắp hết (< 10)
  await taoLo({ sku:'DAUTAY-250G', nccId:ncc.id, viTri:viTriB1, soLuong:7, soKien:2, hsdDays:5, ten:'DT1' });

  // Xoài
  await taoLo({ sku:'XOAI-1KG', nccId:ncc.id, viTri:viTriB1, soLuong:50, soKien:5, hsdDays:20, ten:'XOAI1' });
  await taoLo({ sku:'XOAI-5KG', nccId:ncc.id, viTri:viTriC1, soLuong:20, soKien:2, hsdDays:18, ten:'XOAI2' });

  // Bơ
  await taoLo({ sku:'BO-1KG', nccId:ncc.id, viTri:viTriC1, soLuong:45, soKien:4, hsdDays:12, ten:'BO1' });

  // Chuối — sắp hết (< 10)
  await taoLo({ sku:'CHUOI-1KG', nccId:ncc.id, viTri:viTriB2, soLuong:8, soKien:2, hsdDays:7, ten:'CHUOI1' });

  // Gạo ST25
  await taoLo({ sku:'ST25-2KG',  nccId:ncc.id, viTri:viTriA1, soLuong:120, soKien:10, hsdDays:180, ten:'ST251' });
  await taoLo({ sku:'ST25-5KG',  nccId:ncc.id, viTri:viTriA2, soLuong:85,  soKien:8,  hsdDays:180, ten:'ST252' });
  await taoLo({ sku:'ST25-25KG', nccId:ncc.id, viTri:viTriA3, soLuong:30,  soKien:3,  hsdDays:180, ten:'ST253' });

  // Gạo Lứt
  await taoLo({ sku:'GAOLUT-1KG', nccId:ncc.id, viTri:viTriC1, soLuong:55, soKien:5, hsdDays:150, ten:'GL1' });
  await taoLo({ sku:'GAOLUT-5KG', nccId:ncc.id, viTri:viTriC1, soLuong:25, soKien:3, hsdDays:150, ten:'GL2' });

  // Tạo cảnh báo cho lô sắp hết hạn
  if (loRMWarn) {
    await prisma.canh_bao_lo_hang.create({
      data: { ma_lo_hang: loRMWarn.id, loai_canh_bao: 'CON_2_NGAY', da_xu_ly: false, so_ngay_con: 2 }
    });
  }

  // ==========================================
  // 5. TẠO LỊCH SỬ XUẤT KHO MẪU
  // ==========================================
  const phieuXuat = await prisma.phieu_xuat_kho.create({
    data: { ma_kho: kho.id, ly_do_xuat: 'Xuất giao hàng Winmart', trang_thai: 'HOAN_THANH' }
  });

  // kien_hang_da_xuat liên kết qua chi_tiet_phieu_xuat và kien_hang_chi_tiet
  // Bỏ qua phần này — cần có chi_tiet_phieu_xuat và kien_hang_chi_tiet trước

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

