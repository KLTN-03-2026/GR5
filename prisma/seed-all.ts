import * as dotenv from 'dotenv';
dotenv.config();

import prisma from '../src/lib/prisma';

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

async function main() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  console.log('═══════════════════════════════════════════════');
  console.log('  SEED DATA - Nông sản sạch Verdant');
  console.log('═══════════════════════════════════════════════\n');

  // ════════════════════════════════════════════════════════════
  // BƯỚC 1: DANH MỤC
  // ════════════════════════════════════════════════════════════
  const danhMucData = [
    { ten_danh_muc: 'Rau lá xanh' },
    { ten_danh_muc: 'Rau củ quả' },
    { ten_danh_muc: 'Rau ăn quả' },
    { ten_danh_muc: 'Rau thơm & gia vị' },
    { ten_danh_muc: 'Trái cây nhiệt đới' },
    { ten_danh_muc: 'Nấm tươi' },
    { ten_danh_muc: 'Nông sản Đà Lạt' },
    { ten_danh_muc: 'Rau hữu cơ' },
  ];

  const categories = [];
  for (const dm of danhMucData) {
    const created = await prisma.danh_muc.create({ data: dm });
    categories.push(created);
  }
  console.log(`✅ Đã tạo ${categories.length} danh mục`);

  const [dmRauLa, dmRauCu, dmRauAnQua, dmRauThom, dmTraiCay, dmNam, dmDaLat, dmHuuCo] = categories;

  // ════════════════════════════════════════════════════════════
  // BƯỚC 2: NHÀ CUNG CẤP
  // ════════════════════════════════════════════════════════════
  const nccData = [
    { ten_ncc: 'HTX Rau sạch Đà Lạt', ma_ncc: 'NCC001', dia_chi: 'Phường 8, TP. Đà Lạt, Lâm Đồng', so_dien_thoai: '0263388001', email: 'dalat@rausach.vn', tinh_thanh: 'Lâm Đồng', diem_uy_tin: 4.8, trang_thai: 'DANG_HOP_TAC' as const, loai_ncc: 'HTX' },
    { ten_ncc: 'Trang trại hữu cơ Sơn La', ma_ncc: 'NCC002', dia_chi: 'Xã Chiềng Mung, Mai Sơn, Sơn La', so_dien_thoai: '0212366002', email: 'sonla@huuco.vn', tinh_thanh: 'Sơn La', diem_uy_tin: 4.5, trang_thai: 'DANG_HOP_TAC' as const, loai_ncc: 'TRANG_TRAI' },
    { ten_ncc: 'Vườn rau VietGAP Củ Chi', ma_ncc: 'NCC003', dia_chi: 'Xã Tân Phú Trung, Củ Chi, TP.HCM', so_dien_thoai: '0283877003', email: 'cuchi@vietgap.vn', tinh_thanh: 'TP.HCM', diem_uy_tin: 4.7, trang_thai: 'DANG_HOP_TAC' as const, loai_ncc: 'HTX' },
    { ten_ncc: 'Nấm sạch Thanh Hóa', ma_ncc: 'NCC004', dia_chi: 'Xã Đông Lĩnh, TP. Thanh Hóa', so_dien_thoai: '0237366004', email: 'thanhhoa@namsach.vn', tinh_thanh: 'Thanh Hóa', diem_uy_tin: 4.3, trang_thai: 'DANG_HOP_TAC' as const, loai_ncc: 'TRANG_TRAI' },
    { ten_ncc: 'Trang trại Trái cây Tiền Giang', ma_ncc: 'NCC005', dia_chi: 'Xã Hữu Đạo, Châu Thành, Tiền Giang', so_dien_thoai: '0273388005', email: 'tiengiang@traicay.vn', tinh_thanh: 'Tiền Giang', diem_uy_tin: 4.6, trang_thai: 'DANG_HOP_TAC' as const, loai_ncc: 'TRANG_TRAI' },
    { ten_ncc: 'HTX Nông nghiệp Gia Lai', ma_ncc: 'NCC006', dia_chi: 'Xã Ia Sao, Ia Grai, Gia Lai', so_dien_thoai: '0269377006', email: 'gialai@nongnghiep.vn', tinh_thanh: 'Gia Lai', diem_uy_tin: 4.4, trang_thai: 'DANG_HOP_TAC' as const, loai_ncc: 'HTX' },
    { ten_ncc: 'Vườn Đà Lạt Organic', ma_ncc: 'NCC007', dia_chi: 'Phường 7, TP. Đà Lạt, Lâm Đồng', so_dien_thoai: '0263399007', email: 'organic@dalatfarm.vn', tinh_thanh: 'Lâm Đồng', diem_uy_tin: 4.9, trang_thai: 'DANG_HOP_TAC' as const, loai_ncc: 'TRANG_TRAI' },
    { ten_ncc: 'HTX Rau Gia vị Ninh Thuận', ma_ncc: 'NCC008', dia_chi: 'Xã Phước Hữu, Ninh Phước, Ninh Thuận', so_dien_thoai: '0259366008', email: 'ninhthua@giavi.vn', tinh_thanh: 'Ninh Thuận', diem_uy_tin: 4.2, trang_thai: 'DANG_HOP_TAC' as const, loai_ncc: 'HTX' },
  ];

  const suppliers = [];
  for (const ncc of nccData) {
    const created = await prisma.nha_cung_cap.create({ data: ncc });
    suppliers.push(created);
  }
  console.log(`✅ Đã tạo ${suppliers.length} nhà cung cấp`);

  const [nccDaLat, nccSonLa, nccCuChi, nccNam, nccTraiCay, nccGiaLai, nccOrganic, nccGiaVi] = suppliers;

  // Mapping: NCC → danh mục cung cấp
  const nccCategoryMap: Record<number, number[]> = {
    [nccDaLat.id]: [dmDaLat.id],
    [nccSonLa.id]: [dmRauLa.id],
    [nccCuChi.id]: [dmRauCu.id, dmRauAnQua.id],
    [nccNam.id]: [dmNam.id],
    [nccTraiCay.id]: [dmTraiCay.id],
    [nccGiaLai.id]: [dmTraiCay.id],
    [nccOrganic.id]: [dmHuuCo.id],
    [nccGiaVi.id]: [dmRauThom.id],
  };

  // ════════════════════════════════════════════════════════════
  // BƯỚC 3: SẢN PHẨM (40 sản phẩm, 5/danh mục)
  // ════════════════════════════════════════════════════════════
  interface SPInput {
    ten_san_pham: string;
    mo_ta: string;
    xuat_xu: string;
    ma_danh_muc: number;
    nccId: number;
    sku: string;
    ten_bien_the: string;
    don_vi_tinh: string;
    gia_ban: number;
    gia_goc: number;
    stock: number;
    anh: string;
  }

  const sanPhamAll: SPInput[] = [
    // === Rau lá xanh (NCC Sơn La) ===
    { ten_san_pham: 'Rau muống hữu cơ', mo_ta: 'Rau muống trồng hữu cơ, không thuốc trừ sâu. Lá xanh mướt, giòn ngọt.', xuat_xu: 'Sơn La', ma_danh_muc: dmRauLa.id, nccId: nccSonLa.id, sku: 'RAUMUONG-BO', ten_bien_the: '1 bó (300g)', don_vi_tinh: 'bó', gia_ban: 12000, gia_goc: 15000, stock: 60, anh: 'https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=500' },
    { ten_san_pham: 'Cải bó xôi baby', mo_ta: 'Cải bó xôi non, lá nhỏ mềm. Giàu sắt, thích hợp salad hoặc xào.', xuat_xu: 'Sơn La', ma_danh_muc: dmRauLa.id, nccId: nccSonLa.id, sku: 'BOXOI-GOI', ten_bien_the: 'Gói 200g', don_vi_tinh: 'gói', gia_ban: 25000, gia_goc: 30000, stock: 45, anh: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500' },
    { ten_san_pham: 'Xà lách lô lô xanh', mo_ta: 'Xà lách lô lô lá xoăn, giòn ngọt. Trồng trong nhà kính.', xuat_xu: 'Sơn La', ma_danh_muc: dmRauLa.id, nccId: nccSonLa.id, sku: 'XALACH-BO', ten_bien_the: '1 bó (250g)', don_vi_tinh: 'bó', gia_ban: 18000, gia_goc: 22000, stock: 50, anh: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=500' },
    { ten_san_pham: 'Rau mồng tơi', mo_ta: 'Mồng tơi xanh mướt, lá dày. Nấu canh ngon, thanh mát.', xuat_xu: 'Sơn La', ma_danh_muc: dmRauLa.id, nccId: nccSonLa.id, sku: 'MONGTOI-BO', ten_bien_the: '1 bó (300g)', don_vi_tinh: 'bó', gia_ban: 10000, gia_goc: 12000, stock: 70, anh: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500' },
    { ten_san_pham: 'Cải ngọt VietGAP', mo_ta: 'Cải ngọt trồng theo tiêu chuẩn VietGAP. Lá mỏng, ngọt thanh.', xuat_xu: 'Sơn La', ma_danh_muc: dmRauLa.id, nccId: nccSonLa.id, sku: 'CAINGOT-BO', ten_bien_the: '1 bó (300g)', don_vi_tinh: 'bó', gia_ban: 8000, gia_goc: 10000, stock: 80, anh: 'https://images.unsplash.com/photo-1518977676601-b28d4c5b7964?w=500' },

    // === Rau củ quả (NCC Củ Chi) ===
    { ten_san_pham: 'Cà rốt Đà Lạt loại 1', mo_ta: 'Cà rốt tươi từ Đà Lạt, củ thẳng đều. Vị ngọt tự nhiên, giàu vitamin A.', xuat_xu: 'Lâm Đồng', ma_danh_muc: dmRauCu.id, nccId: nccCuChi.id, sku: 'CAROT-KG', ten_bien_the: '1 kg', don_vi_tinh: 'kg', gia_ban: 25000, gia_goc: 32000, stock: 55, anh: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500' },
    { ten_san_pham: 'Khoai tây Đà Lạt', mo_ta: 'Khoai tây vỏ vàng, ruột chắc. Chiên giòn, nấu canh đều ngon.', xuat_xu: 'Lâm Đồng', ma_danh_muc: dmRauCu.id, nccId: nccCuChi.id, sku: 'KHOAITAY-KG', ten_bien_the: '1 kg', don_vi_tinh: 'kg', gia_ban: 28000, gia_goc: 35000, stock: 65, anh: 'https://images.unsplash.com/photo-1518977676601-b28d4c5b7964?w=500' },
    { ten_san_pham: 'Củ cải trắng hữu cơ', mo_ta: 'Củ cải trắng giòn, không xơ. Trồng hữu cơ không hóa chất.', xuat_xu: 'TP.HCM', ma_danh_muc: dmRauCu.id, nccId: nccCuChi.id, sku: 'CUCAI-KG', ten_bien_the: '1 kg', don_vi_tinh: 'kg', gia_ban: 18000, gia_goc: 22000, stock: 40, anh: 'https://images.unsplash.com/photo-1582515073490-39981397c445?w=500' },
    { ten_san_pham: 'Khoai lang mật Nhật', mo_ta: 'Khoai lang ruột vàng, vị ngọt mật. Nướng hoặc hấp đều tuyệt.', xuat_xu: 'TP.HCM', ma_danh_muc: dmRauCu.id, nccId: nccCuChi.id, sku: 'KHOAILANG-KG', ten_bien_the: '1 kg', don_vi_tinh: 'kg', gia_ban: 35000, gia_goc: 42000, stock: 50, anh: 'https://images.unsplash.com/photo-1596097635092-6cf0e7e4f1ac?w=500' },
    { ten_san_pham: 'Củ dền đỏ tươi', mo_ta: 'Củ dền đỏ tươi, giàu chất chống oxy hóa. Ép nước hoặc nấu soup.', xuat_xu: 'TP.HCM', ma_danh_muc: dmRauCu.id, nccId: nccCuChi.id, sku: 'CUDEN-KG', ten_bien_the: '1 kg', don_vi_tinh: 'kg', gia_ban: 30000, gia_goc: 38000, stock: 35, anh: 'https://images.unsplash.com/photo-1593105544559-ecb03bf76f82?w=500' },

    // === Rau ăn quả (NCC Củ Chi) ===
    { ten_san_pham: 'Cà chua beef steak', mo_ta: 'Cà chua beef steak ruột đỏ đặc, ít hạt. Thích hợp salad, sandwich.', xuat_xu: 'TP.HCM', ma_danh_muc: dmRauAnQua.id, nccId: nccCuChi.id, sku: 'CACHUA-KG', ten_bien_the: '1 kg', don_vi_tinh: 'kg', gia_ban: 35000, gia_goc: 42000, stock: 45, anh: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=500' },
    { ten_san_pham: 'Dưa leo baby', mo_ta: 'Dưa leo baby giòn ngọt, vỏ mỏng. Ăn sống hoặc làm salad.', xuat_xu: 'TP.HCM', ma_danh_muc: dmRauAnQua.id, nccId: nccCuChi.id, sku: 'DUALEO-KG', ten_bien_the: '1 kg', don_vi_tinh: 'kg', gia_ban: 22000, gia_goc: 28000, stock: 55, anh: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=500' },
    { ten_san_pham: 'Ớt chuông 3 màu', mo_ta: 'Ớt chuông đỏ-vàng-xanh tươi giòn. Xào, salad, nướng đều ngon.', xuat_xu: 'Lâm Đồng', ma_danh_muc: dmRauAnQua.id, nccId: nccCuChi.id, sku: 'OTCHUONG-KG', ten_bien_the: '1 kg', don_vi_tinh: 'kg', gia_ban: 65000, gia_goc: 78000, stock: 30, anh: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=500' },
    { ten_san_pham: 'Bí ngòi xanh non', mo_ta: 'Bí ngòi non, vỏ xanh mềm. Xào tỏi hoặc nướng BBQ.', xuat_xu: 'TP.HCM', ma_danh_muc: dmRauAnQua.id, nccId: nccCuChi.id, sku: 'BINGOI-KG', ten_bien_the: '1 kg', don_vi_tinh: 'kg', gia_ban: 28000, gia_goc: 35000, stock: 40, anh: 'https://images.unsplash.com/photo-1563252722-6434563a985d?w=500' },
    { ten_san_pham: 'Đậu bắp Nhật', mo_ta: 'Đậu bắp Nhật quả nhỏ, ít nhớt. Luộc chấm mắm hoặc xào.', xuat_xu: 'TP.HCM', ma_danh_muc: dmRauAnQua.id, nccId: nccCuChi.id, sku: 'DAUBAP-KG', ten_bien_the: '1 kg', don_vi_tinh: 'kg', gia_ban: 32000, gia_goc: 40000, stock: 35, anh: 'https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?w=500' },

    // === Rau thơm & gia vị (NCC Gia vị Ninh Thuận) ===
    { ten_san_pham: 'Húng quế tươi', mo_ta: 'Húng quế lá to, thơm nồng. Ăn kèm phở, bún hoặc làm pesto.', xuat_xu: 'Ninh Thuận', ma_danh_muc: dmRauThom.id, nccId: nccGiaVi.id, sku: 'HUNGQUE-BO', ten_bien_the: '1 bó (100g)', don_vi_tinh: 'bó', gia_ban: 8000, gia_goc: 10000, stock: 60, anh: 'https://images.unsplash.com/photo-1618164435735-413d3b066c9a?w=500' },
    { ten_san_pham: 'Ngò rí (rau mùi)', mo_ta: 'Ngò rí tươi xanh, thơm đặc trưng. Rắc lên canh, phở, cháo.', xuat_xu: 'Ninh Thuận', ma_danh_muc: dmRauThom.id, nccId: nccGiaVi.id, sku: 'NGORI-BO', ten_bien_the: '1 bó (100g)', don_vi_tinh: 'bó', gia_ban: 6000, gia_goc: 8000, stock: 70, anh: 'https://images.unsplash.com/photo-1592928302636-c83cf1e1c887?w=500' },
    { ten_san_pham: 'Sả cây tươi', mo_ta: 'Sả cây tươi, thân trắng chắc. Dùng nấu lẩu, kho cá, pha trà.', xuat_xu: 'Ninh Thuận', ma_danh_muc: dmRauThom.id, nccId: nccGiaVi.id, sku: 'SA-BO', ten_bien_the: '1 bó (5 cây)', don_vi_tinh: 'bó', gia_ban: 10000, gia_goc: 12000, stock: 55, anh: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=500' },
    { ten_san_pham: 'Lá chanh tươi', mo_ta: 'Lá chanh non, thơm nhẹ. Thái chỉ ăn kèm gà luộc, gỏi.', xuat_xu: 'Ninh Thuận', ma_danh_muc: dmRauThom.id, nccId: nccGiaVi.id, sku: 'LACHANH-GOI', ten_bien_the: 'Gói 50g', don_vi_tinh: 'gói', gia_ban: 5000, gia_goc: 7000, stock: 65, anh: 'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=500' },
    { ten_san_pham: 'Gừng tươi Đắk Lắk', mo_ta: 'Gừng tươi vị cay nồng. Pha trà gừng, nấu ăn, làm gia vị.', xuat_xu: 'Đắk Lắk', ma_danh_muc: dmRauThom.id, nccId: nccGiaVi.id, sku: 'GUNG-KG', ten_bien_the: '500g', don_vi_tinh: 'gói', gia_ban: 25000, gia_goc: 30000, stock: 40, anh: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=500' },

    // === Trái cây nhiệt đới (NCC Trái cây Tiền Giang + Gia Lai) ===
    { ten_san_pham: 'Xoài cát Hòa Lộc', mo_ta: 'Xoài cát Hòa Lộc chín cây, thịt vàng đậm, ngọt thanh không xơ.', xuat_xu: 'Tiền Giang', ma_danh_muc: dmTraiCay.id, nccId: nccTraiCay.id, sku: 'XOAI-KG', ten_bien_the: '1 kg', don_vi_tinh: 'kg', gia_ban: 85000, gia_goc: 100000, stock: 40, anh: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=500' },
    { ten_san_pham: 'Thanh long ruột đỏ', mo_ta: 'Thanh long ruột đỏ Bình Thuận, vị ngọt dịu, giàu vitamin C.', xuat_xu: 'Bình Thuận', ma_danh_muc: dmTraiCay.id, nccId: nccTraiCay.id, sku: 'THANHLONG-KG', ten_bien_the: '1 kg', don_vi_tinh: 'kg', gia_ban: 45000, gia_goc: 55000, stock: 50, anh: 'https://images.unsplash.com/photo-1527325678964-54921661f888?w=500' },
    { ten_san_pham: 'Bưởi da xanh Bến Tre', mo_ta: 'Bưởi da xanh ruột hồng, tép to mọng nước. Không hạt.', xuat_xu: 'Bến Tre', ma_danh_muc: dmTraiCay.id, nccId: nccTraiCay.id, sku: 'BUOI-TRAI', ten_bien_the: '1 trái (1.2-1.5kg)', don_vi_tinh: 'trái', gia_ban: 55000, gia_goc: 65000, stock: 35, anh: 'https://images.unsplash.com/photo-1577234286642-fc512a5f8f11?w=500' },
    { ten_san_pham: 'Sầu riêng Ri6', mo_ta: 'Sầu riêng Ri6 cơm vàng, béo ngậy. Trái 2-3kg.', xuat_xu: 'Tiền Giang', ma_danh_muc: dmTraiCay.id, nccId: nccTraiCay.id, sku: 'SAURIENG-KG', ten_bien_the: '1 kg', don_vi_tinh: 'kg', gia_ban: 150000, gia_goc: 180000, stock: 25, anh: 'https://images.unsplash.com/photo-1588165171080-c89acfa5ee83?w=500' },
    { ten_san_pham: 'Chôm chôm Java', mo_ta: 'Chôm chôm Java quả to, tách hạt dễ. Vị ngọt thanh.', xuat_xu: 'Gia Lai', ma_danh_muc: dmTraiCay.id, nccId: nccGiaLai.id, sku: 'CHOMCHOM-KG', ten_bien_the: '1 kg', don_vi_tinh: 'kg', gia_ban: 40000, gia_goc: 50000, stock: 45, anh: 'https://images.unsplash.com/photo-1609842947197-a5765013be4d?w=500' },

    // === Nấm tươi (NCC Nấm Thanh Hóa) ===
    { ten_san_pham: 'Nấm rơm tươi', mo_ta: 'Nấm rơm tươi thu hoạch sáng. Xào, nấu canh, lẩu đều ngon.', xuat_xu: 'Thanh Hóa', ma_danh_muc: dmNam.id, nccId: nccNam.id, sku: 'NAMROM-GOI', ten_bien_the: 'Hộp 300g', don_vi_tinh: 'hộp', gia_ban: 35000, gia_goc: 42000, stock: 30, anh: 'https://images.unsplash.com/photo-1504545102780-26774c1bb073?w=500' },
    { ten_san_pham: 'Nấm đùi gà', mo_ta: 'Nấm đùi gà thân trắng chắc, vị ngọt thanh. Nướng, xào, soup.', xuat_xu: 'Thanh Hóa', ma_danh_muc: dmNam.id, nccId: nccNam.id, sku: 'NAMDUIGA-GOI', ten_bien_the: 'Hộp 300g', don_vi_tinh: 'hộp', gia_ban: 45000, gia_goc: 55000, stock: 25, anh: 'https://images.unsplash.com/photo-1552825897-bb2e5870b95b?w=500' },
    { ten_san_pham: 'Nấm kim châm Hàn Quốc', mo_ta: 'Nấm kim châm trắng muốt, dài mảnh. Lẩu, xào bơ, nướng.', xuat_xu: 'Thanh Hóa', ma_danh_muc: dmNam.id, nccId: nccNam.id, sku: 'NAMKIM-GOI', ten_bien_the: 'Gói 200g', don_vi_tinh: 'gói', gia_ban: 20000, gia_goc: 25000, stock: 40, anh: 'https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?w=500' },
    { ten_san_pham: 'Nấm bào ngư xám', mo_ta: 'Nấm bào ngư xám dai giòn, vị đậm. Xào thịt, nấu lẩu nấm.', xuat_xu: 'Thanh Hóa', ma_danh_muc: dmNam.id, nccId: nccNam.id, sku: 'NAMBAONIU-GOI', ten_bien_the: 'Hộp 300g', don_vi_tinh: 'hộp', gia_ban: 30000, gia_goc: 38000, stock: 35, anh: 'https://images.unsplash.com/photo-1590165482129-1b8b27698780?w=500' },
    { ten_san_pham: 'Nấm hương khô', mo_ta: 'Nấm hương khô thơm đậm. Ngâm nước rồi nấu canh, kho, xào.', xuat_xu: 'Thanh Hóa', ma_danh_muc: dmNam.id, nccId: nccNam.id, sku: 'NAMHUONG-GOI', ten_bien_the: 'Gói 100g', don_vi_tinh: 'gói', gia_ban: 55000, gia_goc: 65000, stock: 50, anh: 'https://images.unsplash.com/photo-1543062093-1a6a4e6e1424?w=500' },

    // === Nông sản Đà Lạt (NCC HTX Rau sạch Đà Lạt) ===
    { ten_san_pham: 'Dâu tây Đà Lạt', mo_ta: 'Dâu tây hái tay từ vườn Đà Lạt. Quả mọng, vị chua ngọt hài hòa.', xuat_xu: 'Lâm Đồng', ma_danh_muc: dmDaLat.id, nccId: nccDaLat.id, sku: 'DAUTAY-HOP', ten_bien_the: 'Hộp 300g', don_vi_tinh: 'hộp', gia_ban: 75000, gia_goc: 90000, stock: 30, anh: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500' },
    { ten_san_pham: 'Atiso tươi Đà Lạt', mo_ta: 'Atiso tươi bông to, cánh dày. Hầm gà, nấu canh thanh nhiệt.', xuat_xu: 'Lâm Đồng', ma_danh_muc: dmDaLat.id, nccId: nccDaLat.id, sku: 'ATISO-KG', ten_bien_the: '1 kg', don_vi_tinh: 'kg', gia_ban: 60000, gia_goc: 72000, stock: 25, anh: 'https://images.unsplash.com/photo-1580870069867-74c57ee1bb07?w=500' },
    { ten_san_pham: 'Bắp cải tím Đà Lạt', mo_ta: 'Bắp cải tím ruột chặt, giàu anthocyanin. Salad, muối chua.', xuat_xu: 'Lâm Đồng', ma_danh_muc: dmDaLat.id, nccId: nccDaLat.id, sku: 'BAPCAITIM-KG', ten_bien_the: '1 kg', don_vi_tinh: 'kg', gia_ban: 30000, gia_goc: 38000, stock: 40, anh: 'https://images.unsplash.com/photo-1594282486756-576bf57b7805?w=500' },
    { ten_san_pham: 'Bông cải xanh Đà Lạt', mo_ta: 'Bông cải xanh (broccoli) bông chặt, xanh đậm. Luộc, xào, hấp.', xuat_xu: 'Lâm Đồng', ma_danh_muc: dmDaLat.id, nccId: nccDaLat.id, sku: 'BROCOLI-KG', ten_bien_the: '1 kg', don_vi_tinh: 'kg', gia_ban: 45000, gia_goc: 55000, stock: 35, anh: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=500' },
    { ten_san_pham: 'Su su Đà Lạt non', mo_ta: 'Su su non quả nhỏ, vỏ mỏng không gai. Xào tỏi, nấu canh.', xuat_xu: 'Lâm Đồng', ma_danh_muc: dmDaLat.id, nccId: nccDaLat.id, sku: 'SUSU-KG', ten_bien_the: '1 kg', don_vi_tinh: 'kg', gia_ban: 20000, gia_goc: 25000, stock: 50, anh: 'https://images.unsplash.com/photo-1518977676601-b28d4c5b7964?w=500' },

    // === Rau hữu cơ (NCC Vườn Đà Lạt Organic) ===
    { ten_san_pham: 'Cải kale hữu cơ', mo_ta: 'Cải kale Đà Lạt trồng organic. Giàu vitamin K, ép juice hoặc salad.', xuat_xu: 'Lâm Đồng', ma_danh_muc: dmHuuCo.id, nccId: nccOrganic.id, sku: 'KALE-GOI', ten_bien_the: 'Gói 200g', don_vi_tinh: 'gói', gia_ban: 35000, gia_goc: 42000, stock: 30, anh: 'https://images.unsplash.com/photo-1524179091875-bf99a9a6af57?w=500' },
    { ten_san_pham: 'Rau rocket (arugula)', mo_ta: 'Rau rocket vị cay nhẹ, đắng thanh. Salad, pizza, pasta.', xuat_xu: 'Lâm Đồng', ma_danh_muc: dmHuuCo.id, nccId: nccOrganic.id, sku: 'ROCKET-GOI', ten_bien_the: 'Gói 150g', don_vi_tinh: 'gói', gia_ban: 30000, gia_goc: 38000, stock: 25, anh: 'https://images.unsplash.com/photo-1556801712-76c8eb07bbc9?w=500' },
    { ten_san_pham: 'Cà chua cherry organic', mo_ta: 'Cà chua cherry đỏ mọng, ngọt tự nhiên. Ăn trực tiếp hoặc salad.', xuat_xu: 'Lâm Đồng', ma_danh_muc: dmHuuCo.id, nccId: nccOrganic.id, sku: 'CHERRY-HOP', ten_bien_the: 'Hộp 300g', don_vi_tinh: 'hộp', gia_ban: 40000, gia_goc: 48000, stock: 35, anh: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500' },
    { ten_san_pham: 'Rau má hữu cơ', mo_ta: 'Rau má organic, lá nhỏ xanh mướt. Xay sinh tố giải nhiệt.', xuat_xu: 'Lâm Đồng', ma_danh_muc: dmHuuCo.id, nccId: nccOrganic.id, sku: 'RAUMA-BO', ten_bien_the: '1 bó (200g)', don_vi_tinh: 'bó', gia_ban: 15000, gia_goc: 18000, stock: 45, anh: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500' },
    { ten_san_pham: 'Măng tây xanh organic', mo_ta: 'Măng tây xanh non, giòn ngọt. Xào bơ tỏi, nướng, hấp.', xuat_xu: 'Lâm Đồng', ma_danh_muc: dmHuuCo.id, nccId: nccOrganic.id, sku: 'MANGTAY-BO', ten_bien_the: '1 bó (200g)', don_vi_tinh: 'bó', gia_ban: 50000, gia_goc: 60000, stock: 20, anh: 'https://images.unsplash.com/photo-1515471209610-dae1c92d8777?w=500' },
  ];

  const productIds: number[] = [];
  const bienTheIds: number[] = [];

  for (const sp of sanPhamAll) {
    const product = await prisma.san_pham.create({
      data: {
        ten_san_pham: sp.ten_san_pham,
        mo_ta: sp.mo_ta,
        xuat_xu: sp.xuat_xu,
        ma_danh_muc: sp.ma_danh_muc,
        trang_thai: 'DANG_BAN',
      },
    });

    await prisma.anh_san_pham.create({
      data: { ma_san_pham: product.id, duong_dan_anh: sp.anh, la_anh_chinh: true },
    });

    const bienThe = await prisma.bien_the_san_pham.create({
      data: {
        ma_san_pham: product.id,
        ma_sku: sp.sku,
        ten_bien_the: sp.ten_bien_the,
        don_vi_tinh: sp.don_vi_tinh,
        gia_ban: sp.gia_ban,
        gia_goc: sp.gia_goc,
      },
    });

    await prisma.ncc_san_pham.create({
      data: {
        ma_ncc: sp.nccId,
        ma_san_pham: product.id,
        gia_nhap_gan_nhat: Math.round(sp.gia_ban * 0.6),
        don_vi_tinh: sp.don_vi_tinh,
      },
    });

    productIds.push(product.id);
    bienTheIds.push(bienThe.id);
  }

  console.log(`✅ Đã tạo ${productIds.length} sản phẩm + biến thể + ảnh + liên kết NCC`);

  // ════════════════════════════════════════════════════════════
  // BƯỚC 4: KHO HÀNG (Khu A, B, C, Lạnh)
  // ════════════════════════════════════════════════════════════
  let kho = await prisma.kho_hang.findFirst({ where: { ten_kho: { contains: 'HCM' } } });
  if (!kho) {
    kho = await prisma.kho_hang.create({
      data: { ten_kho: 'Kho trung tâm HCM', dia_chi: 'Lô A5, KCN Tân Bình, Q. Tân Phú, TP.HCM' },
    });
  }

  const khuConfigs = [
    { khu: 'A', days: 4, kes: 3, tangs: 2, sucChua: 200, ghiChu: 'Rau lá xanh & Rau thơm - thông thoáng, quạt gió' },
    { khu: 'B', days: 4, kes: 3, tangs: 2, sucChua: 250, ghiChu: 'Rau củ quả & Rau ăn quả - kệ chịu tải' },
    { khu: 'C', days: 4, kes: 3, tangs: 2, sucChua: 200, ghiChu: 'Trái cây, Nấm, Nông sản Đà Lạt' },
    { khu: 'Lạnh', days: 3, kes: 3, tangs: 2, sucChua: 150, ghiChu: 'Nhiệt độ 2-8°C - Rau hữu cơ' },
  ];

  const viTriByKhu: Record<string, number[]> = {};

  for (const cfg of khuConfigs) {
    const positions: any[] = [];
    for (let d = 1; d <= cfg.days; d++) {
      for (let k = 1; k <= cfg.kes; k++) {
        for (let t = 1; t <= cfg.tangs; t++) {
          positions.push({
            ma_kho: kho.id,
            khu_vuc: cfg.khu,
            day: 'D' + d,
            ke: 'K' + k,
            tang: 'T' + t,
            suc_chua_toi_da: cfg.sucChua,
            ghi_chu: cfg.ghiChu,
          });
        }
      }
    }
    await prisma.vi_tri_kho.createMany({ data: positions });
    const created = await prisma.vi_tri_kho.findMany({ where: { ma_kho: kho.id, khu_vuc: cfg.khu }, select: { id: true } });
    viTriByKhu[cfg.khu] = created.map(v => v.id);
  }

  const totalViTri = Object.values(viTriByKhu).reduce((s, arr) => s + arr.length, 0);
  console.log(`✅ Đã tạo ${totalViTri} vị trí kho (A:${viTriByKhu['A'].length} B:${viTriByKhu['B'].length} C:${viTriByKhu['C'].length} Lạnh:${viTriByKhu['Lạnh'].length})`);

  // ════════════════════════════════════════════════════════════
  // BƯỚC 5: TỒN KHO (Lô hàng + ton_kho_tong)
  // ════════════════════════════════════════════════════════════
  // Mapping danh mục → khu vực + HSD
  const khuMapping: Record<number, { khu: string; hsd: number }> = {
    [dmRauLa.id]: { khu: 'A', hsd: 3 },
    [dmRauThom.id]: { khu: 'A', hsd: 5 },
    [dmRauCu.id]: { khu: 'B', hsd: 7 },
    [dmRauAnQua.id]: { khu: 'B', hsd: 5 },
    [dmTraiCay.id]: { khu: 'C', hsd: 5 },
    [dmNam.id]: { khu: 'C', hsd: 3 },
    [dmDaLat.id]: { khu: 'C', hsd: 7 },
    [dmHuuCo.id]: { khu: 'Lạnh', hsd: 5 },
  };

  let loCount = 0;
  for (let i = 0; i < sanPhamAll.length; i++) {
    const sp = sanPhamAll[i];
    const bienTheId = bienTheIds[i];
    const mapping = khuMapping[sp.ma_danh_muc];
    if (!mapping) continue;

    const viTriList = viTriByKhu[mapping.khu];
    const viTriId = viTriList[i % viTriList.length];

    const lo = await prisma.lo_hang.create({
      data: {
        ma_lo_hang: `LO-${sp.sku}`,
        ma_bien_the: bienTheId,
        ma_ncc: sp.nccId,
        ngay_thu_hoach: addDays(today, -2),
        han_su_dung: addDays(today, mapping.hsd),
        ngay_nhap_kho: addDays(today, -1),
        trang_thai: 'BINH_THUONG',
      },
    });

    await prisma.ton_kho_tong.create({
      data: {
        ma_lo_hang: lo.id,
        ma_vi_tri: viTriId,
        so_luong: sp.stock,
      },
    });

    loCount++;
  }

  console.log(`✅ Đã tạo ${loCount} lô hàng + tồn kho`);

  // ════════════════════════════════════════════════════════════
  // BƯỚC 6: VERIFY
  // ════════════════════════════════════════════════════════════
  const countDM = await prisma.danh_muc.count();
  const countSP = await prisma.san_pham.count();
  const countBT = await prisma.bien_the_san_pham.count();
  const countNCC = await prisma.nha_cung_cap.count();
  const countLo = await prisma.lo_hang.count();
  const countTon = await prisma.ton_kho_tong.count();
  const countVT = await prisma.vi_tri_kho.count();

  console.log('\n═══════════════════════════════════════════════');
  console.log('  TỔNG KẾT');
  console.log('═══════════════════════════════════════════════');
  console.log(`  Danh mục:        ${countDM}`);
  console.log(`  Nhà cung cấp:    ${countNCC}`);
  console.log(`  Sản phẩm:        ${countSP}`);
  console.log(`  Biến thể:        ${countBT}`);
  console.log(`  Vị trí kho:      ${countVT}`);
  console.log(`  Lô hàng:         ${countLo}`);
  console.log(`  Tồn kho:         ${countTon}`);
  console.log('═══════════════════════════════════════════════\n');

  // Verify khu vực
  const tonAll = await prisma.ton_kho_tong.findMany({ include: { lo_hang: true } });
  const byKhu: Record<string, { loHang: number; tongSL: number }> = {};
  for (const t of tonAll) {
    const vtId = t.ma_vi_tri!;
    let khu = '?';
    for (const [k, ids] of Object.entries(viTriByKhu)) {
      if (ids.includes(vtId)) { khu = k; break; }
    }
    if (!byKhu[khu]) byKhu[khu] = { loHang: 0, tongSL: 0 };
    byKhu[khu].loHang++;
    byKhu[khu].tongSL += t.so_luong || 0;
  }

  console.log('  Phân bổ kho:');
  for (const [khu, data] of Object.entries(byKhu)) {
    console.log(`    Khu ${khu}: ${data.loHang} lô, ${data.tongSL} sp`);
  }
  console.log('\n✅ SEED HOÀN THÀNH!');
}

main()
  .catch((e) => { console.error('❌ Lỗi:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
