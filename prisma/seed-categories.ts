import prisma from '../src/lib/prisma';

export async function seedCategoriesAndProducts1() {
  // Create 15 categories
  const rauAnLa = await prisma.danh_muc.create({ data: { ten_danh_muc: "Rau ăn lá" } });
  const rauCu = await prisma.danh_muc.create({ data: { ten_danh_muc: "Rau củ" } });
  const traiCay = await prisma.danh_muc.create({ data: { ten_danh_muc: "Trái cây" } });
  const gaoNguCoc = await prisma.danh_muc.create({ data: { ten_danh_muc: "Gạo & ngũ cốc" } });
  const namTuoi = await prisma.danh_muc.create({ data: { ten_danh_muc: "Nấm tươi" } });
  const giaViTuoi = await prisma.danh_muc.create({ data: { ten_danh_muc: "Gia vị tươi" } });
  const hatDau = await prisma.danh_muc.create({ data: { ten_danh_muc: "Hạt & đậu" } });
  const traHoa = await prisma.danh_muc.create({ data: { ten_danh_muc: "Trà & hoa thảo mộc" } });
  const matOng = await prisma.danh_muc.create({ data: { ten_danh_muc: "Mật ong & sản phẩm ong" } });
  const dacSanKho = await prisma.danh_muc.create({ data: { ten_danh_muc: "Đặc sản khô" } });
  const nongSanHuuCo = await prisma.danh_muc.create({ data: { ten_danh_muc: "Nông sản hữu cơ" } });
  const rauGiaVi = await prisma.danh_muc.create({ data: { ten_danh_muc: "Rau gia vị" } });
  const cuQuaAnQua = await prisma.danh_muc.create({ data: { ten_danh_muc: "Củ quả ăn quả" } });
  const sanPhamCheBien = await prisma.danh_muc.create({ data: { ten_danh_muc: "Sản phẩm chế biến từ nông sản" } });
  const suaHat = await prisma.danh_muc.create({ data: { ten_danh_muc: "Sữa hạt" } });

  const categories = {
    rauAnLa,
    rauCu,
    traiCay,
    gaoNguCoc,
    namTuoi,
    giaViTuoi,
    hatDau,
    traHoa,
    matOng,
    dacSanKho,
    nongSanHuuCo,
    rauGiaVi,
    cuQuaAnQua,
    sanPhamCheBien,
    suaHat,
  };

  // Category 1 - Rau ăn lá (20 products)
  const rauAnLaProducts = [
    { ten: "Rau muống", moTa: "Rau muống tươi xanh, giòn ngọt, thích hợp xào tỏi hoặc luộc chấm kho quẹt.", xuatXu: "Long An", sku: "RAL-RMUONG", gia1: 15000, gia2: 35000, don_vi_1: "300g", don_vi_2: "1kg" },
    { ten: "Cải thìa", moTa: "Cải thìa baby non mềm, vị ngọt thanh, phù hợp nấu canh hoặc xào.", xuatXu: "Đà Lạt, Lâm Đồng", sku: "RAL-CTHIA", gia1: 18000, gia2: 42000, don_vi_1: "300g", don_vi_2: "1kg" },
    { ten: "Cải ngọt", moTa: "Cải ngọt Đà Lạt lá xanh mướt, thân giòn, nấu canh ngọt nước tự nhiên.", xuatXu: "Đà Lạt, Lâm Đồng", sku: "RAL-CNGOT", gia1: 16000, gia2: 38000, don_vi_1: "300g", don_vi_2: "1kg" },
    { ten: "Cải xanh", moTa: "Cải xanh tươi non, vị hơi đắng nhẹ, giàu vitamin C và chất xơ.", xuatXu: "Hóc Môn, TP.HCM", sku: "RAL-CXANH", gia1: 15000, gia2: 35000, don_vi_1: "300g", don_vi_2: "1kg" },
    { ten: "Xà lách", moTa: "Xà lách lô lô xanh giòn, tươi mát, lý tưởng cho salad và cuốn thịt nướng.", xuatXu: "Đà Lạt, Lâm Đồng", sku: "RAL-XLACH", gia1: 20000, gia2: 50000, don_vi_1: "300g", don_vi_2: "1kg" },
    { ten: "Rau dền", moTa: "Rau dền đỏ tươi non, giàu sắt, nấu canh ngọt thanh bổ dưỡng.", xuatXu: "Củ Chi, TP.HCM", sku: "RAL-RDEN", gia1: 14000, gia2: 32000, don_vi_1: "300g", don_vi_2: "1kg" },
    { ten: "Mồng tơi", moTa: "Mồng tơi lá to mướt, nấu canh có vị thanh mát, giải nhiệt mùa hè.", xuatXu: "Long An", sku: "RAL-MTOI", gia1: 14000, gia2: 30000, don_vi_1: "300g", don_vi_2: "1kg" },
    { ten: "Rau lang", moTa: "Đọt rau lang non mềm, luộc chấm nước mắm tỏi ớt cực ngon.", xuatXu: "Tây Ninh", sku: "RAL-RLANG", gia1: 12000, gia2: 28000, don_vi_1: "300g", don_vi_2: "1kg" },
    { ten: "Cải bó xôi", moTa: "Cải bó xôi (spinach) Đà Lạt, giàu sắt và vitamin, phù hợp xào bơ tỏi.", xuatXu: "Đà Lạt, Lâm Đồng", sku: "RAL-CBOXOI", gia1: 25000, gia2: 60000, don_vi_1: "300g", don_vi_2: "1kg" },
    { ten: "Rau cần", moTa: "Rau cần nước thân trắng giòn, nấu lẩu hoặc xào thịt bò đều rất ngon.", xuatXu: "Đà Lạt, Lâm Đồng", sku: "RAL-RCAN", gia1: 22000, gia2: 55000, don_vi_1: "300g", don_vi_2: "1kg" },
    { ten: "Tần ô", moTa: "Tần ô (cải cúc) thơm đặc trưng, không thể thiếu trong món lẩu.", xuatXu: "Đà Lạt, Lâm Đồng", sku: "RAL-TANO", gia1: 20000, gia2: 48000, don_vi_1: "300g", don_vi_2: "1kg" },
    { ten: "Diếp cá", moTa: "Diếp cá tươi xanh, vị hơi tanh đặc trưng, ăn sống kèm bánh xèo.", xuatXu: "Củ Chi, TP.HCM", sku: "RAL-DIEPCA", gia1: 18000, gia2: 42000, don_vi_1: "200g", don_vi_2: "500g" },
    { ten: "Húng quế", moTa: "Húng quế lá nhỏ thơm nồng, gia vị quan trọng cho phở và gỏi cuốn.", xuatXu: "Hóc Môn, TP.HCM", sku: "RAL-HQUE", gia1: 16000, gia2: 38000, don_vi_1: "200g", don_vi_2: "500g" },
    { ten: "Rau răm", moTa: "Rau răm lá nhọn thơm cay, gia vị truyền thống ăn kèm trứng vịt lộn.", xuatXu: "Long An", sku: "RAL-RRAM", gia1: 15000, gia2: 35000, don_vi_1: "200g", don_vi_2: "500g" },
    { ten: "Kinh giới", moTa: "Kinh giới tươi thơm mát, rau sống ăn kèm bún đậu mắm tôm.", xuatXu: "Hà Nội", sku: "RAL-KGIOI", gia1: 16000, gia2: 38000, don_vi_1: "200g", don_vi_2: "500g" },
    { ten: "Tía tô", moTa: "Tía tô lá tím đặc trưng, vừa là rau gia vị vừa có tác dụng giải cảm.", xuatXu: "Hà Nội", sku: "RAL-TIATO", gia1: 18000, gia2: 42000, don_vi_1: "200g", don_vi_2: "500g" },
    { ten: "Ngò rí", moTa: "Ngò rí (rau mùi) thơm nồng, rắc lên phở hoặc nấu canh đều rất thơm.", xuatXu: "Đà Lạt, Lâm Đồng", sku: "RAL-NGORI", gia1: 16000, gia2: 38000, don_vi_1: "200g", don_vi_2: "500g" },
    { ten: "Hành lá", moTa: "Hành lá tươi xanh, gia vị cơ bản trong bếp Việt, phi hành thơm lừng.", xuatXu: "Củ Chi, TP.HCM", sku: "RAL-HANHLA", gia1: 12000, gia2: 28000, don_vi_1: "200g", don_vi_2: "500g" },
    { ten: "Lá lốt", moTa: "Lá lốt tươi xanh, cuốn thịt bò nướng thơm lừng, đậm đà hương vị.", xuatXu: "Bình Dương", sku: "RAL-LALOT", gia1: 15000, gia2: 35000, don_vi_1: "200g", don_vi_2: "500g" },
    { ten: "Bạc hà", moTa: "Bạc hà tươi mát lạnh, pha trà hoặc trang trí món ăn, giải nhiệt tốt.", xuatXu: "Đà Lạt, Lâm Đồng", sku: "RAL-BACHA", gia1: 20000, gia2: 48000, don_vi_1: "200g", don_vi_2: "500g" },
  ];

  const leafyImageIds = [
    "1540420773420-3366772f4999",
    "1576045057995-568f588f82fb",
    "1622206151226-18ca2c9ab4a1",
    "1619566636858-adf3ef46400b",
    "1540420773420-3366772f4999",
    "1576045057995-568f588f82fb",
    "1622206151226-18ca2c9ab4a1",
    "1619566636858-adf3ef46400b",
    "1540420773420-3366772f4999",
    "1576045057995-568f588f82fb",
    "1622206151226-18ca2c9ab4a1",
    "1619566636858-adf3ef46400b",
    "1540420773420-3366772f4999",
    "1576045057995-568f588f82fb",
    "1622206151226-18ca2c9ab4a1",
    "1619566636858-adf3ef46400b",
    "1540420773420-3366772f4999",
    "1576045057995-568f588f82fb",
    "1622206151226-18ca2c9ab4a1",
    "1619566636858-adf3ef46400b",
  ];

  for (let i = 0; i < rauAnLaProducts.length; i++) {
    const p = rauAnLaProducts[i];
    const product = await prisma.san_pham.create({
      data: {
        ma_danh_muc: rauAnLa.id,
        ten_san_pham: p.ten,
        mo_ta: p.moTa,
        xuat_xu: p.xuatXu,
        trang_thai: "DANG_BAN",
        ngay_tao: new Date(),
      },
    });

    await prisma.anh_san_pham.create({
      data: {
        ma_san_pham: product.id,
        duong_dan_anh: `https://images.unsplash.com/photo-${leafyImageIds[i]}?w=800`,
        la_anh_chinh: true,
      },
    });

    await prisma.bien_the_san_pham.createMany({
      data: [
        {
          ma_san_pham: product.id,
          ma_sku: `${p.sku}-${p.don_vi_1.toUpperCase().replace(/\s/g, '')}`,
          ten_bien_the: `Gói ${p.don_vi_1}`,
          don_vi_tinh: p.don_vi_1,
          gia_ban: p.gia1,
          gia_goc: Math.round(p.gia1 * 1.2),
        },
        {
          ma_san_pham: product.id,
          ma_sku: `${p.sku}-${p.don_vi_2.toUpperCase().replace(/\s/g, '')}`,
          ten_bien_the: `Gói ${p.don_vi_2}`,
          don_vi_tinh: p.don_vi_2,
          gia_ban: p.gia2,
          gia_goc: Math.round(p.gia2 * 1.2),
        },
      ],
    });
  }

  // Category 2 - Rau củ (20 products)
  const rauCuProducts = [
    { ten: "Cà rốt", moTa: "Cà rốt Đà Lạt tươi ngọt, giàu beta-carotene, dùng nấu canh hoặc ép nước.", xuatXu: "Đà Lạt, Lâm Đồng", sku: "RC-CAROT", gia1: 20000, gia2: 48000, don_vi_1: "500g", don_vi_2: "2kg" },
    { ten: "Khoai tây", moTa: "Khoai tây Đà Lạt vỏ mỏng ruột vàng, chiên giòn hay nấu canh đều ngon.", xuatXu: "Đà Lạt, Lâm Đồng", sku: "RC-KHTAY", gia1: 25000, gia2: 60000, don_vi_1: "500g", don_vi_2: "2kg" },
    { ten: "Khoai lang", moTa: "Khoai lang mật Nhật Bản ruột vàng cam, nướng dẻo ngọt tự nhiên.", xuatXu: "Vĩnh Long", sku: "RC-KHLANG", gia1: 30000, gia2: 70000, don_vi_1: "500g", don_vi_2: "2kg" },
    { ten: "Củ cải trắng", moTa: "Củ cải trắng tươi giòn, nấu canh xương heo ngọt nước thanh mát.", xuatXu: "Đà Lạt, Lâm Đồng", sku: "RC-CCAITRANG", gia1: 18000, gia2: 42000, don_vi_1: "500g", don_vi_2: "2kg" },
    { ten: "Củ dền", moTa: "Củ dền đỏ tươi, ép nước uống giàu sắt, tốt cho sức khỏe tim mạch.", xuatXu: "Đà Lạt, Lâm Đồng", sku: "RC-CDEN", gia1: 25000, gia2: 58000, don_vi_1: "500g", don_vi_2: "2kg" },
    { ten: "Su hào", moTa: "Su hào xanh tươi giòn ngọt, gọt vỏ ăn sống hoặc xào thịt bò.", xuatXu: "Hải Dương", sku: "RC-SUHAO", gia1: 15000, gia2: 35000, don_vi_1: "500g", don_vi_2: "2kg" },
    { ten: "Khoai môn", moTa: "Khoai môn dẻo bùi, nấu chè hoặc hấp ăn kèm dừa nạo rất thơm.", xuatXu: "Bến Tre", sku: "RC-KHMON", gia1: 28000, gia2: 65000, don_vi_1: "500g", don_vi_2: "2kg" },
    { ten: "Khoai sọ", moTa: "Khoai sọ vỏ nâu ruột trắng, nấu canh riêu cua hoặc hầm xương ngon.", xuatXu: "Hà Giang", sku: "RC-KHSO", gia1: 22000, gia2: 52000, don_vi_1: "500g", don_vi_2: "2kg" },
    { ten: "Sắn", moTa: "Sắn (khoai mì) tươi bột dẻo, luộc chấm muối mè hoặc làm bánh.", xuatXu: "Tây Ninh", sku: "RC-SAN", gia1: 18000, gia2: 40000, don_vi_1: "1kg", don_vi_2: "3kg" },
    { ten: "Củ năng", moTa: "Củ năng tươi giòn ngọt thanh, ăn sống hoặc nấu chè giải nhiệt.", xuatXu: "Long An", sku: "RC-CNANG", gia1: 30000, gia2: 72000, don_vi_1: "500g", don_vi_2: "2kg" },
    { ten: "Củ sen", moTa: "Củ sen trắng giòn, nấu canh sườn hoặc xào thịt, bổ dưỡng.", xuatXu: "Đồng Tháp", sku: "RC-CSEN", gia1: 35000, gia2: 85000, don_vi_1: "500g", don_vi_2: "2kg" },
    { ten: "Gừng", moTa: "Gừng tươi cay nồng, gia vị nấu ăn và pha trà gừng giải cảm.", xuatXu: "Hưng Yên", sku: "RC-GUNG", gia1: 20000, gia2: 50000, don_vi_1: "200g", don_vi_2: "1kg" },
    { ten: "Nghệ", moTa: "Nghệ tươi vàng óng, giã lấy nước hoặc nấu ăn, tốt cho dạ dày.", xuatXu: "Hưng Yên", sku: "RC-NGHE", gia1: 22000, gia2: 55000, don_vi_1: "200g", don_vi_2: "1kg" },
    { ten: "Riềng", moTa: "Riềng tươi thơm cay, gia vị quan trọng trong món bún thang và thịt gà.", xuatXu: "Hải Dương", sku: "RC-RIENG", gia1: 18000, gia2: 42000, don_vi_1: "200g", don_vi_2: "1kg" },
    { ten: "Hành tím", moTa: "Hành tím Sóc Trăng vỏ tím đậm, phi vàng giòn thơm lừng.", xuatXu: "Sóc Trăng", sku: "RC-HTIM", gia1: 25000, gia2: 60000, don_vi_1: "300g", don_vi_2: "1kg" },
    { ten: "Tỏi", moTa: "Tỏi Lý Sơn tép to trắng, vị cay thơm đặc trưng, gia vị không thể thiếu.", xuatXu: "Lý Sơn, Quảng Ngãi", sku: "RC-TOI", gia1: 35000, gia2: 90000, don_vi_1: "200g", don_vi_2: "1kg" },
    { ten: "Hành tây", moTa: "Hành tây trắng giòn ngọt, xào thịt bò hoặc ăn sống kèm salad.", xuatXu: "Đà Lạt, Lâm Đồng", sku: "RC-HTAY", gia1: 18000, gia2: 42000, don_vi_1: "500g", don_vi_2: "2kg" },
    { ten: "Củ kiệu", moTa: "Củ kiệu tươi trắng nõn, muối chua ăn Tết hoặc kho thịt rất ngon.", xuatXu: "Bình Định", sku: "RC-CKIEU", gia1: 30000, gia2: 72000, don_vi_1: "500g", don_vi_2: "2kg" },
    { ten: "Củ nén", moTa: "Củ nén nhỏ thơm nồng, phi dầu vàng giòn rắc lên cơm hến Huế.", xuatXu: "Quảng Nam", sku: "RC-CNEN", gia1: 28000, gia2: 68000, don_vi_1: "200g", don_vi_2: "1kg" },
    { ten: "Củ đậu", moTa: "Củ đậu (sắn nước) giòn ngọt mát, gọt vỏ ăn sống hoặc làm gỏi.", xuatXu: "Bình Thuận", sku: "RC-CDAU", gia1: 15000, gia2: 35000, don_vi_1: "500g", don_vi_2: "2kg" },
  ];

  const rootImageIds = [
    "1447175008436-054170c2e979",
    "1518977676601-b53f82aba655",
    "1590868309235-ea34bed7bd7f",
    "1447175008436-054170c2e979",
    "1518977676601-b53f82aba655",
    "1590868309235-ea34bed7bd7f",
    "1447175008436-054170c2e979",
    "1518977676601-b53f82aba655",
    "1590868309235-ea34bed7bd7f",
    "1447175008436-054170c2e979",
    "1518977676601-b53f82aba655",
    "1590868309235-ea34bed7bd7f",
    "1447175008436-054170c2e979",
    "1518977676601-b53f82aba655",
    "1590868309235-ea34bed7bd7f",
    "1447175008436-054170c2e979",
    "1518977676601-b53f82aba655",
    "1590868309235-ea34bed7bd7f",
    "1447175008436-054170c2e979",
    "1518977676601-b53f82aba655",
  ];

  for (let i = 0; i < rauCuProducts.length; i++) {
    const p = rauCuProducts[i];
    const product = await prisma.san_pham.create({
      data: {
        ma_danh_muc: rauCu.id,
        ten_san_pham: p.ten,
        mo_ta: p.moTa,
        xuat_xu: p.xuatXu,
        trang_thai: "DANG_BAN",
        ngay_tao: new Date(),
      },
    });

    await prisma.anh_san_pham.create({
      data: {
        ma_san_pham: product.id,
        duong_dan_anh: `https://images.unsplash.com/photo-${rootImageIds[i]}?w=800`,
        la_anh_chinh: true,
      },
    });

    await prisma.bien_the_san_pham.createMany({
      data: [
        {
          ma_san_pham: product.id,
          ma_sku: `${p.sku}-${p.don_vi_1.toUpperCase().replace(/\s/g, '')}`,
          ten_bien_the: `Gói ${p.don_vi_1}`,
          don_vi_tinh: p.don_vi_1,
          gia_ban: p.gia1,
          gia_goc: Math.round(p.gia1 * 1.15),
        },
        {
          ma_san_pham: product.id,
          ma_sku: `${p.sku}-${p.don_vi_2.toUpperCase().replace(/\s/g, '')}`,
          ten_bien_the: `Gói ${p.don_vi_2}`,
          don_vi_tinh: p.don_vi_2,
          gia_ban: p.gia2,
          gia_goc: Math.round(p.gia2 * 1.15),
        },
      ],
    });
  }

  // Category 3 - Trái cây (20 products)
  const traiCayProducts = [
    { ten: "Xoài", moTa: "Xoài cát Hòa Lộc chín vàng ươm, thịt dày ngọt lịm không xơ.", xuatXu: "Tiền Giang", sku: "TC-XOAI", gia1: 45000, gia2: 110000, don_vi_1: "1kg", don_vi_2: "3kg" },
    { ten: "Chuối", moTa: "Chuối già Nam Mỹ trái dài đều, chín vàng thơm ngọt dẻo.", xuatXu: "Đồng Nai", sku: "TC-CHUOI", gia1: 25000, gia2: 55000, don_vi_1: "1kg", don_vi_2: "3kg" },
    { ten: "Cam", moTa: "Cam sành Vĩnh Long vỏ xanh ruột vàng, ngọt đậm nhiều nước.", xuatXu: "Vĩnh Long", sku: "TC-CAM", gia1: 35000, gia2: 85000, don_vi_1: "1kg", don_vi_2: "3kg" },
    { ten: "Quýt", moTa: "Quýt đường vỏ mỏng dễ bóc, múi mọng nước ngọt thanh.", xuatXu: "Lai Vung, Đồng Tháp", sku: "TC-QUYT", gia1: 40000, gia2: 95000, don_vi_1: "1kg", don_vi_2: "3kg" },
    { ten: "Bưởi", moTa: "Bưởi da xanh Bến Tre múi to đều, vị ngọt thanh không đắng.", xuatXu: "Bến Tre", sku: "TC-BUOI", gia1: 35000, gia2: 90000, don_vi_1: "1 trái", don_vi_2: "3 trái" },
    { ten: "Táo", moTa: "Táo xanh Ninh Thuận giòn ngọt, vỏ mỏng ăn nguyên vỏ được.", xuatXu: "Ninh Thuận", sku: "TC-TAO", gia1: 45000, gia2: 108000, don_vi_1: "1kg", don_vi_2: "3kg" },
    { ten: "Lê", moTa: "Lê Đài Loan giòn mọng nước, vị ngọt mát giải khát mùa hè.", xuatXu: "Lạng Sơn", sku: "TC-LE", gia1: 55000, gia2: 135000, don_vi_1: "1kg", don_vi_2: "3kg" },
    { ten: "Nho", moTa: "Nho xanh Ninh Thuận trái tròn căng mọng, vị ngọt chua nhẹ.", xuatXu: "Ninh Thuận", sku: "TC-NHO", gia1: 60000, gia2: 150000, don_vi_1: "500g", don_vi_2: "2kg" },
    { ten: "Dưa hấu", moTa: "Dưa hấu ruột đỏ ngọt lịm, giải khát tuyệt vời ngày nóng.", xuatXu: "Long An", sku: "TC-DHAU", gia1: 30000, gia2: 55000, don_vi_1: "1 trái nhỏ", don_vi_2: "1 trái lớn" },
    { ten: "Dưa lưới", moTa: "Dưa lưới Nhật ruột cam ngọt thơm, giàu vitamin và khoáng chất.", xuatXu: "Bình Dương", sku: "TC-DLUOI", gia1: 55000, gia2: 100000, don_vi_1: "1 trái", don_vi_2: "2 trái" },
    { ten: "Thanh long", moTa: "Thanh long ruột đỏ Bình Thuận ngọt mát, giàu chất chống oxy hóa.", xuatXu: "Bình Thuận", sku: "TC-TLONG", gia1: 30000, gia2: 72000, don_vi_1: "1kg", don_vi_2: "3kg" },
    { ten: "Chôm chôm", moTa: "Chôm chôm Java Bến Tre trái đỏ tươi, thịt trắng dày ngọt.", xuatXu: "Bến Tre", sku: "TC-CHOMCHOM", gia1: 35000, gia2: 85000, don_vi_1: "1kg", don_vi_2: "3kg" },
    { ten: "Nhãn", moTa: "Nhãn lồng Hưng Yên cùi dày giòn, vị ngọt thanh đặc trưng.", xuatXu: "Hưng Yên", sku: "TC-NHAN", gia1: 45000, gia2: 110000, don_vi_1: "1kg", don_vi_2: "3kg" },
    { ten: "Vải", moTa: "Vải thiều Bắc Giang vỏ đỏ hồng, cùi trắng dày ngọt lịm.", xuatXu: "Bắc Giang", sku: "TC-VAI", gia1: 50000, gia2: 120000, don_vi_1: "1kg", don_vi_2: "3kg" },
    { ten: "Măng cụt", moTa: "Măng cụt Lái Thiêu vỏ tím đậm, ruột trắng ngà ngọt thanh.", xuatXu: "Bình Dương", sku: "TC-MCUT", gia1: 55000, gia2: 135000, don_vi_1: "1kg", don_vi_2: "3kg" },
    { ten: "Sầu riêng", moTa: "Sầu riêng Ri6 Tiền Giang cơm vàng dẻo, thơm béo ngậy.", xuatXu: "Tiền Giang", sku: "TC-SRIENG", gia1: 120000, gia2: 350000, don_vi_1: "1kg", don_vi_2: "1 trái" },
    { ten: "Mít", moTa: "Mít thái ruột vàng giòn dai, vị ngọt đậm đà hương thơm nồng.", xuatXu: "Tiền Giang", sku: "TC-MIT", gia1: 35000, gia2: 85000, don_vi_1: "1kg", don_vi_2: "3kg" },
    { ten: "Ổi", moTa: "Ổi lê Đài Loan giòn ngọt, ruột trắng ít hạt, ăn kèm muối ớt.", xuatXu: "Bình Dương", sku: "TC-OI", gia1: 30000, gia2: 72000, don_vi_1: "1kg", don_vi_2: "3kg" },
    { ten: "Đu đủ", moTa: "Đu đủ ruột đỏ chín mềm ngọt, giàu enzyme papain tốt cho tiêu hóa.", xuatXu: "Tây Ninh", sku: "TC-DUDU", gia1: 25000, gia2: 50000, don_vi_1: "1 trái", don_vi_2: "3 trái" },
    { ten: "Dứa", moTa: "Dứa (thơm) Cayenne ngọt không xót lưỡi, thơm mát giải nhiệt.", xuatXu: "Tiền Giang", sku: "TC-DUA", gia1: 20000, gia2: 50000, don_vi_1: "1 trái", don_vi_2: "3 trái" },
  ];

  const fruitImageIds = [
    "1601493700631-2b16ec4b4716",
    "1603833665858-e61d17a86224",
    "1557800636-894a64c1696a",
    "1587735243615-c03f25aaff15",
    "1601493700631-2b16ec4b4716",
    "1603833665858-e61d17a86224",
    "1557800636-894a64c1696a",
    "1587735243615-c03f25aaff15",
    "1601493700631-2b16ec4b4716",
    "1603833665858-e61d17a86224",
    "1557800636-894a64c1696a",
    "1587735243615-c03f25aaff15",
    "1601493700631-2b16ec4b4716",
    "1603833665858-e61d17a86224",
    "1557800636-894a64c1696a",
    "1587735243615-c03f25aaff15",
    "1601493700631-2b16ec4b4716",
    "1603833665858-e61d17a86224",
    "1557800636-894a64c1696a",
    "1587735243615-c03f25aaff15",
  ];

  for (let i = 0; i < traiCayProducts.length; i++) {
    const p = traiCayProducts[i];
    const product = await prisma.san_pham.create({
      data: {
        ma_danh_muc: traiCay.id,
        ten_san_pham: p.ten,
        mo_ta: p.moTa,
        xuat_xu: p.xuatXu,
        trang_thai: "DANG_BAN",
        ngay_tao: new Date(),
      },
    });

    await prisma.anh_san_pham.create({
      data: {
        ma_san_pham: product.id,
        duong_dan_anh: `https://images.unsplash.com/photo-${fruitImageIds[i]}?w=800`,
        la_anh_chinh: true,
      },
    });

    await prisma.bien_the_san_pham.createMany({
      data: [
        {
          ma_san_pham: product.id,
          ma_sku: `${p.sku}-${p.don_vi_1.toUpperCase().replace(/\s/g, '')}`,
          ten_bien_the: `Phần ${p.don_vi_1}`,
          don_vi_tinh: p.don_vi_1,
          gia_ban: p.gia1,
          gia_goc: Math.round(p.gia1 * 1.2),
        },
        {
          ma_san_pham: product.id,
          ma_sku: `${p.sku}-${p.don_vi_2.toUpperCase().replace(/\s/g, '')}`,
          ten_bien_the: `Phần ${p.don_vi_2}`,
          don_vi_tinh: p.don_vi_2,
          gia_ban: p.gia2,
          gia_goc: Math.round(p.gia2 * 1.2),
        },
      ],
    });
  }

  // Category 4 - Gạo & ngũ cốc (20 products)
  const gaoProducts = [
    { ten: "Gạo ST25", moTa: "Gạo ST25 đặc sản Sóc Trăng, hạt dài trắng trong, cơm dẻo thơm mùi lá dứa.", xuatXu: "Sóc Trăng", sku: "GNC-ST25", gia1: 45000, gia2: 210000, don_vi_1: "2kg", don_vi_2: "10kg" },
    { ten: "Gạo Jasmine", moTa: "Gạo Jasmine hạt dài thơm nhẹ, cơm mềm dẻo phù hợp bữa cơm gia đình.", xuatXu: "Long An", sku: "GNC-JASM", gia1: 38000, gia2: 180000, don_vi_1: "2kg", don_vi_2: "10kg" },
    { ten: "Gạo lứt", moTa: "Gạo lứt đỏ nguyên cám giàu chất xơ, tốt cho người ăn kiêng và tiểu đường.", xuatXu: "Quảng Trị", sku: "GNC-GLUT", gia1: 50000, gia2: 235000, don_vi_1: "2kg", don_vi_2: "10kg" },
    { ten: "Gạo nếp", moTa: "Gạo nếp cái hoa vàng dẻo thơm, chuyên nấu xôi và làm bánh chưng.", xuatXu: "Hải Dương", sku: "GNC-GNEP", gia1: 42000, gia2: 200000, don_vi_1: "2kg", don_vi_2: "10kg" },
    { ten: "Gạo tẻ", moTa: "Gạo tẻ thường ngày hạt tròn, cơm khô tơi phù hợp nấu cơm chiên.", xuatXu: "An Giang", sku: "GNC-GTE", gia1: 32000, gia2: 150000, don_vi_1: "2kg", don_vi_2: "10kg" },
    { ten: "Gạo huyết rồng", moTa: "Gạo huyết rồng đỏ tím giàu anthocyanin, dinh dưỡng cao cho sức khỏe.", xuatXu: "Điện Biên", sku: "GNC-GHRONG", gia1: 55000, gia2: 260000, don_vi_1: "2kg", don_vi_2: "10kg" },
    { ten: "Yến mạch", moTa: "Yến mạch nguyên hạt cán dẹt, nấu cháo sáng hoặc trộn sữa chua giàu dinh dưỡng.", xuatXu: "Nhập khẩu Úc", sku: "GNC-YMACH", gia1: 65000, gia2: 180000, don_vi_1: "500g", don_vi_2: "2kg" },
    { ten: "Lúa mì", moTa: "Hạt lúa mì nguyên chất, xay bột làm bánh mì hoặc nấu cháo bổ dưỡng.", xuatXu: "Nhập khẩu Mỹ", sku: "GNC-LUAMI", gia1: 55000, gia2: 150000, don_vi_1: "500g", don_vi_2: "2kg" },
    { ten: "Bắp hạt", moTa: "Bắp (ngô) hạt khô vàng đều, rang bơ hoặc nấu chè bắp ngọt ngon.", xuatXu: "Đắk Lắk", sku: "GNC-BAPHAT", gia1: 25000, gia2: 60000, don_vi_1: "500g", don_vi_2: "2kg" },
    { ten: "Hạt kê", moTa: "Hạt kê vàng nhỏ mịn, nấu cháo cho bé ăn dặm rất bổ dưỡng.", xuatXu: "Hà Giang", sku: "GNC-HATKE", gia1: 45000, gia2: 120000, don_vi_1: "500g", don_vi_2: "2kg" },
    { ten: "Hạt quinoa", moTa: "Hạt quinoa trắng siêu thực phẩm, giàu protein thực vật và amino acid.", xuatXu: "Nhập khẩu Peru", sku: "GNC-QUINOA", gia1: 95000, gia2: 270000, don_vi_1: "500g", don_vi_2: "2kg" },
    { ten: "Hạt chia", moTa: "Hạt chia đen nhỏ li ti, ngâm nước nở ra, giàu omega-3 và chất xơ.", xuatXu: "Nhập khẩu Mexico", sku: "GNC-CHIA", gia1: 85000, gia2: 240000, don_vi_1: "300g", don_vi_2: "1kg" },
    { ten: "Hạt lanh", moTa: "Hạt lanh nâu giàu omega-3, xay nhuyễn trộn sinh tố hoặc rắc lên salad.", xuatXu: "Nhập khẩu Canada", sku: "GNC-HLANH", gia1: 75000, gia2: 210000, don_vi_1: "300g", don_vi_2: "1kg" },
    { ten: "Mè trắng", moTa: "Mè (vừng) trắng rang thơm bùi, rắc lên bánh hoặc trộn cơm nắm.", xuatXu: "Bình Phước", sku: "GNC-METRANG", gia1: 35000, gia2: 90000, don_vi_1: "300g", don_vi_2: "1kg" },
    { ten: "Mè đen", moTa: "Mè đen rang giòn bùi béo, xay bột pha sữa hoặc làm chè mè đen.", xuatXu: "Bình Phước", sku: "GNC-MEDEN", gia1: 40000, gia2: 105000, don_vi_1: "300g", don_vi_2: "1kg" },
    { ten: "Đậu xanh", moTa: "Đậu xanh hạt đều vỏ còn nguyên, nấu chè hoặc làm nhân bánh.", xuatXu: "Bình Thuận", sku: "GNC-DXANH", gia1: 35000, gia2: 85000, don_vi_1: "500g", don_vi_2: "2kg" },
    { ten: "Đậu đỏ", moTa: "Đậu đỏ hạt tròn đều, nấu chè đậu đỏ ngọt bùi bổ máu.", xuatXu: "Đắk Lắk", gia1: 38000, gia2: 92000, sku: "GNC-DDO", don_vi_1: "500g", don_vi_2: "2kg" },
    { ten: "Đậu đen", moTa: "Đậu đen xanh lòng bổ thận, nấu chè hoặc hầm giò heo rất bổ.", xuatXu: "Bình Phước", sku: "GNC-DDEN", gia1: 36000, gia2: 88000, don_vi_1: "500g", don_vi_2: "2kg" },
    { ten: "Đậu nành", moTa: "Đậu nành hạt to vàng đều, làm sữa đậu nành hoặc đậu hũ tại nhà.", xuatXu: "Đắk Nông", sku: "GNC-DNANH", gia1: 32000, gia2: 78000, don_vi_1: "500g", don_vi_2: "2kg" },
    { ten: "Đậu phộng", moTa: "Đậu phộng (lạc) rang muối giòn bùi, ăn vặt hoặc nấu kẹo đậu phộng.", xuatXu: "Tây Ninh", sku: "GNC-DPHONG", gia1: 35000, gia2: 85000, don_vi_1: "500g", don_vi_2: "2kg" },
  ];

  const grainImageIds = [
    "1536304993881-ff6e9eefa2a6",
    "1614728263952-84ea256f9697",
    "1586201375761-83865001e31c",
    "1536304993881-ff6e9eefa2a6",
    "1614728263952-84ea256f9697",
    "1586201375761-83865001e31c",
    "1536304993881-ff6e9eefa2a6",
    "1614728263952-84ea256f9697",
    "1586201375761-83865001e31c",
    "1536304993881-ff6e9eefa2a6",
    "1614728263952-84ea256f9697",
    "1586201375761-83865001e31c",
    "1536304993881-ff6e9eefa2a6",
    "1614728263952-84ea256f9697",
    "1586201375761-83865001e31c",
    "1536304993881-ff6e9eefa2a6",
    "1614728263952-84ea256f9697",
    "1586201375761-83865001e31c",
    "1536304993881-ff6e9eefa2a6",
    "1614728263952-84ea256f9697",
  ];

  for (let i = 0; i < gaoProducts.length; i++) {
    const p = gaoProducts[i];
    const product = await prisma.san_pham.create({
      data: {
        ma_danh_muc: gaoNguCoc.id,
        ten_san_pham: p.ten,
        mo_ta: p.moTa,
        xuat_xu: p.xuatXu,
        trang_thai: "DANG_BAN",
        ngay_tao: new Date(),
      },
    });

    await prisma.anh_san_pham.create({
      data: {
        ma_san_pham: product.id,
        duong_dan_anh: `https://images.unsplash.com/photo-${grainImageIds[i]}?w=800`,
        la_anh_chinh: true,
      },
    });

    await prisma.bien_the_san_pham.createMany({
      data: [
        {
          ma_san_pham: product.id,
          ma_sku: `${p.sku}-${p.don_vi_1.toUpperCase().replace(/\s/g, '')}`,
          ten_bien_the: `Túi ${p.don_vi_1}`,
          don_vi_tinh: p.don_vi_1,
          gia_ban: p.gia1,
          gia_goc: Math.round(p.gia1 * 1.1),
        },
        {
          ma_san_pham: product.id,
          ma_sku: `${p.sku}-${p.don_vi_2.toUpperCase().replace(/\s/g, '')}`,
          ten_bien_the: `Túi ${p.don_vi_2}`,
          don_vi_tinh: p.don_vi_2,
          gia_ban: p.gia2,
          gia_goc: Math.round(p.gia2 * 1.1),
        },
      ],
    });
  }

  // Category 5 - Nấm tươi (20 products)
  const namProducts = [
    { ten: "Nấm rơm", moTa: "Nấm rơm tươi thân mập, vị ngọt thơm, xào hoặc nấu lẩu đều tuyệt.", xuatXu: "Long An", sku: "NT-NROM", gia1: 40000, gia2: 95000, don_vi_1: "300g", don_vi_2: "1kg" },
    { ten: "Nấm bào ngư", moTa: "Nấm bào ngư trắng mềm dai, xào rau củ hoặc nướng mỡ hành thơm.", xuatXu: "Củ Chi, TP.HCM", sku: "NT-NBNGƯ", gia1: 35000, gia2: 85000, don_vi_1: "300g", don_vi_2: "1kg" },
    { ten: "Nấm hương tươi", moTa: "Nấm hương (đông cô) tươi thơm đặc trưng, hầm gà hoặc nấu phở.", xuatXu: "Đà Lạt, Lâm Đồng", sku: "NT-NHTƯƠI", gia1: 55000, gia2: 140000, don_vi_1: "300g", don_vi_2: "1kg" },
    { ten: "Nấm kim châm", moTa: "Nấm kim châm Hàn Quốc trắng dài, nấu lẩu hoặc nướng bơ tỏi giòn ngon.", xuatXu: "Đà Lạt, Lâm Đồng", sku: "NT-NKCHAM", gia1: 25000, gia2: 60000, don_vi_1: "200g", don_vi_2: "500g" },
    { ten: "Nấm đùi gà", moTa: "Nấm đùi gà thân trắng dày, xào hoặc nướng thơm bùi thay thế thịt.", xuatXu: "Đà Lạt, Lâm Đồng", sku: "NT-NDGA", gia1: 45000, gia2: 110000, don_vi_1: "300g", don_vi_2: "1kg" },
    { ten: "Nấm mỡ", moTa: "Nấm mỡ trắng tròn căng, vị nhẹ dễ ăn, chiên bơ tỏi hoặc nấu soup.", xuatXu: "Đà Lạt, Lâm Đồng", sku: "NT-NMO", gia1: 38000, gia2: 92000, don_vi_1: "300g", don_vi_2: "1kg" },
    { ten: "Nấm linh chi tươi", moTa: "Nấm linh chi tươi thái lát nấu nước uống, bổ gan tăng sức đề kháng.", xuatXu: "Phú Yên", sku: "NT-NLCTƯƠI", gia1: 80000, gia2: 200000, don_vi_1: "200g", don_vi_2: "500g" },
    { ten: "Nấm đông cô", moTa: "Nấm đông cô tươi mũ nâu dày, hương thơm đặc trưng nấu lẩu nấm.", xuatXu: "Đà Lạt, Lâm Đồng", sku: "NT-NDCO", gia1: 50000, gia2: 125000, don_vi_1: "300g", don_vi_2: "1kg" },
    { ten: "Nấm tuyết", moTa: "Nấm tuyết (ngân nhĩ) trắng trong, nấu chè dưỡng nhan đẹp da.", xuatXu: "Đà Lạt, Lâm Đồng", sku: "NT-NTUYET", gia1: 45000, gia2: 110000, don_vi_1: "100g", don_vi_2: "300g" },
    { ten: "Nấm mèo tươi", moTa: "Nấm mèo (mộc nhĩ) tươi giòn sần sật, xào rau củ hoặc nấu miến.", xuatXu: "Bình Phước", sku: "NT-NMEO", gia1: 30000, gia2: 72000, don_vi_1: "200g", don_vi_2: "500g" },
    { ten: "Nấm hải sản", moTa: "Nấm hải sản trắng ngà thân dài, vị ngọt thanh giống hải sản.", xuatXu: "Đà Lạt, Lâm Đồng", sku: "NT-NHSAN", gia1: 42000, gia2: 100000, don_vi_1: "300g", don_vi_2: "1kg" },
    { ten: "Nấm tràm", moTa: "Nấm tràm rừng vị đậm đà, đặc sản xào lăn hoặc kho tiêu.", xuatXu: "Phú Quốc, Kiên Giang", sku: "NT-NTRAM", gia1: 65000, gia2: 160000, don_vi_1: "300g", don_vi_2: "1kg" },
    { ten: "Nấm mối", moTa: "Nấm mối rừng hiếm quý, thơm đất đặc trưng, nướng than hoặc xào tỏi.", xuatXu: "Tây Ninh", sku: "NT-NMOI", gia1: 85000, gia2: 220000, don_vi_1: "300g", don_vi_2: "1kg" },
    { ten: "Nấm sò", moTa: "Nấm sò trắng xám mềm, xào chua ngọt hoặc hấp gừng nhẹ nhàng.", xuatXu: "Củ Chi, TP.HCM", sku: "NT-NSO", gia1: 30000, gia2: 72000, don_vi_1: "300g", don_vi_2: "1kg" },
    { ten: "Nấm linh chi đỏ", moTa: "Nấm linh chi đỏ tươi cao cấp, thái mỏng hãm trà bổ dưỡng.", xuatXu: "Đà Lạt, Lâm Đồng", sku: "NT-NLCDO", gia1: 120000, gia2: 320000, don_vi_1: "200g", don_vi_2: "500g" },
    { ten: "Nấm linh chi đen", moTa: "Nấm linh chi đen quý hiếm, nấu nước uống tăng cường miễn dịch.", xuatXu: "Lâm Đồng", sku: "NT-NLCDEN", gia1: 150000, gia2: 400000, don_vi_1: "200g", don_vi_2: "500g" },
    { ten: "Nấm linh chi vàng", moTa: "Nấm linh chi vàng sắc đẹp, hãm trà thơm nhẹ bổ khí huyết.", xuatXu: "Lâm Đồng", sku: "NT-NLCVANG", gia1: 130000, gia2: 350000, don_vi_1: "200g", don_vi_2: "500g" },
    { ten: "Nấm ngọc châm", moTa: "Nấm ngọc châm trắng tinh nhỏ xinh, nấu lẩu hoặc xào bơ thơm ngon.", xuatXu: "Đà Lạt, Lâm Đồng", sku: "NT-NNCHAM", gia1: 35000, gia2: 85000, don_vi_1: "200g", don_vi_2: "500g" },
    { ten: "Nấm shimeji trắng", moTa: "Nấm shimeji trắng Nhật Bản giòn dai, nấu lẩu Nhật hoặc xào bơ.", xuatXu: "Đà Lạt, Lâm Đồng", sku: "NT-NSHITRANG", gia1: 38000, gia2: 92000, don_vi_1: "200g", don_vi_2: "500g" },
    { ten: "Nấm shimeji nâu", moTa: "Nấm shimeji nâu đậm đà hơn trắng, xào tỏi hoặc nướng giấy bạc.", xuatXu: "Đà Lạt, Lâm Đồng", sku: "NT-NSHINAU", gia1: 40000, gia2: 95000, don_vi_1: "200g", don_vi_2: "500g" },
  ];

  const mushroomImageIds = [
    "1504674900247-0877df9cc836",
    "1547592180-85f173990554",
    "1563421263667-6bac9ea59417",
    "1504674900247-0877df9cc836",
    "1547592180-85f173990554",
    "1563421263667-6bac9ea59417",
    "1504674900247-0877df9cc836",
    "1547592180-85f173990554",
    "1563421263667-6bac9ea59417",
    "1504674900247-0877df9cc836",
    "1547592180-85f173990554",
    "1563421263667-6bac9ea59417",
    "1504674900247-0877df9cc836",
    "1547592180-85f173990554",
    "1563421263667-6bac9ea59417",
    "1504674900247-0877df9cc836",
    "1547592180-85f173990554",
    "1563421263667-6bac9ea59417",
    "1504674900247-0877df9cc836",
    "1547592180-85f173990554",
  ];

  for (let i = 0; i < namProducts.length; i++) {
    const p = namProducts[i];
    const product = await prisma.san_pham.create({
      data: {
        ma_danh_muc: namTuoi.id,
        ten_san_pham: p.ten,
        mo_ta: p.moTa,
        xuat_xu: p.xuatXu,
        trang_thai: "DANG_BAN",
        ngay_tao: new Date(),
      },
    });

    await prisma.anh_san_pham.create({
      data: {
        ma_san_pham: product.id,
        duong_dan_anh: `https://images.unsplash.com/photo-${mushroomImageIds[i]}?w=800`,
        la_anh_chinh: true,
      },
    });

    await prisma.bien_the_san_pham.createMany({
      data: [
        {
          ma_san_pham: product.id,
          ma_sku: `${p.sku}-${p.don_vi_1.toUpperCase().replace(/\s/g, '')}`,
          ten_bien_the: `Gói ${p.don_vi_1}`,
          don_vi_tinh: p.don_vi_1,
          gia_ban: p.gia1,
          gia_goc: Math.round(p.gia1 * 1.25),
        },
        {
          ma_san_pham: product.id,
          ma_sku: `${p.sku}-${p.don_vi_2.toUpperCase().replace(/\s/g, '')}`,
          ten_bien_the: `Gói ${p.don_vi_2}`,
          don_vi_tinh: p.don_vi_2,
          gia_ban: p.gia2,
          gia_goc: Math.round(p.gia2 * 1.25),
        },
      ],
    });
  }

  console.log("Seeded 15 categories and 100 products (20 per category for categories 1-5)");

  return categories;
}
