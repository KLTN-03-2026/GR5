/**
 * SEED PRODUCTS 3 - Tạo 100 sản phẩm cho danh mục 11-15
 * Chạy: npx ts-node -P tsconfig.seed.json prisma/seed-products-3.ts
 */

import prisma from '../src/lib/prisma';

export async function seedProducts3(categoryIds: any) {
  console.log('🌱 Bắt đầu seed 100 sản phẩm cho danh mục 11-15...');

  // ═══════════════════════════════════════════════════════════════════
  // Category 11 - Nông sản hữu cơ
  // ═══════════════════════════════════════════════════════════════════

  const organicImages = [
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800',
    'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=800',
    'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800',
  ];

  const herbImages = [
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800',
    'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=800',
    'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800',
  ];

  const veggieImages = [
    'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=800',
    'https://images.unsplash.com/photo-1550350981-a1e8218bfa97?w=800',
    'https://images.unsplash.com/photo-1590868309235-ea34bed7bd7f?w=800',
  ];

  const processedImages = [
    'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=800',
    'https://images.unsplash.com/photo-1599599810769-bcde3a39e2f2?w=800',
    'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=800',
  ];

  const milkImages = [
    'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800',
    'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800',
    'https://images.unsplash.com/photo-1628557044797-f21a177c37ec?w=800',
  ];

  // ─── Category 11: Nông sản hữu cơ ─────────────────────────────────

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Rau muống hữu cơ',
      mo_ta: 'Rau muống hữu cơ được trồng tại vùng đất sạch, không sử dụng thuốc trừ sâu hay phân bón hóa học. Giòn ngọt tự nhiên, an toàn cho sức khỏe.',
      xuat_xu: 'Đà Lạt',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.huuCo,
      anh_san_pham: { create: [{ duong_dan_anh: organicImages[0], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Gói 300g', don_vi_tinh: 'gói', gia_ban: 25000, gia_goc: 30000, ma_sku: 'HCO-RMUONG-300G' },
          { ten_bien_the: 'Gói 500g', don_vi_tinh: 'gói', gia_ban: 38000, gia_goc: 45000, ma_sku: 'HCO-RMUONG-500G' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Cải ngọt hữu cơ',
      mo_ta: 'Cải ngọt hữu cơ tươi xanh, được canh tác theo tiêu chuẩn hữu cơ. Thích hợp xào, nấu canh hoặc luộc.',
      xuat_xu: 'Đà Lạt',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.huuCo,
      anh_san_pham: { create: [{ duong_dan_anh: organicImages[1], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Gói 300g', don_vi_tinh: 'gói', gia_ban: 22000, gia_goc: 28000, ma_sku: 'HCO-CAINGOT-300G' },
          { ten_bien_the: 'Gói 500g', don_vi_tinh: 'gói', gia_ban: 35000, gia_goc: 42000, ma_sku: 'HCO-CAINGOT-500G' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Xà lách hữu cơ',
      mo_ta: 'Xà lách hữu cơ giòn mát, giàu vitamin và khoáng chất. Lý tưởng cho salad và các món ăn nhẹ.',
      xuat_xu: 'Đà Lạt',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.huuCo,
      anh_san_pham: { create: [{ duong_dan_anh: organicImages[2], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Gói 200g', don_vi_tinh: 'gói', gia_ban: 20000, gia_goc: 25000, ma_sku: 'HCO-XALACH-200G' },
          { ten_bien_the: 'Gói 400g', don_vi_tinh: 'gói', gia_ban: 35000, gia_goc: 42000, ma_sku: 'HCO-XALACH-400G' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Cà rốt hữu cơ',
      mo_ta: 'Cà rốt hữu cơ ngọt thanh, giàu beta-carotene. Trồng tại vùng đất đỏ bazan Đà Lạt, đảm bảo chất lượng cao.',
      xuat_xu: 'Đà Lạt',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.huuCo,
      anh_san_pham: { create: [{ duong_dan_anh: organicImages[0], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Gói 500g', don_vi_tinh: 'gói', gia_ban: 30000, gia_goc: 38000, ma_sku: 'HCO-CAROT-500G' },
          { ten_bien_the: 'Gói 1kg', don_vi_tinh: 'gói', gia_ban: 55000, gia_goc: 68000, ma_sku: 'HCO-CAROT-1KG' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Khoai tây hữu cơ',
      mo_ta: 'Khoai tây hữu cơ vỏ mỏng, ruột vàng bở. Không sử dụng chất kích thích tăng trưởng, an toàn tuyệt đối.',
      xuat_xu: 'Đà Lạt',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.huuCo,
      anh_san_pham: { create: [{ duong_dan_anh: organicImages[1], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Gói 500g', don_vi_tinh: 'gói', gia_ban: 32000, gia_goc: 40000, ma_sku: 'HCO-KHTAY-500G' },
          { ten_bien_the: 'Gói 1kg', don_vi_tinh: 'gói', gia_ban: 58000, gia_goc: 72000, ma_sku: 'HCO-KHTAY-1KG' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Khoai lang hữu cơ',
      mo_ta: 'Khoai lang hữu cơ ruột cam, ngọt dẻo tự nhiên. Giàu chất xơ và vitamin A, tốt cho tiêu hóa.',
      xuat_xu: 'Bình Phước',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.huuCo,
      anh_san_pham: { create: [{ duong_dan_anh: organicImages[2], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Gói 500g', don_vi_tinh: 'gói', gia_ban: 28000, gia_goc: 35000, ma_sku: 'HCO-KHLANG-500G' },
          { ten_bien_the: 'Gói 1kg', don_vi_tinh: 'gói', gia_ban: 50000, gia_goc: 62000, ma_sku: 'HCO-KHLANG-1KG' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Cà chua hữu cơ',
      mo_ta: 'Cà chua hữu cơ chín đỏ mọng, vị chua ngọt hài hòa. Không chất bảo quản, thu hoạch và giao trong ngày.',
      xuat_xu: 'Đà Lạt',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.huuCo,
      anh_san_pham: { create: [{ duong_dan_anh: organicImages[0], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Gói 500g', don_vi_tinh: 'gói', gia_ban: 35000, gia_goc: 42000, ma_sku: 'HCO-CACHUA-500G' },
          { ten_bien_the: 'Gói 1kg', don_vi_tinh: 'gói', gia_ban: 62000, gia_goc: 75000, ma_sku: 'HCO-CACHUA-1KG' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Dưa leo hữu cơ',
      mo_ta: 'Dưa leo hữu cơ giòn mát, không đắng. Trồng trong nhà kính với quy trình hữu cơ nghiêm ngặt.',
      xuat_xu: 'Đà Lạt',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.huuCo,
      anh_san_pham: { create: [{ duong_dan_anh: organicImages[1], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Gói 500g', don_vi_tinh: 'gói', gia_ban: 28000, gia_goc: 35000, ma_sku: 'HCO-DUALEO-500G' },
          { ten_bien_the: 'Gói 1kg', don_vi_tinh: 'gói', gia_ban: 50000, gia_goc: 62000, ma_sku: 'HCO-DUALEO-1KG' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Bí đỏ hữu cơ',
      mo_ta: 'Bí đỏ hữu cơ ruột vàng cam đậm, bột dẻo. Giàu vitamin A và chất chống oxy hóa.',
      xuat_xu: 'Bình Phước',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.huuCo,
      anh_san_pham: { create: [{ duong_dan_anh: organicImages[2], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Quả 1kg', don_vi_tinh: 'quả', gia_ban: 30000, gia_goc: 38000, ma_sku: 'HCO-BIDO-1KG' },
          { ten_bien_the: 'Quả 2kg', don_vi_tinh: 'quả', gia_ban: 55000, gia_goc: 68000, ma_sku: 'HCO-BIDO-2KG' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Bắp cải hữu cơ',
      mo_ta: 'Bắp cải hữu cơ cuộn chặt, lá giòn ngọt. Phù hợp làm salad, xào hoặc nấu canh.',
      xuat_xu: 'Đà Lạt',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.huuCo,
      anh_san_pham: { create: [{ duong_dan_anh: organicImages[0], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Quả nhỏ 800g', don_vi_tinh: 'quả', gia_ban: 28000, gia_goc: 35000, ma_sku: 'HCO-BAPCAI-800G' },
          { ten_bien_the: 'Quả lớn 1.5kg', don_vi_tinh: 'quả', gia_ban: 45000, gia_goc: 55000, ma_sku: 'HCO-BAPCAI-1K5' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Chuối hữu cơ',
      mo_ta: 'Chuối hữu cơ chín tự nhiên, ngọt thơm. Không sử dụng hóa chất thúc chín, an toàn cho trẻ em.',
      xuat_xu: 'Tiền Giang',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.huuCo,
      anh_san_pham: { create: [{ duong_dan_anh: organicImages[1], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Nải nhỏ 1kg', don_vi_tinh: 'nải', gia_ban: 35000, gia_goc: 42000, ma_sku: 'HCO-CHUOI-1KG' },
          { ten_bien_the: 'Nải lớn 2kg', don_vi_tinh: 'nải', gia_ban: 62000, gia_goc: 75000, ma_sku: 'HCO-CHUOI-2KG' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Cam hữu cơ',
      mo_ta: 'Cam hữu cơ ngọt thanh, nhiều nước. Trồng theo phương pháp tự nhiên tại vùng đất phù sa Vĩnh Long.',
      xuat_xu: 'Vĩnh Long',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.huuCo,
      anh_san_pham: { create: [{ duong_dan_anh: organicImages[2], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Túi 1kg', don_vi_tinh: 'túi', gia_ban: 45000, gia_goc: 55000, ma_sku: 'HCO-CAM-1KG' },
          { ten_bien_the: 'Túi 2kg', don_vi_tinh: 'túi', gia_ban: 82000, gia_goc: 100000, ma_sku: 'HCO-CAM-2KG' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Xoài hữu cơ',
      mo_ta: 'Xoài cát hữu cơ thơm ngọt, thịt dày ít xơ. Được chứng nhận hữu cơ quốc tế.',
      xuat_xu: 'Tiền Giang',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.huuCo,
      anh_san_pham: { create: [{ duong_dan_anh: organicImages[0], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Túi 1kg', don_vi_tinh: 'túi', gia_ban: 55000, gia_goc: 68000, ma_sku: 'HCO-XOAI-1KG' },
          { ten_bien_the: 'Túi 2kg', don_vi_tinh: 'túi', gia_ban: 100000, gia_goc: 125000, ma_sku: 'HCO-XOAI-2KG' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Gạo hữu cơ',
      mo_ta: 'Gạo hữu cơ hạt dài, dẻo thơm. Canh tác hoàn toàn tự nhiên, không thuốc trừ sâu, không phân hóa học.',
      xuat_xu: 'Sóc Trăng',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.huuCo,
      anh_san_pham: { create: [{ duong_dan_anh: organicImages[1], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Túi 2kg', don_vi_tinh: 'túi', gia_ban: 85000, gia_goc: 105000, ma_sku: 'HCO-GAO-2KG' },
          { ten_bien_the: 'Túi 5kg', don_vi_tinh: 'túi', gia_ban: 195000, gia_goc: 240000, ma_sku: 'HCO-GAO-5KG' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Gạo lứt hữu cơ',
      mo_ta: 'Gạo lứt hữu cơ giàu chất xơ và vitamin nhóm B. Hỗ trợ giảm cân và kiểm soát đường huyết.',
      xuat_xu: 'Sóc Trăng',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.huuCo,
      anh_san_pham: { create: [{ duong_dan_anh: organicImages[2], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Túi 1kg', don_vi_tinh: 'túi', gia_ban: 55000, gia_goc: 68000, ma_sku: 'HCO-GAOLUT-1KG' },
          { ten_bien_the: 'Túi 3kg', don_vi_tinh: 'túi', gia_ban: 150000, gia_goc: 185000, ma_sku: 'HCO-GAOLUT-3KG' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Đậu xanh hữu cơ',
      mo_ta: 'Đậu xanh hữu cơ hạt to đều, nấu nhanh nhừ. Dùng nấu chè, làm bánh hoặc giá đỗ.',
      xuat_xu: 'Bình Phước',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.huuCo,
      anh_san_pham: { create: [{ duong_dan_anh: organicImages[0], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Gói 500g', don_vi_tinh: 'gói', gia_ban: 42000, gia_goc: 52000, ma_sku: 'HCO-DAUXANH-500G' },
          { ten_bien_the: 'Gói 1kg', don_vi_tinh: 'gói', gia_ban: 78000, gia_goc: 95000, ma_sku: 'HCO-DAUXANH-1KG' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Đậu đen hữu cơ',
      mo_ta: 'Đậu đen hữu cơ xanh lòng, hạt bóng mẩy. Nấu chè, nấu nước uống giải nhiệt rất tốt.',
      xuat_xu: 'Bình Phước',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.huuCo,
      anh_san_pham: { create: [{ duong_dan_anh: organicImages[1], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Gói 500g', don_vi_tinh: 'gói', gia_ban: 45000, gia_goc: 55000, ma_sku: 'HCO-DAUDEN-500G' },
          { ten_bien_the: 'Gói 1kg', don_vi_tinh: 'gói', gia_ban: 82000, gia_goc: 100000, ma_sku: 'HCO-DAUDEN-1KG' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Nấm hữu cơ',
      mo_ta: 'Nấm hữu cơ tươi ngon, được nuôi trồng trong môi trường sạch. Giàu protein thực vật và khoáng chất.',
      xuat_xu: 'Đà Lạt',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.huuCo,
      anh_san_pham: { create: [{ duong_dan_anh: organicImages[2], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Gói 200g', don_vi_tinh: 'gói', gia_ban: 35000, gia_goc: 42000, ma_sku: 'HCO-NAM-200G' },
          { ten_bien_the: 'Gói 500g', don_vi_tinh: 'gói', gia_ban: 78000, gia_goc: 95000, ma_sku: 'HCO-NAM-500G' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Trà hữu cơ',
      mo_ta: 'Trà xanh hữu cơ thượng hạng, hái từ đọt non. Hương thơm thanh khiết, vị chát nhẹ dễ chịu.',
      xuat_xu: 'Thái Nguyên',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.huuCo,
      anh_san_pham: { create: [{ duong_dan_anh: organicImages[0], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Hộp 100g', don_vi_tinh: 'hộp', gia_ban: 85000, gia_goc: 105000, ma_sku: 'HCO-TRA-100G' },
          { ten_bien_the: 'Hộp 250g', don_vi_tinh: 'hộp', gia_ban: 195000, gia_goc: 240000, ma_sku: 'HCO-TRA-250G' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Mật ong hữu cơ',
      mo_ta: 'Mật ong hữu cơ nguyên chất từ rừng tràm. Không pha trộn, giữ nguyên enzyme tự nhiên, tốt cho sức khỏe.',
      xuat_xu: 'Cà Mau',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.huuCo,
      anh_san_pham: { create: [{ duong_dan_anh: organicImages[1], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Chai 250ml', don_vi_tinh: 'chai', gia_ban: 120000, gia_goc: 150000, ma_sku: 'HCO-MATONG-250ML' },
          { ten_bien_the: 'Chai 500ml', don_vi_tinh: 'chai', gia_ban: 220000, gia_goc: 275000, ma_sku: 'HCO-MATONG-500ML' },
        ]
      }
    }
  });

  console.log('  ✅ Đã tạo 20 sản phẩm Nông sản hữu cơ');

  // ─── Category 12: Rau gia vị ───────────────────────────────────────

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Húng quế',
      mo_ta: 'Húng quế tươi xanh thơm nồng, lá to mọng nước. Gia vị không thể thiếu cho phở, bún bò và các món nước.',
      xuat_xu: 'Hà Nội',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.rauGiaVi,
      anh_san_pham: { create: [{ duong_dan_anh: herbImages[0], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Bó 50g', don_vi_tinh: 'bó', gia_ban: 8000, gia_goc: 10000, ma_sku: 'RGV-HUNGQUE-50G' },
          { ten_bien_the: 'Bó 100g', don_vi_tinh: 'bó', gia_ban: 15000, gia_goc: 18000, ma_sku: 'RGV-HUNGQUE-100G' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Húng lủi',
      mo_ta: 'Húng lủi lá nhỏ thơm mát, vị the nhẹ. Dùng ăn kèm gỏi cuốn, nem rán và các món cuốn.',
      xuat_xu: 'Hà Nội',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.rauGiaVi,
      anh_san_pham: { create: [{ duong_dan_anh: herbImages[1], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Bó 50g', don_vi_tinh: 'bó', gia_ban: 8000, gia_goc: 10000, ma_sku: 'RGV-HUNGLUI-50G' },
          { ten_bien_the: 'Bó 100g', don_vi_tinh: 'bó', gia_ban: 15000, gia_goc: 18000, ma_sku: 'RGV-HUNGLUI-100G' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Tía tô',
      mo_ta: 'Tía tô tươi lá tím đậm, mùi thơm đặc trưng. Dùng trong bún ốc, cháo, hoặc ăn kèm hải sản.',
      xuat_xu: 'Hà Nội',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.rauGiaVi,
      anh_san_pham: { create: [{ duong_dan_anh: herbImages[2], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Bó 50g', don_vi_tinh: 'bó', gia_ban: 7000, gia_goc: 9000, ma_sku: 'RGV-TIATO-50G' },
          { ten_bien_the: 'Bó 100g', don_vi_tinh: 'bó', gia_ban: 12000, gia_goc: 15000, ma_sku: 'RGV-TIATO-100G' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Kinh giới',
      mo_ta: 'Kinh giới tươi lá xanh non, thơm dịu. Gia vị quen thuộc trong bữa cơm gia đình Việt Nam.',
      xuat_xu: 'Hà Nội',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.rauGiaVi,
      anh_san_pham: { create: [{ duong_dan_anh: herbImages[0], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Bó 50g', don_vi_tinh: 'bó', gia_ban: 7000, gia_goc: 9000, ma_sku: 'RGV-KGIOI-50G' },
          { ten_bien_the: 'Bó 100g', don_vi_tinh: 'bó', gia_ban: 12000, gia_goc: 15000, ma_sku: 'RGV-KGIOI-100G' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Rau răm',
      mo_ta: 'Rau răm lá nhỏ thon dài, vị cay nồng đặc trưng. Ăn kèm trứng vịt lộn, hột vịt lộn và các món gỏi.',
      xuat_xu: 'TP. Hồ Chí Minh',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.rauGiaVi,
      anh_san_pham: { create: [{ duong_dan_anh: herbImages[1], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Bó 50g', don_vi_tinh: 'bó', gia_ban: 6000, gia_goc: 8000, ma_sku: 'RGV-RAURAM-50G' },
          { ten_bien_the: 'Bó 100g', don_vi_tinh: 'bó', gia_ban: 10000, gia_goc: 13000, ma_sku: 'RGV-RAURAM-100G' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Ngò rí',
      mo_ta: 'Ngò rí tươi xanh, mùi thơm đặc trưng. Không thể thiếu trong canh, phở và các món hầm.',
      xuat_xu: 'Đà Lạt',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.rauGiaVi,
      anh_san_pham: { create: [{ duong_dan_anh: herbImages[2], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Bó 50g', don_vi_tinh: 'bó', gia_ban: 7000, gia_goc: 9000, ma_sku: 'RGV-NGORI-50G' },
          { ten_bien_the: 'Bó 100g', don_vi_tinh: 'bó', gia_ban: 12000, gia_goc: 15000, ma_sku: 'RGV-NGORI-100G' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Ngò gai',
      mo_ta: 'Ngò gai lá dài răng cưa, mùi thơm hắc. Gia vị đặc biệt cho phở Bắc và các món nước lèo.',
      xuat_xu: 'Đà Lạt',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.rauGiaVi,
      anh_san_pham: { create: [{ duong_dan_anh: herbImages[0], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Bó 50g', don_vi_tinh: 'bó', gia_ban: 8000, gia_goc: 10000, ma_sku: 'RGV-NGOGAI-50G' },
          { ten_bien_the: 'Bó 100g', don_vi_tinh: 'bó', gia_ban: 14000, gia_goc: 18000, ma_sku: 'RGV-NGOGAI-100G' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Hành lá',
      mo_ta: 'Hành lá tươi xanh, thân trắng mập. Gia vị cơ bản cho mọi món xào, canh và nước chấm.',
      xuat_xu: 'Đà Lạt',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.rauGiaVi,
      anh_san_pham: { create: [{ duong_dan_anh: herbImages[1], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Bó 100g', don_vi_tinh: 'bó', gia_ban: 8000, gia_goc: 10000, ma_sku: 'RGV-HANHLA-100G' },
          { ten_bien_the: 'Bó 200g', don_vi_tinh: 'bó', gia_ban: 14000, gia_goc: 18000, ma_sku: 'RGV-HANHLA-200G' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Hẹ',
      mo_ta: 'Hẹ tươi lá dẹt xanh đậm, mùi thơm nồng. Dùng xào trứng, nấu canh hoặc làm nhân bánh.',
      xuat_xu: 'TP. Hồ Chí Minh',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.rauGiaVi,
      anh_san_pham: { create: [{ duong_dan_anh: herbImages[2], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Bó 100g', don_vi_tinh: 'bó', gia_ban: 7000, gia_goc: 9000, ma_sku: 'RGV-HE-100G' },
          { ten_bien_the: 'Bó 200g', don_vi_tinh: 'bó', gia_ban: 12000, gia_goc: 15000, ma_sku: 'RGV-HE-200G' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Lá lốt',
      mo_ta: 'Lá lốt tươi xanh mướt, mùi thơm đặc trưng. Dùng cuốn bò nướng, làm chả lá lốt truyền thống.',
      xuat_xu: 'TP. Hồ Chí Minh',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.rauGiaVi,
      anh_san_pham: { create: [{ duong_dan_anh: herbImages[0], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Bó 50g', don_vi_tinh: 'bó', gia_ban: 6000, gia_goc: 8000, ma_sku: 'RGV-LALOT-50G' },
          { ten_bien_the: 'Bó 100g', don_vi_tinh: 'bó', gia_ban: 10000, gia_goc: 13000, ma_sku: 'RGV-LALOT-100G' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Diếp cá',
      mo_ta: 'Diếp cá tươi lá hình tim, mùi tanh nhẹ đặc trưng. Ăn sống kèm bánh xèo, bún hoặc nấu nước uống giải độc.',
      xuat_xu: 'TP. Hồ Chí Minh',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.rauGiaVi,
      anh_san_pham: { create: [{ duong_dan_anh: herbImages[1], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Bó 50g', don_vi_tinh: 'bó', gia_ban: 6000, gia_goc: 8000, ma_sku: 'RGV-DIEPCA-50G' },
          { ten_bien_the: 'Bó 100g', don_vi_tinh: 'bó', gia_ban: 10000, gia_goc: 13000, ma_sku: 'RGV-DIEPCA-100G' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Bạc hà',
      mo_ta: 'Bạc hà tươi lá xanh thơm mát, vị the lạnh dễ chịu. Pha trà, làm đồ uống hoặc trang trí món ăn.',
      xuat_xu: 'Đà Lạt',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.rauGiaVi,
      anh_san_pham: { create: [{ duong_dan_anh: herbImages[2], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Bó 30g', don_vi_tinh: 'bó', gia_ban: 8000, gia_goc: 10000, ma_sku: 'RGV-BACHA-30G' },
          { ten_bien_the: 'Bó 60g', don_vi_tinh: 'bó', gia_ban: 14000, gia_goc: 18000, ma_sku: 'RGV-BACHA-60G' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Cần tàu',
      mo_ta: 'Cần tàu thân xanh giòn, lá nhỏ thơm. Dùng nấu canh, xào thịt bò hoặc làm salad.',
      xuat_xu: 'Đà Lạt',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.rauGiaVi,
      anh_san_pham: { create: [{ duong_dan_anh: herbImages[0], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Bó 100g', don_vi_tinh: 'bó', gia_ban: 10000, gia_goc: 12000, ma_sku: 'RGV-CANTAU-100G' },
          { ten_bien_the: 'Bó 200g', don_vi_tinh: 'bó', gia_ban: 18000, gia_goc: 22000, ma_sku: 'RGV-CANTAU-200G' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Thì là',
      mo_ta: 'Thì là tươi lá nhỏ xanh mướt, mùi thơm nồng. Gia vị hoàn hảo cho các món cá, canh chua.',
      xuat_xu: 'Đà Lạt',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.rauGiaVi,
      anh_san_pham: { create: [{ duong_dan_anh: herbImages[1], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Bó 50g', don_vi_tinh: 'bó', gia_ban: 7000, gia_goc: 9000, ma_sku: 'RGV-THILA-50G' },
          { ten_bien_the: 'Bó 100g', don_vi_tinh: 'bó', gia_ban: 12000, gia_goc: 15000, ma_sku: 'RGV-THILA-100G' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Lá chanh',
      mo_ta: 'Lá chanh tươi xanh đậm, mùi thơm nồng cay. Gia vị đặc biệt cho gà nướng, thịt luộc và các món hấp.',
      xuat_xu: 'Bến Tre',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.rauGiaVi,
      anh_san_pham: { create: [{ duong_dan_anh: herbImages[2], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Bó 30g', don_vi_tinh: 'bó', gia_ban: 5000, gia_goc: 7000, ma_sku: 'RGV-LACHANH-30G' },
          { ten_bien_the: 'Bó 60g', don_vi_tinh: 'bó', gia_ban: 9000, gia_goc: 12000, ma_sku: 'RGV-LACHANH-60G' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Lá quế',
      mo_ta: 'Lá quế tươi mùi thơm ngọt ấm, vị hơi cay. Dùng kho thịt, nấu phở hoặc pha trà quế.',
      xuat_xu: 'Yên Bái',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.rauGiaVi,
      anh_san_pham: { create: [{ duong_dan_anh: herbImages[0], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Bó 30g', don_vi_tinh: 'bó', gia_ban: 6000, gia_goc: 8000, ma_sku: 'RGV-LAQUE-30G' },
          { ten_bien_the: 'Bó 60g', don_vi_tinh: 'bó', gia_ban: 10000, gia_goc: 13000, ma_sku: 'RGV-LAQUE-60G' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Lá mắc mật',
      mo_ta: 'Lá mắc mật tươi thơm đặc trưng vùng Tây Bắc. Gia vị không thể thiếu cho thịt nướng, xúc xích hun khói.',
      xuat_xu: 'Lạng Sơn',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.rauGiaVi,
      anh_san_pham: { create: [{ duong_dan_anh: herbImages[1], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Bó 30g', don_vi_tinh: 'bó', gia_ban: 10000, gia_goc: 12000, ma_sku: 'RGV-MACMAT-30G' },
          { ten_bien_the: 'Bó 60g', don_vi_tinh: 'bó', gia_ban: 18000, gia_goc: 22000, ma_sku: 'RGV-MACMAT-60G' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Rau om',
      mo_ta: 'Rau om tươi thân mềm, mùi thơm hắc đặc trưng. Gia vị quan trọng cho lẩu mắm, canh chua miền Tây.',
      xuat_xu: 'Tiền Giang',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.rauGiaVi,
      anh_san_pham: { create: [{ duong_dan_anh: herbImages[2], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Bó 50g', don_vi_tinh: 'bó', gia_ban: 6000, gia_goc: 8000, ma_sku: 'RGV-RAUOM-50G' },
          { ten_bien_the: 'Bó 100g', don_vi_tinh: 'bó', gia_ban: 10000, gia_goc: 13000, ma_sku: 'RGV-RAUOM-100G' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Rau ngổ',
      mo_ta: 'Rau ngổ tươi thơm nồng, vị hơi đắng nhẹ. Nấu canh chua, lẩu hoặc ăn sống kèm các món cuốn.',
      xuat_xu: 'Tiền Giang',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.rauGiaVi,
      anh_san_pham: { create: [{ duong_dan_anh: herbImages[0], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Bó 50g', don_vi_tinh: 'bó', gia_ban: 6000, gia_goc: 8000, ma_sku: 'RGV-RAUNGO-50G' },
          { ten_bien_the: 'Bó 100g', don_vi_tinh: 'bó', gia_ban: 10000, gia_goc: 13000, ma_sku: 'RGV-RAUNGO-100G' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Hương thảo',
      mo_ta: 'Hương thảo tươi nhập từ vườn Đà Lạt, mùi thơm nồng kiểu Địa Trung Hải. Dùng ướp thịt nướng, làm sốt.',
      xuat_xu: 'Đà Lạt',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.rauGiaVi,
      anh_san_pham: { create: [{ duong_dan_anh: herbImages[1], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Bó 30g', don_vi_tinh: 'bó', gia_ban: 12000, gia_goc: 15000, ma_sku: 'RGV-HUONGTHAO-30G' },
          { ten_bien_the: 'Bó 60g', don_vi_tinh: 'bó', gia_ban: 20000, gia_goc: 25000, ma_sku: 'RGV-HUONGTHAO-60G' },
        ]
      }
    }
  });

  console.log('  ✅ Đã tạo 20 sản phẩm Rau gia vị');

  // ─── Category 13: Củ quả ăn quả ────────────────────────────────────

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Cà chua',
      mo_ta: 'Cà chua tươi chín đỏ mọng, vị chua ngọt tự nhiên. Thích hợp nấu canh, xào hoặc ép nước uống.',
      xuat_xu: 'Đà Lạt',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.cuQuaAnQua,
      anh_san_pham: { create: [{ duong_dan_anh: veggieImages[0], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Gói 500g', don_vi_tinh: 'gói', gia_ban: 25000, gia_goc: 30000, ma_sku: 'CQA-CACHUA-500G' },
          { ten_bien_the: 'Gói 1kg', don_vi_tinh: 'gói', gia_ban: 45000, gia_goc: 55000, ma_sku: 'CQA-CACHUA-1KG' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Dưa leo',
      mo_ta: 'Dưa leo tươi giòn mát, không đắng. Ăn sống, làm salad hoặc ngâm chua đều ngon.',
      xuat_xu: 'Đà Lạt',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.cuQuaAnQua,
      anh_san_pham: { create: [{ duong_dan_anh: veggieImages[1], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Gói 500g', don_vi_tinh: 'gói', gia_ban: 20000, gia_goc: 25000, ma_sku: 'CQA-DUALEO-500G' },
          { ten_bien_the: 'Gói 1kg', don_vi_tinh: 'gói', gia_ban: 35000, gia_goc: 42000, ma_sku: 'CQA-DUALEO-1KG' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Bí đỏ',
      mo_ta: 'Bí đỏ ruột vàng cam bột dẻo, vị ngọt bùi. Nấu canh, hầm xương hoặc làm bánh đều tuyệt.',
      xuat_xu: 'Bình Phước',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.cuQuaAnQua,
      anh_san_pham: { create: [{ duong_dan_anh: veggieImages[2], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Quả 1kg', don_vi_tinh: 'quả', gia_ban: 22000, gia_goc: 28000, ma_sku: 'CQA-BIDO-1KG' },
          { ten_bien_the: 'Quả 2kg', don_vi_tinh: 'quả', gia_ban: 40000, gia_goc: 50000, ma_sku: 'CQA-BIDO-2KG' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Bí xanh',
      mo_ta: 'Bí xanh (bí đao) tươi ruột trắng mát, ít calo. Nấu canh giải nhiệt, hầm xương rất ngọt nước.',
      xuat_xu: 'Tiền Giang',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.cuQuaAnQua,
      anh_san_pham: { create: [{ duong_dan_anh: veggieImages[0], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Quả 1kg', don_vi_tinh: 'quả', gia_ban: 18000, gia_goc: 22000, ma_sku: 'CQA-BIXANH-1KG' },
          { ten_bien_the: 'Quả 2kg', don_vi_tinh: 'quả', gia_ban: 32000, gia_goc: 40000, ma_sku: 'CQA-BIXANH-2KG' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Mướp hương',
      mo_ta: 'Mướp hương tươi non, ruột mềm ngọt tự nhiên. Nấu canh, xào lòng hoặc luộc chấm mắm đều ngon.',
      xuat_xu: 'Tiền Giang',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.cuQuaAnQua,
      anh_san_pham: { create: [{ duong_dan_anh: veggieImages[1], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Gói 500g', don_vi_tinh: 'gói', gia_ban: 18000, gia_goc: 22000, ma_sku: 'CQA-MUOP-500G' },
          { ten_bien_the: 'Gói 1kg', don_vi_tinh: 'gói', gia_ban: 32000, gia_goc: 40000, ma_sku: 'CQA-MUOP-1KG' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Khổ qua',
      mo_ta: 'Khổ qua (mướp đắng) tươi xanh, vị đắng thanh. Nhồi thịt nấu canh, xào trứng hoặc ép nước uống giải nhiệt.',
      xuat_xu: 'Tiền Giang',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.cuQuaAnQua,
      anh_san_pham: { create: [{ duong_dan_anh: veggieImages[2], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Gói 500g', don_vi_tinh: 'gói', gia_ban: 22000, gia_goc: 28000, ma_sku: 'CQA-KHOQUA-500G' },
          { ten_bien_the: 'Gói 1kg', don_vi_tinh: 'gói', gia_ban: 40000, gia_goc: 50000, ma_sku: 'CQA-KHOQUA-1KG' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Bầu',
      mo_ta: 'Bầu tươi non, ruột trắng mềm ngọt nước. Nấu canh tôm, canh cua hoặc xào tỏi đều rất ngon.',
      xuat_xu: 'Long An',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.cuQuaAnQua,
      anh_san_pham: { create: [{ duong_dan_anh: veggieImages[0], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Quả 1kg', don_vi_tinh: 'quả', gia_ban: 20000, gia_goc: 25000, ma_sku: 'CQA-BAU-1KG' },
          { ten_bien_the: 'Quả 2kg', don_vi_tinh: 'quả', gia_ban: 35000, gia_goc: 42000, ma_sku: 'CQA-BAU-2KG' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Cà tím',
      mo_ta: 'Cà tím tươi ruột trắng mềm, vỏ tím bóng. Nướng mỡ hành, kho tộ hoặc xào thịt rất đưa cơm.',
      xuat_xu: 'Tiền Giang',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.cuQuaAnQua,
      anh_san_pham: { create: [{ duong_dan_anh: veggieImages[1], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Gói 500g', don_vi_tinh: 'gói', gia_ban: 20000, gia_goc: 25000, ma_sku: 'CQA-CATIM-500G' },
          { ten_bien_the: 'Gói 1kg', don_vi_tinh: 'gói', gia_ban: 35000, gia_goc: 42000, ma_sku: 'CQA-CATIM-1KG' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Đậu bắp',
      mo_ta: 'Đậu bắp tươi non giòn, nhiều nhớt tốt cho tiêu hóa. Luộc chấm mắm, nướng hoặc xào tỏi.',
      xuat_xu: 'Long An',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.cuQuaAnQua,
      anh_san_pham: { create: [{ duong_dan_anh: veggieImages[2], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Gói 300g', don_vi_tinh: 'gói', gia_ban: 18000, gia_goc: 22000, ma_sku: 'CQA-DAUBAP-300G' },
          { ten_bien_the: 'Gói 500g', don_vi_tinh: 'gói', gia_ban: 28000, gia_goc: 35000, ma_sku: 'CQA-DAUBAP-500G' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Đậu que',
      mo_ta: 'Đậu que tươi xanh giòn, hạt nhỏ non. Xào tỏi, luộc chấm mắm hoặc nấu canh đều rất ngon.',
      xuat_xu: 'Đà Lạt',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.cuQuaAnQua,
      anh_san_pham: { create: [{ duong_dan_anh: veggieImages[0], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Gói 300g', don_vi_tinh: 'gói', gia_ban: 18000, gia_goc: 22000, ma_sku: 'CQA-DAUQUE-300G' },
          { ten_bien_the: 'Gói 500g', don_vi_tinh: 'gói', gia_ban: 28000, gia_goc: 35000, ma_sku: 'CQA-DAUQUE-500G' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Bắp ngọt',
      mo_ta: 'Bắp ngọt tươi hạt vàng mẩy, ngọt thanh. Luộc, nướng hoặc nấu súp đều thơm ngon.',
      xuat_xu: 'Đồng Nai',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.cuQuaAnQua,
      anh_san_pham: { create: [{ duong_dan_anh: veggieImages[1], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Gói 2 trái', don_vi_tinh: 'gói', gia_ban: 20000, gia_goc: 25000, ma_sku: 'CQA-BAPNGOT-2T' },
          { ten_bien_the: 'Gói 4 trái', don_vi_tinh: 'gói', gia_ban: 38000, gia_goc: 45000, ma_sku: 'CQA-BAPNGOT-4T' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Ớt chuông',
      mo_ta: 'Ớt chuông ba màu tươi giòn, vị ngọt nhẹ không cay. Xào, nướng hoặc ăn sống trong salad.',
      xuat_xu: 'Đà Lạt',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.cuQuaAnQua,
      anh_san_pham: { create: [{ duong_dan_anh: veggieImages[2], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Gói 300g', don_vi_tinh: 'gói', gia_ban: 30000, gia_goc: 38000, ma_sku: 'CQA-OTCHUONG-300G' },
          { ten_bien_the: 'Gói 500g', don_vi_tinh: 'gói', gia_ban: 48000, gia_goc: 58000, ma_sku: 'CQA-OTCHUONG-500G' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Su su',
      mo_ta: 'Su su tươi non, ruột trắng giòn ngọt. Xào thịt bò, nấu canh xương hoặc luộc chấm mắm.',
      xuat_xu: 'Đà Lạt',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.cuQuaAnQua,
      anh_san_pham: { create: [{ duong_dan_anh: veggieImages[0], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Gói 500g', don_vi_tinh: 'gói', gia_ban: 15000, gia_goc: 18000, ma_sku: 'CQA-SUSU-500G' },
          { ten_bien_the: 'Gói 1kg', don_vi_tinh: 'gói', gia_ban: 25000, gia_goc: 32000, ma_sku: 'CQA-SUSU-1KG' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Đu đủ xanh',
      mo_ta: 'Đu đủ xanh tươi giòn, thích hợp làm gỏi, nộm hoặc hầm chân giò lợi sữa.',
      xuat_xu: 'Tiền Giang',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.cuQuaAnQua,
      anh_san_pham: { create: [{ duong_dan_anh: veggieImages[1], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Quả 1kg', don_vi_tinh: 'quả', gia_ban: 25000, gia_goc: 30000, ma_sku: 'CQA-DUDU-1KG' },
          { ten_bien_the: 'Quả 2kg', don_vi_tinh: 'quả', gia_ban: 42000, gia_goc: 52000, ma_sku: 'CQA-DUDU-2KG' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Măng tây',
      mo_ta: 'Măng tây tươi xanh non, giòn ngọt thanh. Xào bơ tỏi, nướng hoặc luộc ăn kèm sốt đều rất ngon.',
      xuat_xu: 'Đà Lạt',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.cuQuaAnQua,
      anh_san_pham: { create: [{ duong_dan_anh: veggieImages[2], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Bó 200g', don_vi_tinh: 'bó', gia_ban: 45000, gia_goc: 55000, ma_sku: 'CQA-MANGTAY-200G' },
          { ten_bien_the: 'Bó 500g', don_vi_tinh: 'bó', gia_ban: 100000, gia_goc: 125000, ma_sku: 'CQA-MANGTAY-500G' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Măng tre',
      mo_ta: 'Măng tre tươi non giòn, vị ngọt nhẹ. Luộc, xào thịt hoặc nấu canh đều rất đưa cơm.',
      xuat_xu: 'Bình Phước',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.cuQuaAnQua,
      anh_san_pham: { create: [{ duong_dan_anh: veggieImages[0], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Gói 500g', don_vi_tinh: 'gói', gia_ban: 25000, gia_goc: 30000, ma_sku: 'CQA-MANGTRE-500G' },
          { ten_bien_the: 'Gói 1kg', don_vi_tinh: 'gói', gia_ban: 42000, gia_goc: 52000, ma_sku: 'CQA-MANGTRE-1KG' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Bông cải xanh',
      mo_ta: 'Bông cải xanh (broccoli) tươi giòn, giàu vitamin C và chất chống oxy hóa. Xào, luộc hoặc hấp đều ngon.',
      xuat_xu: 'Đà Lạt',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.cuQuaAnQua,
      anh_san_pham: { create: [{ duong_dan_anh: veggieImages[1], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Gói 300g', don_vi_tinh: 'gói', gia_ban: 30000, gia_goc: 38000, ma_sku: 'CQA-BCXANH-300G' },
          { ten_bien_the: 'Gói 500g', don_vi_tinh: 'gói', gia_ban: 48000, gia_goc: 58000, ma_sku: 'CQA-BCXANH-500G' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Bông cải trắng',
      mo_ta: 'Bông cải trắng tươi giòn mềm, vị nhạt dễ ăn. Xào, nấu súp hoặc làm salad đều phù hợp.',
      xuat_xu: 'Đà Lạt',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.cuQuaAnQua,
      anh_san_pham: { create: [{ duong_dan_anh: veggieImages[2], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Gói 300g', don_vi_tinh: 'gói', gia_ban: 25000, gia_goc: 30000, ma_sku: 'CQA-BCTRANG-300G' },
          { ten_bien_the: 'Gói 500g', don_vi_tinh: 'gói', gia_ban: 40000, gia_goc: 48000, ma_sku: 'CQA-BCTRANG-500G' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Bắp cải',
      mo_ta: 'Bắp cải tươi cuộn chặt, lá giòn ngọt mát. Làm salad, xào thịt hoặc muối dưa đều tuyệt vời.',
      xuat_xu: 'Đà Lạt',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.cuQuaAnQua,
      anh_san_pham: { create: [{ duong_dan_anh: veggieImages[0], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Quả 800g', don_vi_tinh: 'quả', gia_ban: 20000, gia_goc: 25000, ma_sku: 'CQA-BAPCAI-800G' },
          { ten_bien_the: 'Quả 1.5kg', don_vi_tinh: 'quả', gia_ban: 35000, gia_goc: 42000, ma_sku: 'CQA-BAPCAI-1K5' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Cải thảo',
      mo_ta: 'Cải thảo tươi xanh non, lá mềm ngọt thanh. Nấu lẩu, xào thịt bò hoặc muối kim chi đều ngon.',
      xuat_xu: 'Đà Lạt',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.cuQuaAnQua,
      anh_san_pham: { create: [{ duong_dan_anh: veggieImages[1], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Cây 800g', don_vi_tinh: 'cây', gia_ban: 22000, gia_goc: 28000, ma_sku: 'CQA-CAITHAO-800G' },
          { ten_bien_the: 'Cây 1.5kg', don_vi_tinh: 'cây', gia_ban: 38000, gia_goc: 45000, ma_sku: 'CQA-CAITHAO-1K5' },
        ]
      }
    }
  });

  console.log('  ✅ Đã tạo 20 sản phẩm Củ quả ăn quả');

  // ─── Category 14: Sản phẩm chế biến từ nông sản ────────────────────

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Dưa cải muối',
      mo_ta: 'Dưa cải muối chua giòn tự nhiên, lên men truyền thống. Ăn kèm cơm, nấu canh hoặc kho cá đều ngon.',
      xuat_xu: 'Bình Dương',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.cheBien,
      anh_san_pham: { create: [{ duong_dan_anh: processedImages[0], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Hũ 500g', don_vi_tinh: 'hũ', gia_ban: 35000, gia_goc: 42000, ma_sku: 'CB-DUACAI-500G' },
          { ten_bien_the: 'Hũ 1kg', don_vi_tinh: 'hũ', gia_ban: 60000, gia_goc: 72000, ma_sku: 'CB-DUACAI-1KG' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Kim chi rau củ',
      mo_ta: 'Kim chi rau củ muối cay theo phong cách Việt Nam, lên men tự nhiên. Giàu probiotic tốt cho tiêu hóa.',
      xuat_xu: 'TP. Hồ Chí Minh',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.cheBien,
      anh_san_pham: { create: [{ duong_dan_anh: processedImages[1], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Hũ 400g', don_vi_tinh: 'hũ', gia_ban: 55000, gia_goc: 68000, ma_sku: 'CB-KIMCHI-400G' },
          { ten_bien_the: 'Hũ 800g', don_vi_tinh: 'hũ', gia_ban: 95000, gia_goc: 115000, ma_sku: 'CB-KIMCHI-800G' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Cà pháo muối',
      mo_ta: 'Cà pháo muối giòn tan, vị mặn chua vừa phải. Món ăn kèm truyền thống không thể thiếu trong bữa cơm.',
      xuat_xu: 'Bình Dương',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.cheBien,
      anh_san_pham: { create: [{ duong_dan_anh: processedImages[2], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Hũ 400g', don_vi_tinh: 'hũ', gia_ban: 30000, gia_goc: 38000, ma_sku: 'CB-CAPHAO-400G' },
          { ten_bien_the: 'Hũ 800g', don_vi_tinh: 'hũ', gia_ban: 52000, gia_goc: 65000, ma_sku: 'CB-CAPHAO-800G' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Măng chua',
      mo_ta: 'Măng chua ngâm truyền thống, giòn sần sật vị chua thanh. Nấu canh cá, xào hoặc ăn kèm bún đều ngon.',
      xuat_xu: 'Lâm Đồng',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.cheBien,
      anh_san_pham: { create: [{ duong_dan_anh: processedImages[0], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Hũ 500g', don_vi_tinh: 'hũ', gia_ban: 35000, gia_goc: 42000, ma_sku: 'CB-MANGCHUA-500G' },
          { ten_bien_the: 'Hũ 1kg', don_vi_tinh: 'hũ', gia_ban: 60000, gia_goc: 72000, ma_sku: 'CB-MANGCHUA-1KG' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Rau củ ngâm giấm',
      mo_ta: 'Rau củ ngâm giấm hỗn hợp gồm cà rốt, su hào, ớt. Giòn chua nhẹ, ăn kèm cơm tấm hoặc bánh mì.',
      xuat_xu: 'TP. Hồ Chí Minh',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.cheBien,
      anh_san_pham: { create: [{ duong_dan_anh: processedImages[1], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Hũ 400g', don_vi_tinh: 'hũ', gia_ban: 40000, gia_goc: 48000, ma_sku: 'CB-RAUCUNGAM-400G' },
          { ten_bien_the: 'Hũ 800g', don_vi_tinh: 'hũ', gia_ban: 70000, gia_goc: 85000, ma_sku: 'CB-RAUCUNGAM-800G' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Tỏi ngâm mật ong',
      mo_ta: 'Tỏi ngâm mật ong lên men tự nhiên, vị ngọt thanh. Tăng cường miễn dịch, tốt cho tim mạch.',
      xuat_xu: 'Lý Sơn',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.cheBien,
      anh_san_pham: { create: [{ duong_dan_anh: processedImages[2], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Hũ 250g', don_vi_tinh: 'hũ', gia_ban: 85000, gia_goc: 105000, ma_sku: 'CB-TOIMATONG-250G' },
          { ten_bien_the: 'Hũ 500g', don_vi_tinh: 'hũ', gia_ban: 150000, gia_goc: 185000, ma_sku: 'CB-TOIMATONG-500G' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Chanh đào mật ong',
      mo_ta: 'Chanh đào ngâm mật ong nguyên chất, vị chua ngọt thanh mát. Pha nước uống giải khát, tốt cho họng.',
      xuat_xu: 'Hà Nội',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.cheBien,
      anh_san_pham: { create: [{ duong_dan_anh: processedImages[0], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Hũ 300ml', don_vi_tinh: 'hũ', gia_ban: 95000, gia_goc: 120000, ma_sku: 'CB-CHANHDAO-300ML' },
          { ten_bien_the: 'Hũ 600ml', don_vi_tinh: 'hũ', gia_ban: 175000, gia_goc: 215000, ma_sku: 'CB-CHANHDAO-600ML' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Sốt cà chua',
      mo_ta: 'Sốt cà chua homemade từ cà chua tươi Đà Lạt. Không chất bảo quản, dùng cho pasta, pizza hoặc chấm.',
      xuat_xu: 'Đà Lạt',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.cheBien,
      anh_san_pham: { create: [{ duong_dan_anh: processedImages[1], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Chai 250ml', don_vi_tinh: 'chai', gia_ban: 45000, gia_goc: 55000, ma_sku: 'CB-SOTCACHUA-250ML' },
          { ten_bien_the: 'Chai 500ml', don_vi_tinh: 'chai', gia_ban: 78000, gia_goc: 95000, ma_sku: 'CB-SOTCACHUA-500ML' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Tương ớt',
      mo_ta: 'Tương ớt homemade cay thơm, từ ớt tươi xay nhuyễn. Không phẩm màu, gia vị chấm đa năng.',
      xuat_xu: 'Bình Dương',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.cheBien,
      anh_san_pham: { create: [{ duong_dan_anh: processedImages[2], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Chai 250ml', don_vi_tinh: 'chai', gia_ban: 35000, gia_goc: 42000, ma_sku: 'CB-TUONGOT-250ML' },
          { ten_bien_the: 'Chai 500ml', don_vi_tinh: 'chai', gia_ban: 60000, gia_goc: 72000, ma_sku: 'CB-TUONGOT-500ML' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Sa tế',
      mo_ta: 'Sa tế ớt thơm cay nồng, làm từ ớt khô và dầu ăn chất lượng. Gia vị cho lẩu, mì và các món nước.',
      xuat_xu: 'TP. Hồ Chí Minh',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.cheBien,
      anh_san_pham: { create: [{ duong_dan_anh: processedImages[0], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Hũ 200g', don_vi_tinh: 'hũ', gia_ban: 40000, gia_goc: 48000, ma_sku: 'CB-SATE-200G' },
          { ten_bien_the: 'Hũ 400g', don_vi_tinh: 'hũ', gia_ban: 70000, gia_goc: 85000, ma_sku: 'CB-SATE-400G' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Mứt dừa',
      mo_ta: 'Mứt dừa truyền thống sợi dài dẻo ngọt. Được làm thủ công từ cơm dừa tươi Bến Tre.',
      xuat_xu: 'Bến Tre',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.cheBien,
      anh_san_pham: { create: [{ duong_dan_anh: processedImages[1], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Hộp 300g', don_vi_tinh: 'hộp', gia_ban: 55000, gia_goc: 68000, ma_sku: 'CB-MUTDUA-300G' },
          { ten_bien_the: 'Hộp 500g', don_vi_tinh: 'hộp', gia_ban: 85000, gia_goc: 105000, ma_sku: 'CB-MUTDUA-500G' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Mứt gừng',
      mo_ta: 'Mứt gừng thủ công vị cay ấm ngọt thanh. Ăn vặt ngày Tết, pha trà gừng giải cảm.',
      xuat_xu: 'Hưng Yên',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.cheBien,
      anh_san_pham: { create: [{ duong_dan_anh: processedImages[2], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Hộp 200g', don_vi_tinh: 'hộp', gia_ban: 45000, gia_goc: 55000, ma_sku: 'CB-MUTGUNG-200G' },
          { ten_bien_the: 'Hộp 400g', don_vi_tinh: 'hộp', gia_ban: 80000, gia_goc: 98000, ma_sku: 'CB-MUTGUNG-400G' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Mứt bí',
      mo_ta: 'Mứt bí đao trong suốt dẻo ngọt, làm thủ công truyền thống. Món ăn vặt quen thuộc ngày Tết.',
      xuat_xu: 'Bình Dương',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.cheBien,
      anh_san_pham: { create: [{ duong_dan_anh: processedImages[0], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Hộp 300g', don_vi_tinh: 'hộp', gia_ban: 42000, gia_goc: 52000, ma_sku: 'CB-MUTBI-300G' },
          { ten_bien_the: 'Hộp 500g', don_vi_tinh: 'hộp', gia_ban: 72000, gia_goc: 88000, ma_sku: 'CB-MUTBI-500G' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Mứt hạt sen',
      mo_ta: 'Mứt hạt sen Huế bùi ngọt thanh nhã. Làm từ hạt sen tươi, sên đường thủ công truyền thống.',
      xuat_xu: 'Huế',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.cheBien,
      anh_san_pham: { create: [{ duong_dan_anh: processedImages[1], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Hộp 200g', don_vi_tinh: 'hộp', gia_ban: 75000, gia_goc: 92000, ma_sku: 'CB-MUTSEN-200G' },
          { ten_bien_the: 'Hộp 400g', don_vi_tinh: 'hộp', gia_ban: 135000, gia_goc: 165000, ma_sku: 'CB-MUTSEN-400G' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Nước ép cam',
      mo_ta: 'Nước ép cam tươi nguyên chất 100%, không đường không chất bảo quản. Giàu vitamin C tăng sức đề kháng.',
      xuat_xu: 'Vĩnh Long',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.cheBien,
      anh_san_pham: { create: [{ duong_dan_anh: processedImages[2], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Chai 350ml', don_vi_tinh: 'chai', gia_ban: 35000, gia_goc: 42000, ma_sku: 'CB-NUEPCAM-350ML' },
          { ten_bien_the: 'Chai 1L', don_vi_tinh: 'chai', gia_ban: 85000, gia_goc: 105000, ma_sku: 'CB-NUEPCAM-1L' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Nước ép ổi',
      mo_ta: 'Nước ép ổi tươi hồng ngọt tự nhiên, giàu vitamin C và lycopene. Thức uống bổ dưỡng cho cả gia đình.',
      xuat_xu: 'Tiền Giang',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.cheBien,
      anh_san_pham: { create: [{ duong_dan_anh: processedImages[0], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Chai 350ml', don_vi_tinh: 'chai', gia_ban: 30000, gia_goc: 38000, ma_sku: 'CB-NUEPOI-350ML' },
          { ten_bien_the: 'Chai 1L', don_vi_tinh: 'chai', gia_ban: 75000, gia_goc: 92000, ma_sku: 'CB-NUEPOI-1L' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Nước ép dứa',
      mo_ta: 'Nước ép dứa (thơm) tươi vị chua ngọt sảng khoái. Hỗ trợ tiêu hóa và giải nhiệt hiệu quả.',
      xuat_xu: 'Tiền Giang',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.cheBien,
      anh_san_pham: { create: [{ duong_dan_anh: processedImages[1], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Chai 350ml', don_vi_tinh: 'chai', gia_ban: 30000, gia_goc: 38000, ma_sku: 'CB-NUEPDUA-350ML' },
          { ten_bien_the: 'Chai 1L', don_vi_tinh: 'chai', gia_ban: 72000, gia_goc: 88000, ma_sku: 'CB-NUEPDUA-1L' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Sinh tố trái cây',
      mo_ta: 'Sinh tố trái cây hỗn hợp từ xoài, chuối, dứa tươi. Đóng chai tiện lợi, bổ sung năng lượng mỗi ngày.',
      xuat_xu: 'TP. Hồ Chí Minh',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.cheBien,
      anh_san_pham: { create: [{ duong_dan_anh: processedImages[2], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Chai 350ml', don_vi_tinh: 'chai', gia_ban: 38000, gia_goc: 45000, ma_sku: 'CB-SINHTO-350ML' },
          { ten_bien_the: 'Chai 750ml', don_vi_tinh: 'chai', gia_ban: 68000, gia_goc: 82000, ma_sku: 'CB-SINHTO-750ML' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Trà đóng chai',
      mo_ta: 'Trà xanh đóng chai từ lá trà Thái Nguyên, không đường. Thức uống thanh mát, tiện lợi mang đi.',
      xuat_xu: 'Thái Nguyên',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.cheBien,
      anh_san_pham: { create: [{ duong_dan_anh: processedImages[0], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Chai 350ml', don_vi_tinh: 'chai', gia_ban: 20000, gia_goc: 25000, ma_sku: 'CB-TRADONGCHAI-350ML' },
          { ten_bien_the: 'Chai 1L', don_vi_tinh: 'chai', gia_ban: 45000, gia_goc: 55000, ma_sku: 'CB-TRADONGCHAI-1L' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Sữa hạt',
      mo_ta: 'Sữa hạt hỗn hợp từ hạt điều, hạnh nhân và yến mạch. Thức uống thực vật giàu dinh dưỡng.',
      xuat_xu: 'TP. Hồ Chí Minh',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.cheBien,
      anh_san_pham: { create: [{ duong_dan_anh: processedImages[1], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Chai 500ml', don_vi_tinh: 'chai', gia_ban: 55000, gia_goc: 68000, ma_sku: 'CB-SUAHAT-500ML' },
          { ten_bien_the: 'Chai 1L', don_vi_tinh: 'chai', gia_ban: 95000, gia_goc: 115000, ma_sku: 'CB-SUAHAT-1L' },
        ]
      }
    }
  });

  console.log('  ✅ Đã tạo 20 sản phẩm Sản phẩm chế biến');

  // ─── Category 15: Sữa hạt ──────────────────────────────────────────

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Sữa hạt điều',
      mo_ta: 'Sữa hạt điều nguyên chất, béo ngậy thơm lừng. Giàu chất béo tốt, protein thực vật và vitamin E.',
      xuat_xu: 'Bình Phước',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.suaHat,
      anh_san_pham: { create: [{ duong_dan_anh: milkImages[0], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Chai 500ml', don_vi_tinh: 'chai', gia_ban: 55000, gia_goc: 68000, ma_sku: 'SH-DIEU-500ML' },
          { ten_bien_the: 'Chai 1L', don_vi_tinh: 'chai', gia_ban: 95000, gia_goc: 118000, ma_sku: 'SH-DIEU-1L' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Sữa hạt macca',
      mo_ta: 'Sữa hạt macca thơm béo, vị ngọt dịu tự nhiên. Bổ sung omega-7 và chất béo không bão hòa.',
      xuat_xu: 'Lâm Đồng',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.suaHat,
      anh_san_pham: { create: [{ duong_dan_anh: milkImages[1], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Chai 500ml', don_vi_tinh: 'chai', gia_ban: 75000, gia_goc: 92000, ma_sku: 'SH-MACCA-500ML' },
          { ten_bien_the: 'Chai 1L', don_vi_tinh: 'chai', gia_ban: 135000, gia_goc: 165000, ma_sku: 'SH-MACCA-1L' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Sữa đậu nành',
      mo_ta: 'Sữa đậu nành tươi nguyên chất, không đường. Giàu protein thực vật và isoflavone tốt cho sức khỏe.',
      xuat_xu: 'TP. Hồ Chí Minh',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.suaHat,
      anh_san_pham: { create: [{ duong_dan_anh: milkImages[2], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Chai 500ml', don_vi_tinh: 'chai', gia_ban: 28000, gia_goc: 35000, ma_sku: 'SH-DAUNANH-500ML' },
          { ten_bien_the: 'Chai 1L', don_vi_tinh: 'chai', gia_ban: 48000, gia_goc: 58000, ma_sku: 'SH-DAUNANH-1L' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Sữa hạt óc chó',
      mo_ta: 'Sữa hạt óc chó thơm bùi, giàu omega-3 tốt cho não bộ. Thức uống lý tưởng cho trẻ em và người lớn tuổi.',
      xuat_xu: 'TP. Hồ Chí Minh',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.suaHat,
      anh_san_pham: { create: [{ duong_dan_anh: milkImages[0], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Chai 500ml', don_vi_tinh: 'chai', gia_ban: 72000, gia_goc: 88000, ma_sku: 'SH-OCCHO-500ML' },
          { ten_bien_the: 'Chai 1L', don_vi_tinh: 'chai', gia_ban: 128000, gia_goc: 158000, ma_sku: 'SH-OCCHO-1L' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Sữa hạnh nhân',
      mo_ta: 'Sữa hạnh nhân ít calo, vị thơm nhẹ dễ uống. Phù hợp cho người ăn kiêng và người không dung nạp lactose.',
      xuat_xu: 'TP. Hồ Chí Minh',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.suaHat,
      anh_san_pham: { create: [{ duong_dan_anh: milkImages[1], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Chai 500ml', don_vi_tinh: 'chai', gia_ban: 65000, gia_goc: 80000, ma_sku: 'SH-HANHNHAN-500ML' },
          { ten_bien_the: 'Chai 1L', don_vi_tinh: 'chai', gia_ban: 115000, gia_goc: 142000, ma_sku: 'SH-HANHNHAN-1L' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Sữa yến mạch',
      mo_ta: 'Sữa yến mạch mịn mượt, vị ngọt tự nhiên từ yến mạch. Giàu chất xơ beta-glucan tốt cho tim mạch.',
      xuat_xu: 'TP. Hồ Chí Minh',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.suaHat,
      anh_san_pham: { create: [{ duong_dan_anh: milkImages[2], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Chai 500ml', don_vi_tinh: 'chai', gia_ban: 52000, gia_goc: 65000, ma_sku: 'SH-YENMACH-500ML' },
          { ten_bien_the: 'Chai 1L', don_vi_tinh: 'chai', gia_ban: 92000, gia_goc: 112000, ma_sku: 'SH-YENMACH-1L' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Sữa gạo lứt',
      mo_ta: 'Sữa gạo lứt thơm ngon bổ dưỡng, vị ngọt thanh tự nhiên. Giàu vitamin B và chất xơ.',
      xuat_xu: 'Sóc Trăng',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.suaHat,
      anh_san_pham: { create: [{ duong_dan_anh: milkImages[0], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Chai 500ml', don_vi_tinh: 'chai', gia_ban: 38000, gia_goc: 45000, ma_sku: 'SH-GAOLUT-500ML' },
          { ten_bien_the: 'Chai 1L', don_vi_tinh: 'chai', gia_ban: 65000, gia_goc: 80000, ma_sku: 'SH-GAOLUT-1L' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Sữa hạt sen',
      mo_ta: 'Sữa hạt sen thanh mát, vị bùi ngọt nhẹ. Tốt cho giấc ngủ và hệ thần kinh, phù hợp uống buổi tối.',
      xuat_xu: 'Huế',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.suaHat,
      anh_san_pham: { create: [{ duong_dan_anh: milkImages[1], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Chai 500ml', don_vi_tinh: 'chai', gia_ban: 48000, gia_goc: 58000, ma_sku: 'SH-HATSEN-500ML' },
          { ten_bien_the: 'Chai 1L', don_vi_tinh: 'chai', gia_ban: 85000, gia_goc: 105000, ma_sku: 'SH-HATSEN-1L' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Sữa dừa',
      mo_ta: 'Sữa dừa tươi nguyên chất, béo ngậy thơm lừng. Dùng uống trực tiếp hoặc pha chế đồ uống, nấu ăn.',
      xuat_xu: 'Bến Tre',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.suaHat,
      anh_san_pham: { create: [{ duong_dan_anh: milkImages[2], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Chai 500ml', don_vi_tinh: 'chai', gia_ban: 35000, gia_goc: 42000, ma_sku: 'SH-DUA-500ML' },
          { ten_bien_the: 'Chai 1L', don_vi_tinh: 'chai', gia_ban: 60000, gia_goc: 72000, ma_sku: 'SH-DUA-1L' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Sữa hạt chia',
      mo_ta: 'Sữa hạt chia giàu omega-3 và chất xơ. Hỗ trợ tiêu hóa, kiểm soát cân nặng hiệu quả.',
      xuat_xu: 'TP. Hồ Chí Minh',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.suaHat,
      anh_san_pham: { create: [{ duong_dan_anh: milkImages[0], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Chai 500ml', don_vi_tinh: 'chai', gia_ban: 58000, gia_goc: 72000, ma_sku: 'SH-CHIA-500ML' },
          { ten_bien_the: 'Chai 1L', don_vi_tinh: 'chai', gia_ban: 100000, gia_goc: 125000, ma_sku: 'SH-CHIA-1L' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Sữa đậu đen',
      mo_ta: 'Sữa đậu đen xanh lòng thơm bùi, màu tím đen tự nhiên. Tốt cho thận, bổ máu và giải nhiệt.',
      xuat_xu: 'TP. Hồ Chí Minh',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.suaHat,
      anh_san_pham: { create: [{ duong_dan_anh: milkImages[1], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Chai 500ml', don_vi_tinh: 'chai', gia_ban: 32000, gia_goc: 40000, ma_sku: 'SH-DAUDEN-500ML' },
          { ten_bien_the: 'Chai 1L', don_vi_tinh: 'chai', gia_ban: 55000, gia_goc: 68000, ma_sku: 'SH-DAUDEN-1L' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Sữa mè đen',
      mo_ta: 'Sữa mè đen (vừng đen) béo thơm, giàu canxi và sắt. Bổ sung dinh dưỡng cho xương và tóc.',
      xuat_xu: 'TP. Hồ Chí Minh',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.suaHat,
      anh_san_pham: { create: [{ duong_dan_anh: milkImages[2], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Chai 500ml', don_vi_tinh: 'chai', gia_ban: 42000, gia_goc: 52000, ma_sku: 'SH-MEDEN-500ML' },
          { ten_bien_the: 'Chai 1L', don_vi_tinh: 'chai', gia_ban: 72000, gia_goc: 88000, ma_sku: 'SH-MEDEN-1L' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Sữa bắp',
      mo_ta: 'Sữa bắp non ngọt thơm tự nhiên, màu vàng đẹp mắt. Thức uống bổ dưỡng giàu vitamin A và lutein.',
      xuat_xu: 'Đồng Nai',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.suaHat,
      anh_san_pham: { create: [{ duong_dan_anh: milkImages[0], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Chai 500ml', don_vi_tinh: 'chai', gia_ban: 30000, gia_goc: 38000, ma_sku: 'SH-BAP-500ML' },
          { ten_bien_the: 'Chai 1L', don_vi_tinh: 'chai', gia_ban: 52000, gia_goc: 65000, ma_sku: 'SH-BAP-1L' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Sữa khoai môn',
      mo_ta: 'Sữa khoai môn tím ngọt dẻo, màu tím lavender bắt mắt. Thức uống thơm ngon từ khoai môn tươi.',
      xuat_xu: 'Vĩnh Long',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.suaHat,
      anh_san_pham: { create: [{ duong_dan_anh: milkImages[1], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Chai 500ml', don_vi_tinh: 'chai', gia_ban: 35000, gia_goc: 42000, ma_sku: 'SH-KHOAIMON-500ML' },
          { ten_bien_the: 'Chai 1L', don_vi_tinh: 'chai', gia_ban: 60000, gia_goc: 72000, ma_sku: 'SH-KHOAIMON-1L' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Sữa đậu xanh',
      mo_ta: 'Sữa đậu xanh mát lành, vị ngọt thanh tự nhiên. Giải nhiệt cơ thể, tốt cho da và hệ tiêu hóa.',
      xuat_xu: 'TP. Hồ Chí Minh',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.suaHat,
      anh_san_pham: { create: [{ duong_dan_anh: milkImages[2], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Chai 500ml', don_vi_tinh: 'chai', gia_ban: 30000, gia_goc: 38000, ma_sku: 'SH-DAUXANH-500ML' },
          { ten_bien_the: 'Chai 1L', don_vi_tinh: 'chai', gia_ban: 52000, gia_goc: 65000, ma_sku: 'SH-DAUXANH-1L' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Sữa quinoa',
      mo_ta: 'Sữa quinoa giàu protein hoàn chỉnh, chứa đủ 9 amino acid thiết yếu. Lựa chọn dinh dưỡng cao cấp.',
      xuat_xu: 'TP. Hồ Chí Minh',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.suaHat,
      anh_san_pham: { create: [{ duong_dan_anh: milkImages[0], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Chai 500ml', don_vi_tinh: 'chai', gia_ban: 78000, gia_goc: 95000, ma_sku: 'SH-QUINOA-500ML' },
          { ten_bien_the: 'Chai 1L', don_vi_tinh: 'chai', gia_ban: 140000, gia_goc: 172000, ma_sku: 'SH-QUINOA-1L' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Sữa hạt lanh',
      mo_ta: 'Sữa hạt lanh giàu omega-3 ALA và lignans. Hỗ trợ sức khỏe tim mạch và cân bằng nội tiết.',
      xuat_xu: 'TP. Hồ Chí Minh',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.suaHat,
      anh_san_pham: { create: [{ duong_dan_anh: milkImages[1], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Chai 500ml', don_vi_tinh: 'chai', gia_ban: 62000, gia_goc: 75000, ma_sku: 'SH-HATLANH-500ML' },
          { ten_bien_the: 'Chai 1L', don_vi_tinh: 'chai', gia_ban: 110000, gia_goc: 135000, ma_sku: 'SH-HATLANH-1L' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Sữa hạt bí',
      mo_ta: 'Sữa hạt bí ngô giàu kẽm và magiê. Tốt cho hệ miễn dịch, tiền liệt tuyến và sức khỏe nam giới.',
      xuat_xu: 'TP. Hồ Chí Minh',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.suaHat,
      anh_san_pham: { create: [{ duong_dan_anh: milkImages[2], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Chai 500ml', don_vi_tinh: 'chai', gia_ban: 58000, gia_goc: 72000, ma_sku: 'SH-HATBI-500ML' },
          { ten_bien_the: 'Chai 1L', don_vi_tinh: 'chai', gia_ban: 100000, gia_goc: 125000, ma_sku: 'SH-HATBI-1L' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Sữa hạt hướng dương',
      mo_ta: 'Sữa hạt hướng dương giàu vitamin E và selenium. Chống oxy hóa mạnh, tốt cho da và tóc.',
      xuat_xu: 'TP. Hồ Chí Minh',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.suaHat,
      anh_san_pham: { create: [{ duong_dan_anh: milkImages[0], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Chai 500ml', don_vi_tinh: 'chai', gia_ban: 52000, gia_goc: 65000, ma_sku: 'SH-HUONGDUONG-500ML' },
          { ten_bien_the: 'Chai 1L', don_vi_tinh: 'chai', gia_ban: 92000, gia_goc: 112000, ma_sku: 'SH-HUONGDUONG-1L' },
        ]
      }
    }
  });

  await prisma.san_pham.create({
    data: {
      ten_san_pham: 'Sữa ngũ cốc',
      mo_ta: 'Sữa ngũ cốc hỗn hợp từ 5 loại hạt: yến mạch, gạo lứt, đậu nành, mè đen, hạt sen. Dinh dưỡng toàn diện.',
      xuat_xu: 'TP. Hồ Chí Minh',
      trang_thai: 'DANG_BAN',
      ma_danh_muc: categoryIds.suaHat,
      anh_san_pham: { create: [{ duong_dan_anh: milkImages[1], la_anh_chinh: true }] },
      bien_the_san_pham: {
        create: [
          { ten_bien_the: 'Chai 500ml', don_vi_tinh: 'chai', gia_ban: 45000, gia_goc: 55000, ma_sku: 'SH-NGUCOC-500ML' },
          { ten_bien_the: 'Chai 1L', don_vi_tinh: 'chai', gia_ban: 78000, gia_goc: 95000, ma_sku: 'SH-NGUCOC-1L' },
        ]
      }
    }
  });

  console.log('  ✅ Đã tạo 20 sản phẩm Sữa hạt');
  console.log('\n🎉 Hoàn thành seed 100 sản phẩm cho danh mục 11-15!');
}
