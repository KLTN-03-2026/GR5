/**
 * Seed 100 san pham cho danh muc 6-10 (20 san pham moi danh muc)
 * Chay: npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed-products-2.ts
 */

import prisma from '../src/lib/prisma';

export async function seedProducts2(categoryIds: any) {
  console.log('Seeding products for categories 6-10...');

  // Category 6 - Gia vi tuoi
  const giaViTuoi = [
    {
      ten: 'Ớt',
      mo_ta: 'Ớt tươi cay nồng, được trồng tại vùng đất Tây Nguyên. Phù hợp để chế biến các món ăn cay.',
      xuat_xu: 'Gia Lai',
      anh: '1532336414038-cf19250c5757',
      sku: 'GVT-OT',
      bien_the: [
        { ten: 'Gói 100g', don_vi: 'goi', gia: 15000, gia_goc: 20000, sku_suffix: '100G' },
        { ten: 'Gói 500g', don_vi: 'goi', gia: 60000, gia_goc: 75000, sku_suffix: '500G' },
      ],
    },
    {
      ten: 'Sả',
      mo_ta: 'Sả tươi thơm nồng, trồng hữu cơ không thuốc trừ sâu. Dùng để nấu ăn và pha trà.',
      xuat_xu: 'Bình Dương',
      anh: '1596040033229-a9821ebd058d',
      sku: 'GVT-SA',
      bien_the: [
        { ten: 'Bó 200g', don_vi: 'bo', gia: 10000, gia_goc: 15000, sku_suffix: '200G' },
        { ten: 'Bó 500g', don_vi: 'bo', gia: 22000, gia_goc: 30000, sku_suffix: '500G' },
      ],
    },
    {
      ten: 'Gừng',
      mo_ta: 'Gừng tươi vị cay ấm, giúp làm ấm cơ thể. Thích hợp nấu ăn và pha trà gừng.',
      xuat_xu: 'Hưng Yên',
      anh: '1615485500704-8e990f9900f7',
      sku: 'GVT-GUNG',
      bien_the: [
        { ten: 'Gói 200g', don_vi: 'goi', gia: 12000, gia_goc: 18000, sku_suffix: '200G' },
        { ten: 'Gói 1kg', don_vi: 'goi', gia: 50000, gia_goc: 65000, sku_suffix: '1KG' },
      ],
    },
    {
      ten: 'Nghệ',
      mo_ta: 'Nghệ tươi giàu curcumin, tốt cho sức khỏe. Được thu hoạch từ vùng đất đỏ bazan.',
      xuat_xu: 'Đắk Lắk',
      anh: '1532336414038-cf19250c5757',
      sku: 'GVT-NGHE',
      bien_the: [
        { ten: 'Gói 200g', don_vi: 'goi', gia: 15000, gia_goc: 20000, sku_suffix: '200G' },
        { ten: 'Gói 1kg', don_vi: 'goi', gia: 60000, gia_goc: 80000, sku_suffix: '1KG' },
      ],
    },
    {
      ten: 'Riềng',
      mo_ta: 'Riềng tươi thơm đặc trưng, gia vị không thể thiếu cho món bún riêu, bún thang.',
      xuat_xu: 'Hải Dương',
      anh: '1596040033229-a9821ebd058d',
      sku: 'GVT-RIENG',
      bien_the: [
        { ten: 'Gói 200g', don_vi: 'goi', gia: 10000, gia_goc: 15000, sku_suffix: '200G' },
        { ten: 'Gói 500g', don_vi: 'goi', gia: 22000, gia_goc: 30000, sku_suffix: '500G' },
      ],
    },
    {
      ten: 'Tỏi',
      mo_ta: 'Tỏi ta củ nhỏ, vị cay thơm đậm đà. Trồng theo phương pháp truyền thống tại Lý Sơn.',
      xuat_xu: 'Lý Sơn, Quảng Ngãi',
      anh: '1615485500704-8e990f9900f7',
      sku: 'GVT-TOI',
      bien_the: [
        { ten: 'Gói 200g', don_vi: 'goi', gia: 35000, gia_goc: 45000, sku_suffix: '200G' },
        { ten: 'Gói 500g', don_vi: 'goi', gia: 80000, gia_goc: 100000, sku_suffix: '500G' },
      ],
    },
    {
      ten: 'Hành tím',
      mo_ta: 'Hành tím Sóc Trăng, củ chắc thơm nồng. Dùng phi hành, làm mắm, nấu canh.',
      xuat_xu: 'Sóc Trăng',
      anh: '1532336414038-cf19250c5757',
      sku: 'GVT-HTIM',
      bien_the: [
        { ten: 'Gói 300g', don_vi: 'goi', gia: 18000, gia_goc: 25000, sku_suffix: '300G' },
        { ten: 'Gói 1kg', don_vi: 'goi', gia: 50000, gia_goc: 65000, sku_suffix: '1KG' },
      ],
    },
    {
      ten: 'Hành lá',
      mo_ta: 'Hành lá tươi xanh mướt, thơm nhẹ. Dùng trang trí món ăn và nấu canh.',
      xuat_xu: 'Đà Lạt',
      anh: '1596040033229-a9821ebd058d',
      sku: 'GVT-HLA',
      bien_the: [
        { ten: 'Bó 100g', don_vi: 'bo', gia: 8000, gia_goc: 12000, sku_suffix: '100G' },
        { ten: 'Bó 300g', don_vi: 'bo', gia: 20000, gia_goc: 28000, sku_suffix: '300G' },
      ],
    },
    {
      ten: 'Ngò rí',
      mo_ta: 'Ngò rí (rau mùi) tươi thơm đặc trưng, không thể thiếu cho các món phở, bún.',
      xuat_xu: 'Đà Lạt',
      anh: '1615485500704-8e990f9900f7',
      sku: 'GVT-NGORI',
      bien_the: [
        { ten: 'Bó 100g', don_vi: 'bo', gia: 8000, gia_goc: 12000, sku_suffix: '100G' },
        { ten: 'Bó 300g', don_vi: 'bo', gia: 18000, gia_goc: 25000, sku_suffix: '300G' },
      ],
    },
    {
      ten: 'Rau răm',
      mo_ta: 'Rau răm tươi lá xanh đậm, vị cay nhẹ. Ăn kèm trứng vịt lộn, hột vịt lộn.',
      xuat_xu: 'Long An',
      anh: '1532336414038-cf19250c5757',
      sku: 'GVT-RAURAM',
      bien_the: [
        { ten: 'Bó 100g', don_vi: 'bo', gia: 7000, gia_goc: 10000, sku_suffix: '100G' },
        { ten: 'Bó 300g', don_vi: 'bo', gia: 16000, gia_goc: 22000, sku_suffix: '300G' },
      ],
    },
    {
      ten: 'Lá chanh',
      mo_ta: 'Lá chanh tươi thơm nức mũi, dùng để kho cá, nướng gà. Trồng tự nhiên.',
      xuat_xu: 'Bến Tre',
      anh: '1596040033229-a9821ebd058d',
      sku: 'GVT-LACHANH',
      bien_the: [
        { ten: 'Gói 50g', don_vi: 'goi', gia: 5000, gia_goc: 8000, sku_suffix: '50G' },
        { ten: 'Gói 150g', don_vi: 'goi', gia: 12000, gia_goc: 18000, sku_suffix: '150G' },
      ],
    },
    {
      ten: 'Lá quế',
      mo_ta: 'Lá quế tươi thơm ấm, gia vị quen thuộc trong món phở và nước hầm xương.',
      xuat_xu: 'Yên Bái',
      anh: '1615485500704-8e990f9900f7',
      sku: 'GVT-LAQUE',
      bien_the: [
        { ten: 'Gói 50g', don_vi: 'goi', gia: 8000, gia_goc: 12000, sku_suffix: '50G' },
        { ten: 'Gói 200g', don_vi: 'goi', gia: 25000, gia_goc: 35000, sku_suffix: '200G' },
      ],
    },
    {
      ten: 'Lá mắc mật',
      mo_ta: 'Lá mắc mật đặc sản Lạng Sơn, thơm đặc trưng. Dùng nướng thịt, gói nem.',
      xuat_xu: 'Lạng Sơn',
      anh: '1532336414038-cf19250c5757',
      sku: 'GVT-MACMAT',
      bien_the: [
        { ten: 'Gói 100g', don_vi: 'goi', gia: 20000, gia_goc: 28000, sku_suffix: '100G' },
        { ten: 'Gói 300g', don_vi: 'goi', gia: 50000, gia_goc: 65000, sku_suffix: '300G' },
      ],
    },
    {
      ten: 'Tiêu xanh',
      mo_ta: 'Tiêu xanh tươi cay nồng, thơm đặc biệt. Dùng xào hải sản, nấu lẩu.',
      xuat_xu: 'Phú Quốc',
      anh: '1596040033229-a9821ebd058d',
      sku: 'GVT-TIEUXANH',
      bien_the: [
        { ten: 'Gói 100g', don_vi: 'goi', gia: 25000, gia_goc: 35000, sku_suffix: '100G' },
        { ten: 'Gói 300g', don_vi: 'goi', gia: 65000, gia_goc: 85000, sku_suffix: '300G' },
      ],
    },
    {
      ten: 'Ớt chuông',
      mo_ta: 'Ớt chuông nhiều màu sắc, giòn ngọt. Thích hợp xào, salad và trang trí món ăn.',
      xuat_xu: 'Đà Lạt',
      anh: '1615485500704-8e990f9900f7',
      sku: 'GVT-OTCHUONG',
      bien_the: [
        { ten: 'Gói 200g', don_vi: 'goi', gia: 20000, gia_goc: 28000, sku_suffix: '200G' },
        { ten: 'Gói 500g', don_vi: 'goi', gia: 45000, gia_goc: 60000, sku_suffix: '500G' },
      ],
    },
    {
      ten: 'Chanh',
      mo_ta: 'Chanh tươi nhiều nước, vị chua thanh. Dùng pha nước uống, làm gia vị.',
      xuat_xu: 'Bến Tre',
      anh: '1532336414038-cf19250c5757',
      sku: 'GVT-CHANH',
      bien_the: [
        { ten: 'Túi 500g', don_vi: 'tui', gia: 15000, gia_goc: 20000, sku_suffix: '500G' },
        { ten: 'Túi 1kg', don_vi: 'tui', gia: 25000, gia_goc: 35000, sku_suffix: '1KG' },
      ],
    },
    {
      ten: 'Tắc',
      mo_ta: 'Tắc (quất) tươi vị chua ngọt, giàu vitamin C. Pha nước tắc mật ong rất ngon.',
      xuat_xu: 'Tiền Giang',
      anh: '1596040033229-a9821ebd058d',
      sku: 'GVT-TAC',
      bien_the: [
        { ten: 'Túi 300g', don_vi: 'tui', gia: 12000, gia_goc: 18000, sku_suffix: '300G' },
        { ten: 'Túi 1kg', don_vi: 'tui', gia: 30000, gia_goc: 40000, sku_suffix: '1KG' },
      ],
    },
    {
      ten: 'Hẹ',
      mo_ta: 'Hẹ tươi lá xanh dài, vị ngọt nhẹ. Dùng xào trứng, nấu canh, làm bánh xèo.',
      xuat_xu: 'Củ Chi, TP.HCM',
      anh: '1615485500704-8e990f9900f7',
      sku: 'GVT-HE',
      bien_the: [
        { ten: 'Bó 100g', don_vi: 'bo', gia: 7000, gia_goc: 10000, sku_suffix: '100G' },
        { ten: 'Bó 300g', don_vi: 'bo', gia: 16000, gia_goc: 22000, sku_suffix: '300G' },
      ],
    },
    {
      ten: 'Ngò gai',
      mo_ta: 'Ngò gai lá dài có răng cưa, thơm đậm hơn ngò rí. Không thể thiếu trong lẩu Thái.',
      xuat_xu: 'Đà Lạt',
      anh: '1532336414038-cf19250c5757',
      sku: 'GVT-NGOGAI',
      bien_the: [
        { ten: 'Bó 100g', don_vi: 'bo', gia: 8000, gia_goc: 12000, sku_suffix: '100G' },
        { ten: 'Bó 300g', don_vi: 'bo', gia: 18000, gia_goc: 25000, sku_suffix: '300G' },
      ],
    },
    {
      ten: 'Húng lủi',
      mo_ta: 'Húng lủi (bạc hà) tươi thơm mát, dùng ăn kèm gỏi cuốn, nem nướng.',
      xuat_xu: 'Đà Lạt',
      anh: '1596040033229-a9821ebd058d',
      sku: 'GVT-HUNGLUI',
      bien_the: [
        { ten: 'Bó 100g', don_vi: 'bo', gia: 8000, gia_goc: 12000, sku_suffix: '100G' },
        { ten: 'Bó 300g', don_vi: 'bo', gia: 18000, gia_goc: 25000, sku_suffix: '300G' },
      ],
    },
  ];

  // Category 7 - Hat & dau
  const hatDau = [
    {
      ten: 'Đậu xanh',
      mo_ta: 'Đậu xanh nguyên hạt, hạt đều tròn mẩy. Dùng nấu chè, làm bánh, nấu xôi.',
      xuat_xu: 'Bình Thuận',
      anh: '1515543904379-3d757abe528b',
      sku: 'HD-DXANH',
      bien_the: [
        { ten: 'Gói 500g', don_vi: 'goi', gia: 35000, gia_goc: 45000, sku_suffix: '500G' },
        { ten: 'Gói 1kg', don_vi: 'goi', gia: 60000, gia_goc: 80000, sku_suffix: '1KG' },
      ],
    },
    {
      ten: 'Đậu đỏ',
      mo_ta: 'Đậu đỏ hạt to đều, bở mềm khi nấu. Thích hợp nấu chè, soup bổ dưỡng.',
      xuat_xu: 'Đắk Nông',
      anh: '1609501676725-7186f017a4b7',
      sku: 'HD-DDO',
      bien_the: [
        { ten: 'Gói 500g', don_vi: 'goi', gia: 38000, gia_goc: 48000, sku_suffix: '500G' },
        { ten: 'Gói 1kg', don_vi: 'goi', gia: 68000, gia_goc: 85000, sku_suffix: '1KG' },
      ],
    },
    {
      ten: 'Đậu đen',
      mo_ta: 'Đậu đen xanh lòng, hạt bóng đẹp. Nấu chè đậu đen giải nhiệt mùa hè.',
      xuat_xu: 'Quảng Ngãi',
      anh: '1563636619-e9143da7973b',
      sku: 'HD-DDEN',
      bien_the: [
        { ten: 'Gói 500g', don_vi: 'goi', gia: 32000, gia_goc: 42000, sku_suffix: '500G' },
        { ten: 'Gói 1kg', don_vi: 'goi', gia: 55000, gia_goc: 72000, sku_suffix: '1KG' },
      ],
    },
    {
      ten: 'Đậu trắng',
      mo_ta: 'Đậu trắng hạt lớn, bùi béo khi nấu. Dùng hầm xương, nấu soup dinh dưỡng.',
      xuat_xu: 'Lâm Đồng',
      anh: '1515543904379-3d757abe528b',
      sku: 'HD-DTRANG',
      bien_the: [
        { ten: 'Gói 500g', don_vi: 'goi', gia: 40000, gia_goc: 52000, sku_suffix: '500G' },
        { ten: 'Gói 1kg', don_vi: 'goi', gia: 72000, gia_goc: 90000, sku_suffix: '1KG' },
      ],
    },
    {
      ten: 'Đậu nành',
      mo_ta: 'Đậu nành hữu cơ, hạt vàng đều. Làm sữa đậu nành, đậu phụ, tương.',
      xuat_xu: 'Hà Giang',
      anh: '1609501676725-7186f017a4b7',
      sku: 'HD-DNANH',
      bien_the: [
        { ten: 'Gói 500g', don_vi: 'goi', gia: 28000, gia_goc: 38000, sku_suffix: '500G' },
        { ten: 'Gói 1kg', don_vi: 'goi', gia: 48000, gia_goc: 65000, sku_suffix: '1KG' },
      ],
    },
    {
      ten: 'Đậu Hà Lan',
      mo_ta: 'Đậu Hà Lan khô nguyên hạt, xanh đều. Nấu soup, hầm thịt rất ngon.',
      xuat_xu: 'Đà Lạt',
      anh: '1563636619-e9143da7973b',
      sku: 'HD-DHALAN',
      bien_the: [
        { ten: 'Gói 300g', don_vi: 'goi', gia: 35000, gia_goc: 45000, sku_suffix: '300G' },
        { ten: 'Gói 1kg', don_vi: 'goi', gia: 95000, gia_goc: 120000, sku_suffix: '1KG' },
      ],
    },
    {
      ten: 'Đậu phộng',
      mo_ta: 'Đậu phộng (lạc) hạt to, bùi béo. Rang muối, làm kẹo, nấu chè đều ngon.',
      xuat_xu: 'Tây Ninh',
      anh: '1515543904379-3d757abe528b',
      sku: 'HD-DPHONG',
      bien_the: [
        { ten: 'Gói 500g', don_vi: 'goi', gia: 30000, gia_goc: 40000, sku_suffix: '500G' },
        { ten: 'Gói 1kg', don_vi: 'goi', gia: 52000, gia_goc: 68000, sku_suffix: '1KG' },
      ],
    },
    {
      ten: 'Hạt điều',
      mo_ta: 'Hạt điều rang muối Bình Phước, bùi thơm béo ngậy. Ăn vặt lành mạnh.',
      xuat_xu: 'Bình Phước',
      anh: '1609501676725-7186f017a4b7',
      sku: 'HD-HDIEU',
      bien_the: [
        { ten: 'Hũ 250g', don_vi: 'hu', gia: 95000, gia_goc: 120000, sku_suffix: '250G' },
        { ten: 'Hũ 500g', don_vi: 'hu', gia: 175000, gia_goc: 220000, sku_suffix: '500G' },
      ],
    },
    {
      ten: 'Hạt óc chó',
      mo_ta: 'Hạt óc chó nhập khẩu, giàu omega-3. Tốt cho trí não và tim mạch.',
      xuat_xu: 'Sơn La',
      anh: '1563636619-e9143da7973b',
      sku: 'HD-HOCCHO',
      bien_the: [
        { ten: 'Gói 200g', don_vi: 'goi', gia: 120000, gia_goc: 150000, sku_suffix: '200G' },
        { ten: 'Gói 500g', don_vi: 'goi', gia: 280000, gia_goc: 350000, sku_suffix: '500G' },
      ],
    },
    {
      ten: 'Hạt mắc ca',
      mo_ta: 'Hạt mắc ca Đắk Lắk nứt vỏ, béo thơm. Giàu chất béo tốt, ăn vặt healthy.',
      xuat_xu: 'Đắk Lắk',
      anh: '1515543904379-3d757abe528b',
      sku: 'HD-MACCA',
      bien_the: [
        { ten: 'Gói 250g', don_vi: 'goi', gia: 130000, gia_goc: 160000, sku_suffix: '250G' },
        { ten: 'Gói 500g', don_vi: 'goi', gia: 240000, gia_goc: 300000, sku_suffix: '500G' },
      ],
    },
    {
      ten: 'Hạt hướng dương',
      mo_ta: 'Hạt hướng dương rang muối, giòn thơm. Ăn vặt phổ biến, giàu vitamin E.',
      xuat_xu: 'Đắk Lắk',
      anh: '1609501676725-7186f017a4b7',
      sku: 'HD-HDUONG',
      bien_the: [
        { ten: 'Gói 200g', don_vi: 'goi', gia: 25000, gia_goc: 35000, sku_suffix: '200G' },
        { ten: 'Gói 500g', don_vi: 'goi', gia: 55000, gia_goc: 72000, sku_suffix: '500G' },
      ],
    },
    {
      ten: 'Hạt bí',
      mo_ta: 'Hạt bí rang muối, vỏ mỏng dễ tách. Ăn vặt giòn tan, tốt cho sức khỏe.',
      xuat_xu: 'Bình Thuận',
      anh: '1563636619-e9143da7973b',
      sku: 'HD-HBI',
      bien_the: [
        { ten: 'Gói 200g', don_vi: 'goi', gia: 30000, gia_goc: 40000, sku_suffix: '200G' },
        { ten: 'Gói 500g', don_vi: 'goi', gia: 65000, gia_goc: 82000, sku_suffix: '500G' },
      ],
    },
    {
      ten: 'Hạt sen',
      mo_ta: 'Hạt sen Đồng Tháp tươi, bở mềm thơm. Nấu chè, hầm gà, nấu cháo dinh dưỡng.',
      xuat_xu: 'Đồng Tháp',
      anh: '1515543904379-3d757abe528b',
      sku: 'HD-HSEN',
      bien_the: [
        { ten: 'Gói 200g', don_vi: 'goi', gia: 45000, gia_goc: 58000, sku_suffix: '200G' },
        { ten: 'Gói 500g', don_vi: 'goi', gia: 100000, gia_goc: 130000, sku_suffix: '500G' },
      ],
    },
    {
      ten: 'Hạt chia',
      mo_ta: 'Hạt chia hữu cơ, giàu omega-3 và chất xơ. Ngâm nước uống hoặc trộn sữa chua.',
      xuat_xu: 'Gia Lai',
      anh: '1609501676725-7186f017a4b7',
      sku: 'HD-HCHIA',
      bien_the: [
        { ten: 'Gói 200g', don_vi: 'goi', gia: 65000, gia_goc: 82000, sku_suffix: '200G' },
        { ten: 'Gói 500g', don_vi: 'goi', gia: 145000, gia_goc: 180000, sku_suffix: '500G' },
      ],
    },
    {
      ten: 'Hạt lanh',
      mo_ta: 'Hạt lanh vàng giàu omega-3 và lignans. Tốt cho tim mạch và tiêu hóa.',
      xuat_xu: 'Lâm Đồng',
      anh: '1563636619-e9143da7973b',
      sku: 'HD-HLANH',
      bien_the: [
        { ten: 'Gói 200g', don_vi: 'goi', gia: 55000, gia_goc: 70000, sku_suffix: '200G' },
        { ten: 'Gói 500g', don_vi: 'goi', gia: 120000, gia_goc: 150000, sku_suffix: '500G' },
      ],
    },
    {
      ten: 'Hạt mè',
      mo_ta: 'Hạt mè (vừng) trắng rang chín, thơm bùi. Rắc lên bánh mì, làm chè mè đen.',
      xuat_xu: 'An Giang',
      anh: '1515543904379-3d757abe528b',
      sku: 'HD-HME',
      bien_the: [
        { ten: 'Gói 200g', don_vi: 'goi', gia: 22000, gia_goc: 30000, sku_suffix: '200G' },
        { ten: 'Gói 500g', don_vi: 'goi', gia: 48000, gia_goc: 62000, sku_suffix: '500G' },
      ],
    },
    {
      ten: 'Hạt quinoa',
      mo_ta: 'Hạt quinoa (diêm mạch) trắng, giàu protein thực vật. Thay thế cơm cho người ăn kiêng.',
      xuat_xu: 'Lâm Đồng',
      anh: '1609501676725-7186f017a4b7',
      sku: 'HD-QUINOA',
      bien_the: [
        { ten: 'Gói 300g', don_vi: 'goi', gia: 85000, gia_goc: 105000, sku_suffix: '300G' },
        { ten: 'Gói 500g', don_vi: 'goi', gia: 130000, gia_goc: 160000, sku_suffix: '500G' },
      ],
    },
    {
      ten: 'Hạnh nhân',
      mo_ta: 'Hạnh nhân rang bơ giòn thơm, giàu vitamin E. Ăn vặt lành mạnh mỗi ngày.',
      xuat_xu: 'Lâm Đồng',
      anh: '1563636619-e9143da7973b',
      sku: 'HD-HANHNHAN',
      bien_the: [
        { ten: 'Gói 250g', don_vi: 'goi', gia: 95000, gia_goc: 120000, sku_suffix: '250G' },
        { ten: 'Gói 500g', don_vi: 'goi', gia: 175000, gia_goc: 220000, sku_suffix: '500G' },
      ],
    },
    {
      ten: 'Hạt dẻ',
      mo_ta: 'Hạt dẻ Trùng Khánh nướng thơm bùi, vỏ mỏng dễ bóc. Đặc sản Cao Bằng.',
      xuat_xu: 'Cao Bằng',
      anh: '1515543904379-3d757abe528b',
      sku: 'HD-HDE',
      bien_the: [
        { ten: 'Gói 300g', don_vi: 'goi', gia: 80000, gia_goc: 100000, sku_suffix: '300G' },
        { ten: 'Gói 500g', don_vi: 'goi', gia: 125000, gia_goc: 155000, sku_suffix: '500G' },
      ],
    },
    {
      ten: 'Hạt kê',
      mo_ta: 'Hạt kê vàng nguyên hạt, giàu sắt và magie. Nấu cháo dinh dưỡng cho bé.',
      xuat_xu: 'Hà Giang',
      anh: '1609501676725-7186f017a4b7',
      sku: 'HD-HKE',
      bien_the: [
        { ten: 'Gói 300g', don_vi: 'goi', gia: 35000, gia_goc: 45000, sku_suffix: '300G' },
        { ten: 'Gói 1kg', don_vi: 'goi', gia: 95000, gia_goc: 120000, sku_suffix: '1KG' },
      ],
    },
  ];

  // Category 8 - Tra & hoa thao moc
  const traHoa = [
    {
      ten: 'Trà xanh',
      mo_ta: 'Trà xanh Thái Nguyên búp non, hương thơm thanh mát. Trà truyền thống Việt Nam.',
      xuat_xu: 'Thái Nguyên',
      anh: '1597481499750-3e6b22637e12',
      sku: 'TRA-XANH',
      bien_the: [
        { ten: 'Gói 100g', don_vi: 'goi', gia: 60000, gia_goc: 75000, sku_suffix: '100G' },
        { ten: 'Gói 250g', don_vi: 'goi', gia: 135000, gia_goc: 170000, sku_suffix: '250G' },
      ],
    },
    {
      ten: 'Trà đen',
      mo_ta: 'Trà đen lên men hoàn toàn, vị đậm đà. Uống nóng hoặc pha trà sữa đều ngon.',
      xuat_xu: 'Lâm Đồng',
      anh: '1556679343-c7306c1976bc',
      sku: 'TRA-DEN',
      bien_the: [
        { ten: 'Gói 100g', don_vi: 'goi', gia: 55000, gia_goc: 70000, sku_suffix: '100G' },
        { ten: 'Gói 250g', don_vi: 'goi', gia: 125000, gia_goc: 155000, sku_suffix: '250G' },
      ],
    },
    {
      ten: 'Trà ô long',
      mo_ta: 'Trà ô long Đà Lạt, lên men bán phần. Hương thơm hoa quả, vị ngọt hậu.',
      xuat_xu: 'Đà Lạt',
      anh: '1544787219-7f47ccb76574',
      sku: 'TRA-OLONG',
      bien_the: [
        { ten: 'Gói 100g', don_vi: 'goi', gia: 85000, gia_goc: 105000, sku_suffix: '100G' },
        { ten: 'Gói 250g', don_vi: 'goi', gia: 190000, gia_goc: 240000, sku_suffix: '250G' },
      ],
    },
    {
      ten: 'Trà sen',
      mo_ta: 'Trà sen Tây Hồ ướp hương sen tự nhiên. Thưởng trà thanh nhã, hương sen dịu dàng.',
      xuat_xu: 'Hà Nội',
      anh: '1597481499750-3e6b22637e12',
      sku: 'TRA-SEN',
      bien_the: [
        { ten: 'Hộp 100g', don_vi: 'hop', gia: 150000, gia_goc: 190000, sku_suffix: '100G' },
        { ten: 'Hộp 250g', don_vi: 'hop', gia: 350000, gia_goc: 430000, sku_suffix: '250G' },
      ],
    },
    {
      ten: 'Trà lài',
      mo_ta: 'Trà lài (nhài) hương hoa nhẹ nhàng, vị trà thanh. Thích hợp uống buổi chiều.',
      xuat_xu: 'Thái Nguyên',
      anh: '1556679343-c7306c1976bc',
      sku: 'TRA-LAI',
      bien_the: [
        { ten: 'Gói 100g', don_vi: 'goi', gia: 65000, gia_goc: 82000, sku_suffix: '100G' },
        { ten: 'Gói 250g', don_vi: 'goi', gia: 145000, gia_goc: 180000, sku_suffix: '250G' },
      ],
    },
    {
      ten: 'Trà atiso',
      mo_ta: 'Trà atiso Đà Lạt, thanh nhiệt giải độc gan. Vị ngọt dịu tự nhiên, tốt cho sức khỏe.',
      xuat_xu: 'Đà Lạt',
      anh: '1544787219-7f47ccb76574',
      sku: 'TRA-ATISO',
      bien_the: [
        { ten: 'Hộp 100g', don_vi: 'hop', gia: 55000, gia_goc: 70000, sku_suffix: '100G' },
        { ten: 'Hộp 250g', don_vi: 'hop', gia: 120000, gia_goc: 150000, sku_suffix: '250G' },
      ],
    },
    {
      ten: 'Trà hoa cúc',
      mo_ta: 'Trà hoa cúc khô nguyên bông, giúp an thần, ngủ ngon. Hương thơm dịu nhẹ.',
      xuat_xu: 'Hưng Yên',
      anh: '1597481499750-3e6b22637e12',
      sku: 'TRA-HCUC',
      bien_the: [
        { ten: 'Hộp 50g', don_vi: 'hop', gia: 45000, gia_goc: 58000, sku_suffix: '50G' },
        { ten: 'Hộp 150g', don_vi: 'hop', gia: 120000, gia_goc: 150000, sku_suffix: '150G' },
      ],
    },
    {
      ten: 'Trà hoa hồng',
      mo_ta: 'Trà hoa hồng sấy khô, đẹp da, giảm stress. Pha trà thơm ngát hương hoa hồng.',
      xuat_xu: 'Sapa, Lào Cai',
      anh: '1556679343-c7306c1976bc',
      sku: 'TRA-HHONG',
      bien_the: [
        { ten: 'Hộp 50g', don_vi: 'hop', gia: 65000, gia_goc: 82000, sku_suffix: '50G' },
        { ten: 'Hộp 150g', don_vi: 'hop', gia: 170000, gia_goc: 210000, sku_suffix: '150G' },
      ],
    },
    {
      ten: 'Trà gừng',
      mo_ta: 'Trà gừng tự nhiên, giúp làm ấm cơ thể, giảm đau bụng. Vị cay ấm đặc trưng.',
      xuat_xu: 'Hưng Yên',
      anh: '1544787219-7f47ccb76574',
      sku: 'TRA-GUNG',
      bien_the: [
        { ten: 'Hộp 100g', don_vi: 'hop', gia: 40000, gia_goc: 52000, sku_suffix: '100G' },
        { ten: 'Hộp 250g', don_vi: 'hop', gia: 85000, gia_goc: 108000, sku_suffix: '250G' },
      ],
    },
    {
      ten: 'Trà sả',
      mo_ta: 'Trà sả chanh thảo mộc, thanh mát giải nhiệt. Uống nóng hoặc lạnh đều ngon.',
      xuat_xu: 'Bình Dương',
      anh: '1597481499750-3e6b22637e12',
      sku: 'TRA-SA',
      bien_the: [
        { ten: 'Hộp 100g', don_vi: 'hop', gia: 35000, gia_goc: 45000, sku_suffix: '100G' },
        { ten: 'Hộp 250g', don_vi: 'hop', gia: 75000, gia_goc: 95000, sku_suffix: '250G' },
      ],
    },
    {
      ten: 'Trà bạc hà',
      mo_ta: 'Trà bạc hà khô thơm mát, giúp tiêu hóa tốt. Pha trà giải khát mùa hè.',
      xuat_xu: 'Đà Lạt',
      anh: '1556679343-c7306c1976bc',
      sku: 'TRA-BACHA',
      bien_the: [
        { ten: 'Hộp 50g', don_vi: 'hop', gia: 35000, gia_goc: 45000, sku_suffix: '50G' },
        { ten: 'Hộp 150g', don_vi: 'hop', gia: 85000, gia_goc: 108000, sku_suffix: '150G' },
      ],
    },
    {
      ten: 'Trà kỷ tử',
      mo_ta: 'Trà kỷ tử đỏ, bổ mắt, tăng cường miễn dịch. Pha trà hoặc ngâm rượu.',
      xuat_xu: 'Hà Giang',
      anh: '1544787219-7f47ccb76574',
      sku: 'TRA-KYTU',
      bien_the: [
        { ten: 'Gói 100g', don_vi: 'goi', gia: 75000, gia_goc: 95000, sku_suffix: '100G' },
        { ten: 'Gói 250g', don_vi: 'goi', gia: 170000, gia_goc: 210000, sku_suffix: '250G' },
      ],
    },
    {
      ten: 'Trà cam thảo',
      mo_ta: 'Trà cam thảo ngọt tự nhiên, giúp thanh nhiệt, giảm ho. Vị ngọt dịu không đường.',
      xuat_xu: 'Lạng Sơn',
      anh: '1597481499750-3e6b22637e12',
      sku: 'TRA-CAMTHAO',
      bien_the: [
        { ten: 'Hộp 100g', don_vi: 'hop', gia: 45000, gia_goc: 58000, sku_suffix: '100G' },
        { ten: 'Hộp 250g', don_vi: 'hop', gia: 100000, gia_goc: 125000, sku_suffix: '250G' },
      ],
    },
    {
      ten: 'Trà tim sen',
      mo_ta: 'Trà tim sen Huế, an thần, dễ ngủ. Tim sen sấy khô giữ nguyên dược tính.',
      xuat_xu: 'Huế',
      anh: '1556679343-c7306c1976bc',
      sku: 'TRA-TIMSEN',
      bien_the: [
        { ten: 'Hộp 50g', don_vi: 'hop', gia: 55000, gia_goc: 70000, sku_suffix: '50G' },
        { ten: 'Hộp 150g', don_vi: 'hop', gia: 140000, gia_goc: 175000, sku_suffix: '150G' },
      ],
    },
    {
      ten: 'Trà hoa đậu biếc',
      mo_ta: 'Trà hoa đậu biếc màu xanh tím tự nhiên, giàu chất chống oxy hóa. Đẹp mắt và tốt cho sức khỏe.',
      xuat_xu: 'An Giang',
      anh: '1544787219-7f47ccb76574',
      sku: 'TRA-DAUBIEC',
      bien_the: [
        { ten: 'Hộp 50g', don_vi: 'hop', gia: 50000, gia_goc: 65000, sku_suffix: '50G' },
        { ten: 'Hộp 150g', don_vi: 'hop', gia: 130000, gia_goc: 160000, sku_suffix: '150G' },
      ],
    },
    {
      ten: 'Trà mãng cầu',
      mo_ta: 'Trà lá mãng cầu xiêm, hỗ trợ giấc ngủ và sức khỏe. Vị nhẹ dễ uống.',
      xuat_xu: 'Tây Ninh',
      anh: '1597481499750-3e6b22637e12',
      sku: 'TRA-MANGCAU',
      bien_the: [
        { ten: 'Hộp 100g', don_vi: 'hop', gia: 40000, gia_goc: 52000, sku_suffix: '100G' },
        { ten: 'Hộp 250g', don_vi: 'hop', gia: 90000, gia_goc: 112000, sku_suffix: '250G' },
      ],
    },
    {
      ten: 'Trà vối',
      mo_ta: 'Trà vối lá tươi sấy khô, giải nhiệt mùa hè. Hương vị dân dã truyền thống miền Bắc.',
      xuat_xu: 'Hà Nam',
      anh: '1556679343-c7306c1976bc',
      sku: 'TRA-VOI',
      bien_the: [
        { ten: 'Gói 100g', don_vi: 'goi', gia: 25000, gia_goc: 35000, sku_suffix: '100G' },
        { ten: 'Gói 300g', don_vi: 'goi', gia: 60000, gia_goc: 78000, sku_suffix: '300G' },
      ],
    },
    {
      ten: 'Trà diếp cá',
      mo_ta: 'Trà diếp cá khô, thanh nhiệt giải độc, tốt cho da. Phù hợp uống hàng ngày.',
      xuat_xu: 'Long An',
      anh: '1544787219-7f47ccb76574',
      sku: 'TRA-DIEPCA',
      bien_the: [
        { ten: 'Hộp 100g', don_vi: 'hop', gia: 30000, gia_goc: 40000, sku_suffix: '100G' },
        { ten: 'Hộp 250g', don_vi: 'hop', gia: 65000, gia_goc: 82000, sku_suffix: '250G' },
      ],
    },
    {
      ten: 'Trà khổ qua',
      mo_ta: 'Trà khổ qua (mướp đắng) rừng, hạ đường huyết. Vị đắng thanh, tốt cho người tiểu đường.',
      xuat_xu: 'Bình Thuận',
      anh: '1597481499750-3e6b22637e12',
      sku: 'TRA-KHOQUA',
      bien_the: [
        { ten: 'Hộp 100g', don_vi: 'hop', gia: 35000, gia_goc: 45000, sku_suffix: '100G' },
        { ten: 'Hộp 250g', don_vi: 'hop', gia: 75000, gia_goc: 95000, sku_suffix: '250G' },
      ],
    },
    {
      ten: 'Trà linh chi',
      mo_ta: 'Trà linh chi đỏ, tăng cường miễn dịch và sức đề kháng. Nấm linh chi thái lát sấy khô.',
      xuat_xu: 'Đà Lạt',
      anh: '1556679343-c7306c1976bc',
      sku: 'TRA-LINHCHI',
      bien_the: [
        { ten: 'Hộp 100g', don_vi: 'hop', gia: 120000, gia_goc: 150000, sku_suffix: '100G' },
        { ten: 'Hộp 250g', don_vi: 'hop', gia: 270000, gia_goc: 340000, sku_suffix: '250G' },
      ],
    },
  ];

  // Category 9 - Mat ong & san pham ong
  const matOng = [
    {
      ten: 'Mật ong hoa cà phê',
      mo_ta: 'Mật ong hoa cà phê nguyên chất, vị ngọt đậm đà hương cà phê. Thu hoạch từ vùng Tây Nguyên.',
      xuat_xu: 'Đắk Lắk',
      anh: '1587049352847-4d4b126a3109',
      sku: 'MO-CAPHE',
      bien_the: [
        { ten: 'Chai 250ml', don_vi: 'chai', gia: 120000, gia_goc: 150000, sku_suffix: '250ML' },
        { ten: 'Chai 500ml', don_vi: 'chai', gia: 220000, gia_goc: 275000, sku_suffix: '500ML' },
      ],
    },
    {
      ten: 'Mật ong hoa nhãn',
      mo_ta: 'Mật ong hoa nhãn thơm dịu, vị ngọt thanh. Nguồn gốc từ vùng nhãn Hưng Yên.',
      xuat_xu: 'Hưng Yên',
      anh: '1558642452-9d2a7deb7f62',
      sku: 'MO-NHAN',
      bien_the: [
        { ten: 'Chai 250ml', don_vi: 'chai', gia: 130000, gia_goc: 165000, sku_suffix: '250ML' },
        { ten: 'Chai 500ml', don_vi: 'chai', gia: 240000, gia_goc: 300000, sku_suffix: '500ML' },
      ],
    },
    {
      ten: 'Mật ong rừng',
      mo_ta: 'Mật ong rừng nguyên chất 100%, khai thác tự nhiên từ rừng già. Giàu dưỡng chất.',
      xuat_xu: 'Kon Tum',
      anh: '1471943311424-646960669fbc',
      sku: 'MO-RUNG',
      bien_the: [
        { ten: 'Chai 250ml', don_vi: 'chai', gia: 180000, gia_goc: 225000, sku_suffix: '250ML' },
        { ten: 'Chai 500ml', don_vi: 'chai', gia: 330000, gia_goc: 420000, sku_suffix: '500ML' },
      ],
    },
    {
      ten: 'Mật ong bạc hà',
      mo_ta: 'Mật ong bạc hà Hà Giang, hương thơm đặc trưng. Đặc sản vùng cao nguyên đá.',
      xuat_xu: 'Hà Giang',
      anh: '1587049352847-4d4b126a3109',
      sku: 'MO-BACHA',
      bien_the: [
        { ten: 'Chai 250ml', don_vi: 'chai', gia: 200000, gia_goc: 250000, sku_suffix: '250ML' },
        { ten: 'Chai 500ml', don_vi: 'chai', gia: 370000, gia_goc: 460000, sku_suffix: '500ML' },
      ],
    },
    {
      ten: 'Mật ong hoa vải',
      mo_ta: 'Mật ong hoa vải thiều Bắc Giang, vị ngọt thanh đặc biệt. Thu hoạch mùa vải.',
      xuat_xu: 'Bắc Giang',
      anh: '1558642452-9d2a7deb7f62',
      sku: 'MO-VAI',
      bien_the: [
        { ten: 'Chai 250ml', don_vi: 'chai', gia: 135000, gia_goc: 170000, sku_suffix: '250ML' },
        { ten: 'Chai 500ml', don_vi: 'chai', gia: 250000, gia_goc: 310000, sku_suffix: '500ML' },
      ],
    },
    {
      ten: 'Mật ong hoa tràm',
      mo_ta: 'Mật ong hoa tràm U Minh, vị đậm đặc trưng. Tốt cho đường hô hấp.',
      xuat_xu: 'Cà Mau',
      anh: '1471943311424-646960669fbc',
      sku: 'MO-TRAM',
      bien_the: [
        { ten: 'Chai 250ml', don_vi: 'chai', gia: 145000, gia_goc: 180000, sku_suffix: '250ML' },
        { ten: 'Chai 500ml', don_vi: 'chai', gia: 260000, gia_goc: 330000, sku_suffix: '500ML' },
      ],
    },
    {
      ten: 'Mật ong hoa cao su',
      mo_ta: 'Mật ong hoa cao su Bình Phước, màu vàng nhạt, vị ngọt nhẹ. Sản lượng lớn.',
      xuat_xu: 'Bình Phước',
      anh: '1587049352847-4d4b126a3109',
      sku: 'MO-CAOSU',
      bien_the: [
        { ten: 'Chai 250ml', don_vi: 'chai', gia: 95000, gia_goc: 120000, sku_suffix: '250ML' },
        { ten: 'Chai 500ml', don_vi: 'chai', gia: 170000, gia_goc: 215000, sku_suffix: '500ML' },
      ],
    },
    {
      ten: 'Sáp ong',
      mo_ta: 'Sáp ong nguyên chất, dùng làm son dưỡng, nến thơm, mỹ phẩm handmade.',
      xuat_xu: 'Đắk Lắk',
      anh: '1558642452-9d2a7deb7f62',
      sku: 'MO-SAPONG',
      bien_the: [
        { ten: 'Miếng 100g', don_vi: 'mieng', gia: 45000, gia_goc: 58000, sku_suffix: '100G' },
        { ten: 'Miếng 300g', don_vi: 'mieng', gia: 120000, gia_goc: 150000, sku_suffix: '300G' },
      ],
    },
    {
      ten: 'Phấn hoa',
      mo_ta: 'Phấn hoa ong tự nhiên, siêu thực phẩm bổ sung dinh dưỡng. Giàu protein và vitamin.',
      xuat_xu: 'Lâm Đồng',
      anh: '1471943311424-646960669fbc',
      sku: 'MO-PHANHOA',
      bien_the: [
        { ten: 'Hũ 100g', don_vi: 'hu', gia: 85000, gia_goc: 108000, sku_suffix: '100G' },
        { ten: 'Hũ 250g', don_vi: 'hu', gia: 190000, gia_goc: 240000, sku_suffix: '250G' },
      ],
    },
    {
      ten: 'Sữa ong chúa',
      mo_ta: 'Sữa ong chúa tươi nguyên chất, bảo quản lạnh. Tăng cường sức khỏe, đẹp da.',
      xuat_xu: 'Đắk Lắk',
      anh: '1587049352847-4d4b126a3109',
      sku: 'MO-SUAONG',
      bien_the: [
        { ten: 'Hũ 50g', don_vi: 'hu', gia: 180000, gia_goc: 225000, sku_suffix: '50G' },
        { ten: 'Hũ 100g', don_vi: 'hu', gia: 320000, gia_goc: 400000, sku_suffix: '100G' },
      ],
    },
    {
      ten: 'Mật ong chanh đào',
      mo_ta: 'Mật ong ngâm chanh đào, giải khát, giảm ho. Thức uống bổ dưỡng mùa đông.',
      xuat_xu: 'Sapa, Lào Cai',
      anh: '1558642452-9d2a7deb7f62',
      sku: 'MO-CHANHDAO',
      bien_the: [
        { ten: 'Hũ 300ml', don_vi: 'hu', gia: 120000, gia_goc: 150000, sku_suffix: '300ML' },
        { ten: 'Hũ 500ml', don_vi: 'hu', gia: 195000, gia_goc: 245000, sku_suffix: '500ML' },
      ],
    },
    {
      ten: 'Mật ong gừng',
      mo_ta: 'Mật ong ngâm gừng tươi, giúp ấm bụng, giảm cảm cúm. Pha nước uống mỗi sáng.',
      xuat_xu: 'Hưng Yên',
      anh: '1471943311424-646960669fbc',
      sku: 'MO-GUNG',
      bien_the: [
        { ten: 'Hũ 300ml', don_vi: 'hu', gia: 95000, gia_goc: 120000, sku_suffix: '300ML' },
        { ten: 'Hũ 500ml', don_vi: 'hu', gia: 165000, gia_goc: 208000, sku_suffix: '500ML' },
      ],
    },
    {
      ten: 'Mật ong nghệ',
      mo_ta: 'Mật ong kết hợp tinh bột nghệ, tốt cho dạ dày. Uống mỗi sáng để bảo vệ sức khỏe.',
      xuat_xu: 'Đắk Lắk',
      anh: '1587049352847-4d4b126a3109',
      sku: 'MO-NGHE',
      bien_the: [
        { ten: 'Hũ 300ml', don_vi: 'hu', gia: 110000, gia_goc: 138000, sku_suffix: '300ML' },
        { ten: 'Hũ 500ml', don_vi: 'hu', gia: 185000, gia_goc: 230000, sku_suffix: '500ML' },
      ],
    },
    {
      ten: 'Mật ong quế',
      mo_ta: 'Mật ong ngâm quế chi, hương thơm ấm áp. Giúp tuần hoàn máu, giảm mỡ.',
      xuat_xu: 'Yên Bái',
      anh: '1558642452-9d2a7deb7f62',
      sku: 'MO-QUE',
      bien_the: [
        { ten: 'Hũ 300ml', don_vi: 'hu', gia: 105000, gia_goc: 132000, sku_suffix: '300ML' },
        { ten: 'Hũ 500ml', don_vi: 'hu', gia: 180000, gia_goc: 225000, sku_suffix: '500ML' },
      ],
    },
    {
      ten: 'Mật ong tắc',
      mo_ta: 'Mật ong ngâm tắc (quất), giàu vitamin C. Pha nước uống giải khát, tăng đề kháng.',
      xuat_xu: 'Tiền Giang',
      anh: '1471943311424-646960669fbc',
      sku: 'MO-TAC',
      bien_the: [
        { ten: 'Hũ 300ml', don_vi: 'hu', gia: 90000, gia_goc: 115000, sku_suffix: '300ML' },
        { ten: 'Hũ 500ml', don_vi: 'hu', gia: 155000, gia_goc: 195000, sku_suffix: '500ML' },
      ],
    },
    {
      ten: 'Tổ ong mật',
      mo_ta: 'Tổ ong mật nguyên khối, sáp ong chứa đầy mật. Sản phẩm thiên nhiên 100%.',
      xuat_xu: 'Kon Tum',
      anh: '1587049352847-4d4b126a3109',
      sku: 'MO-TOONG',
      bien_the: [
        { ten: 'Khay 300g', don_vi: 'khay', gia: 150000, gia_goc: 190000, sku_suffix: '300G' },
        { ten: 'Khay 500g', don_vi: 'khay', gia: 240000, gia_goc: 300000, sku_suffix: '500G' },
      ],
    },
    {
      ten: 'Mật ong nguyên sáp',
      mo_ta: 'Mật ong nguyên sáp cắt miếng, ăn cả sáp và mật. Trải nghiệm mật ong nguyên bản.',
      xuat_xu: 'Đắk Nông',
      anh: '1558642452-9d2a7deb7f62',
      sku: 'MO-NSAP',
      bien_the: [
        { ten: 'Hộp 250g', don_vi: 'hop', gia: 135000, gia_goc: 170000, sku_suffix: '250G' },
        { ten: 'Hộp 500g', don_vi: 'hop', gia: 250000, gia_goc: 315000, sku_suffix: '500G' },
      ],
    },
    {
      ten: 'Keo ong',
      mo_ta: 'Keo ong (propolis) dạng giọt, kháng khuẩn tự nhiên. Nhỏ dưới lưỡi hoặc pha nước.',
      xuat_xu: 'Lâm Đồng',
      anh: '1471943311424-646960669fbc',
      sku: 'MO-KEOONG',
      bien_the: [
        { ten: 'Lọ 30ml', don_vi: 'lo', gia: 150000, gia_goc: 190000, sku_suffix: '30ML' },
        { ten: 'Lọ 50ml', don_vi: 'lo', gia: 230000, gia_goc: 290000, sku_suffix: '50ML' },
      ],
    },
    {
      ten: 'Mật ong hoa cỏ',
      mo_ta: 'Mật ong hoa cỏ đa hoa, hương vị đa dạng. Phù hợp sử dụng hàng ngày.',
      xuat_xu: 'Gia Lai',
      anh: '1587049352847-4d4b126a3109',
      sku: 'MO-HOACO',
      bien_the: [
        { ten: 'Chai 250ml', don_vi: 'chai', gia: 85000, gia_goc: 108000, sku_suffix: '250ML' },
        { ten: 'Chai 500ml', don_vi: 'chai', gia: 155000, gia_goc: 195000, sku_suffix: '500ML' },
      ],
    },
    {
      ten: 'Mật ong hoa rừng',
      mo_ta: 'Mật ong hoa rừng tổng hợp từ nhiều loại hoa rừng. Vị ngọt đậm, màu sẫm tự nhiên.',
      xuat_xu: 'Quảng Nam',
      anh: '1558642452-9d2a7deb7f62',
      sku: 'MO-HOARUNG',
      bien_the: [
        { ten: 'Chai 250ml', don_vi: 'chai', gia: 160000, gia_goc: 200000, sku_suffix: '250ML' },
        { ten: 'Chai 500ml', don_vi: 'chai', gia: 290000, gia_goc: 365000, sku_suffix: '500ML' },
      ],
    },
  ];

  // Category 10 - Dac san kho
  const dacSanKho = [
    {
      ten: 'Chuối sấy',
      mo_ta: 'Chuối sấy giòn tự nhiên, không phẩm màu. Ăn vặt healthy giàu kali.',
      xuat_xu: 'Bến Tre',
      anh: '1604329760661-e71dc83f8f26',
      sku: 'DSK-CHUOI',
      bien_the: [
        { ten: 'Gói 200g', don_vi: 'goi', gia: 35000, gia_goc: 45000, sku_suffix: '200G' },
        { ten: 'Gói 500g', don_vi: 'goi', gia: 75000, gia_goc: 95000, sku_suffix: '500G' },
      ],
    },
    {
      ten: 'Mít sấy',
      mo_ta: 'Mít sấy giòn tan, vị ngọt tự nhiên. Đặc sản miền Tây, ăn vặt yêu thích.',
      xuat_xu: 'Tiền Giang',
      anh: '1573821663912-569905041acd',
      sku: 'DSK-MIT',
      bien_the: [
        { ten: 'Gói 200g', don_vi: 'goi', gia: 40000, gia_goc: 52000, sku_suffix: '200G' },
        { ten: 'Gói 500g', don_vi: 'goi', gia: 85000, gia_goc: 108000, sku_suffix: '500G' },
      ],
    },
    {
      ten: 'Xoài sấy',
      mo_ta: 'Xoài sấy dẻo chua ngọt, giữ nguyên hương vị xoài tươi. Ăn vặt mọi lúc.',
      xuat_xu: 'Đồng Tháp',
      anh: '1599599810769-bcde3a39e2f2',
      sku: 'DSK-XOAI',
      bien_the: [
        { ten: 'Gói 200g', don_vi: 'goi', gia: 45000, gia_goc: 58000, sku_suffix: '200G' },
        { ten: 'Gói 500g', don_vi: 'goi', gia: 95000, gia_goc: 120000, sku_suffix: '500G' },
      ],
    },
    {
      ten: 'Khoai lang sấy',
      mo_ta: 'Khoai lang sấy giòn, vị ngọt bùi tự nhiên. Không chất bảo quản, an toàn.',
      xuat_xu: 'Vĩnh Long',
      anh: '1604329760661-e71dc83f8f26',
      sku: 'DSK-KHOAI',
      bien_the: [
        { ten: 'Gói 200g', don_vi: 'goi', gia: 30000, gia_goc: 40000, sku_suffix: '200G' },
        { ten: 'Gói 500g', don_vi: 'goi', gia: 65000, gia_goc: 82000, sku_suffix: '500G' },
      ],
    },
    {
      ten: 'Hồng sấy',
      mo_ta: 'Hồng sấy dẻo Đà Lạt, ngọt tự nhiên không đường. Giàu beta-carotene và vitamin.',
      xuat_xu: 'Đà Lạt',
      anh: '1573821663912-569905041acd',
      sku: 'DSK-HONG',
      bien_the: [
        { ten: 'Gói 200g', don_vi: 'goi', gia: 55000, gia_goc: 70000, sku_suffix: '200G' },
        { ten: 'Gói 500g', don_vi: 'goi', gia: 120000, gia_goc: 150000, sku_suffix: '500G' },
      ],
    },
    {
      ten: 'Dứa sấy',
      mo_ta: 'Dứa (thơm) sấy giòn, vị chua ngọt hài hòa. Ăn vặt giải khát tốt cho tiêu hóa.',
      xuat_xu: 'Kiên Giang',
      anh: '1599599810769-bcde3a39e2f2',
      sku: 'DSK-DUA',
      bien_the: [
        { ten: 'Gói 200g', don_vi: 'goi', gia: 35000, gia_goc: 45000, sku_suffix: '200G' },
        { ten: 'Gói 500g', don_vi: 'goi', gia: 75000, gia_goc: 95000, sku_suffix: '500G' },
      ],
    },
    {
      ten: 'Thanh long sấy',
      mo_ta: 'Thanh long sấy giòn, màu hồng bắt mắt. Giàu chất xơ và vitamin C.',
      xuat_xu: 'Bình Thuận',
      anh: '1604329760661-e71dc83f8f26',
      sku: 'DSK-THLONG',
      bien_the: [
        { ten: 'Gói 150g', don_vi: 'goi', gia: 40000, gia_goc: 52000, sku_suffix: '150G' },
        { ten: 'Gói 350g', don_vi: 'goi', gia: 85000, gia_goc: 108000, sku_suffix: '350G' },
      ],
    },
    {
      ten: 'Dừa sấy',
      mo_ta: 'Dừa sấy giòn béo thơm, vị ngọt bùi đặc trưng. Đặc sản Bến Tre.',
      xuat_xu: 'Bến Tre',
      anh: '1573821663912-569905041acd',
      sku: 'DSK-DUA2',
      bien_the: [
        { ten: 'Gói 200g', don_vi: 'goi', gia: 38000, gia_goc: 48000, sku_suffix: '200G' },
        { ten: 'Gói 500g', don_vi: 'goi', gia: 80000, gia_goc: 100000, sku_suffix: '500G' },
      ],
    },
    {
      ten: 'Rau củ sấy',
      mo_ta: 'Hỗn hợp rau củ sấy giòn: cà rốt, khoai môn, bí đỏ. Ăn vặt dinh dưỡng.',
      xuat_xu: 'Đà Lạt',
      anh: '1599599810769-bcde3a39e2f2',
      sku: 'DSK-RAUCU',
      bien_the: [
        { ten: 'Gói 150g', don_vi: 'goi', gia: 35000, gia_goc: 45000, sku_suffix: '150G' },
        { ten: 'Gói 400g', don_vi: 'goi', gia: 80000, gia_goc: 100000, sku_suffix: '400G' },
      ],
    },
    {
      ten: 'Nấm hương khô',
      mo_ta: 'Nấm hương (đông cô) sấy khô, thơm đậm đà. Hầm gà, nấu lẩu, xào rau.',
      xuat_xu: 'Sapa, Lào Cai',
      anh: '1604329760661-e71dc83f8f26',
      sku: 'DSK-NAMHUONG',
      bien_the: [
        { ten: 'Gói 100g', don_vi: 'goi', gia: 55000, gia_goc: 70000, sku_suffix: '100G' },
        { ten: 'Gói 300g', don_vi: 'goi', gia: 145000, gia_goc: 180000, sku_suffix: '300G' },
      ],
    },
    {
      ten: 'Nấm mèo khô',
      mo_ta: 'Nấm mèo (mộc nhĩ) khô, giòn dai khi ngâm nước. Xào, nấu canh, gỏi đều ngon.',
      xuat_xu: 'Lâm Đồng',
      anh: '1573821663912-569905041acd',
      sku: 'DSK-NAMMEO',
      bien_the: [
        { ten: 'Gói 100g', don_vi: 'goi', gia: 35000, gia_goc: 45000, sku_suffix: '100G' },
        { ten: 'Gói 300g', don_vi: 'goi', gia: 90000, gia_goc: 115000, sku_suffix: '300G' },
      ],
    },
    {
      ten: 'Măng khô',
      mo_ta: 'Măng khô Tây Bắc, dai giòn thơm. Hầm giò heo, nấu canh chua đặc biệt ngon.',
      xuat_xu: 'Sơn La',
      anh: '1599599810769-bcde3a39e2f2',
      sku: 'DSK-MANG',
      bien_the: [
        { ten: 'Gói 200g', don_vi: 'goi', gia: 45000, gia_goc: 58000, sku_suffix: '200G' },
        { ten: 'Gói 500g', don_vi: 'goi', gia: 100000, gia_goc: 125000, sku_suffix: '500G' },
      ],
    },
    {
      ten: 'Miến dong',
      mo_ta: 'Miến dong riềng Bắc Kạn, sợi dai trong. Nấu miến gà, lẩu miến cua.',
      xuat_xu: 'Bắc Kạn',
      anh: '1604329760661-e71dc83f8f26',
      sku: 'DSK-MIEN',
      bien_the: [
        { ten: 'Gói 300g', don_vi: 'goi', gia: 28000, gia_goc: 35000, sku_suffix: '300G' },
        { ten: 'Gói 1kg', don_vi: 'goi', gia: 80000, gia_goc: 100000, sku_suffix: '1KG' },
      ],
    },
    {
      ten: 'Bánh tráng',
      mo_ta: 'Bánh tráng Trảng Bàng dẻo mỏng, cuốn thịt rau ăn kèm nước mắm chua ngọt.',
      xuat_xu: 'Tây Ninh',
      anh: '1573821663912-569905041acd',
      sku: 'DSK-BTRANG',
      bien_the: [
        { ten: 'Gói 20 cái', don_vi: 'goi', gia: 25000, gia_goc: 32000, sku_suffix: '20C' },
        { ten: 'Gói 50 cái', don_vi: 'goi', gia: 55000, gia_goc: 70000, sku_suffix: '50C' },
      ],
    },
    {
      ten: 'Bột sắn dây',
      mo_ta: 'Bột sắn dây nguyên chất, thanh nhiệt giải độc. Pha nước uống mùa hè mát lạnh.',
      xuat_xu: 'Hưng Yên',
      anh: '1599599810769-bcde3a39e2f2',
      sku: 'DSK-BOTSAN',
      bien_the: [
        { ten: 'Gói 200g', don_vi: 'goi', gia: 40000, gia_goc: 52000, sku_suffix: '200G' },
        { ten: 'Gói 500g', don_vi: 'goi', gia: 85000, gia_goc: 108000, sku_suffix: '500G' },
      ],
    },
    {
      ten: 'Bột nghệ',
      mo_ta: 'Bột nghệ vàng nguyên chất, xay mịn từ nghệ tươi. Tốt cho dạ dày và làm đẹp.',
      xuat_xu: 'Đắk Lắk',
      anh: '1604329760661-e71dc83f8f26',
      sku: 'DSK-BOTNGHE',
      bien_the: [
        { ten: 'Hũ 100g', don_vi: 'hu', gia: 35000, gia_goc: 45000, sku_suffix: '100G' },
        { ten: 'Hũ 250g', don_vi: 'hu', gia: 75000, gia_goc: 95000, sku_suffix: '250G' },
      ],
    },
    {
      ten: 'Bột gừng',
      mo_ta: 'Bột gừng nguyên chất, vị cay ấm. Pha trà gừng, nấu ăn, làm bánh.',
      xuat_xu: 'Hưng Yên',
      anh: '1573821663912-569905041acd',
      sku: 'DSK-BOTGUNG',
      bien_the: [
        { ten: 'Hũ 100g', don_vi: 'hu', gia: 30000, gia_goc: 40000, sku_suffix: '100G' },
        { ten: 'Hũ 250g', don_vi: 'hu', gia: 65000, gia_goc: 82000, sku_suffix: '250G' },
      ],
    },
    {
      ten: 'Bột rau má',
      mo_ta: 'Bột rau má sấy lạnh, giữ nguyên dưỡng chất. Thanh nhiệt, đẹp da, giải độc.',
      xuat_xu: 'Bình Dương',
      anh: '1599599810769-bcde3a39e2f2',
      sku: 'DSK-BOTRAUMA',
      bien_the: [
        { ten: 'Hũ 100g', don_vi: 'hu', gia: 45000, gia_goc: 58000, sku_suffix: '100G' },
        { ten: 'Hũ 250g', don_vi: 'hu', gia: 100000, gia_goc: 125000, sku_suffix: '250G' },
      ],
    },
    {
      ten: 'Bột cần tây',
      mo_ta: 'Bột cần tây nguyên chất, hỗ trợ giảm cân. Pha nước uống mỗi sáng.',
      xuat_xu: 'Đà Lạt',
      anh: '1604329760661-e71dc83f8f26',
      sku: 'DSK-BOTCANTAY',
      bien_the: [
        { ten: 'Hũ 100g', don_vi: 'hu', gia: 50000, gia_goc: 65000, sku_suffix: '100G' },
        { ten: 'Hũ 250g', don_vi: 'hu', gia: 110000, gia_goc: 138000, sku_suffix: '250G' },
      ],
    },
    {
      ten: 'Bột matcha',
      mo_ta: 'Bột matcha Việt Nam chất lượng cao, màu xanh đậm. Pha latte, làm bánh, smoothie.',
      xuat_xu: 'Lâm Đồng',
      anh: '1573821663912-569905041acd',
      sku: 'DSK-MATCHA',
      bien_the: [
        { ten: 'Hũ 50g', don_vi: 'hu', gia: 85000, gia_goc: 108000, sku_suffix: '50G' },
        { ten: 'Hũ 100g', don_vi: 'hu', gia: 155000, gia_goc: 195000, sku_suffix: '100G' },
      ],
    },
  ];

  // Helper function to create products
  async function createProducts(products: any[], categoryId: number) {
    for (const product of products) {
      await prisma.san_pham.create({
        data: {
          ten_san_pham: product.ten,
          mo_ta: product.mo_ta,
          xuat_xu: product.xuat_xu,
          trang_thai: 'DANG_BAN',
          ma_danh_muc: categoryId,
          anh_san_pham: {
            create: [
              {
                duong_dan_anh: `https://images.unsplash.com/photo-${product.anh}?w=800`,
                la_anh_chinh: true,
              },
            ],
          },
          bien_the_san_pham: {
            create: product.bien_the.map((bt: any) => ({
              ten_bien_the: bt.ten,
              don_vi_tinh: bt.don_vi,
              gia_ban: bt.gia,
              gia_goc: bt.gia_goc,
              ma_sku: `${product.sku}-${bt.sku_suffix}`,
            })),
          },
        },
      });
    }
  }

  // Create all products
  await createProducts(giaViTuoi, categoryIds.giaViTuoi);
  console.log('  - Da tao 20 san pham Gia vi tuoi');

  await createProducts(hatDau, categoryIds.hatDau);
  console.log('  - Da tao 20 san pham Hat & dau');

  await createProducts(traHoa, categoryIds.traHoa);
  console.log('  - Da tao 20 san pham Tra & hoa thao moc');

  await createProducts(matOng, categoryIds.matOng);
  console.log('  - Da tao 20 san pham Mat ong & san pham ong');

  await createProducts(dacSanKho, categoryIds.dacSanKho);
  console.log('  - Da tao 20 san pham Dac san kho');

  console.log('Hoan thanh seed 100 san pham cho categories 6-10!');
}
