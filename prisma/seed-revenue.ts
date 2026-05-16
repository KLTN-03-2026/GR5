import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT) || 3307,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5,
  allowPublicKeyRetrieval: true,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding fake orders for Revenue Report...");

  const customer = await prisma.nguoi_dung.findFirst({ where: { vai_tro_nguoi_dung: { none: {} } } }) || await prisma.nguoi_dung.findFirst();
  const staffMembers = await prisma.nguoi_dung.findMany({ take: 3 });

  if (!customer || staffMembers.length === 0) {
    console.log("No base data to seed orders.");
    return;
  }

  // Lấy các sản phẩm có danh mục để biểu đồ đẹp
  const variants = await prisma.bien_the_san_pham.findMany({ 
    take: 10, 
    include: { 
      san_pham: { include: { danh_muc: true } },
      chi_tiet_phieu_nhap: true
    } 
  });

  if (variants.length === 0) {
    console.log("No variants found.");
    return;
  }

  const cities = ['Thành phố Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Đồng Nai', 'Bình Dương'];

  // Tạo 150 đơn hàng trong 30 ngày qua
  for (let i = 0; i < 150; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    const city = cities[Math.floor(Math.random() * cities.length)];
    const address = `Số ${Math.floor(Math.random() * 100)}, Đường Tôn Đức Thắng, ${city}`;

    const numItems = Math.floor(Math.random() * 4) + 1;
    let total = 0;
    const details = [];

    for (let j = 0; j < numItems; j++) {
      const v = variants[Math.floor(Math.random() * variants.length)];
      const qty = Math.floor(Math.random() * 5) + 1;
      
      // Đảm bảo giá bán có lãi so với giá nhập
      const baseCost = v.chi_tiet_phieu_nhap?.[0]?.don_gia ? Number(v.chi_tiet_phieu_nhap[0].don_gia) : Number(v.gia_goc || 20000);
      const price = Number(v.gia_ban) || (baseCost * 1.5);
      
      total += qty * price;
      details.push({
        ma_bien_the: v.id,
        so_luong: qty,
        don_gia: price
      });
    }

    const shippingFee = Math.random() > 0.5 ? 30000 : 50000;
    total += shippingFee;

    const staff = staffMembers[Math.floor(Math.random() * staffMembers.length)];

    await prisma.don_hang.create({
      data: {
        ma_nguoi_dung: customer.id,
        tong_tien: total,
        trang_thai: 'HOAN_THANH',
        dia_chi_giao_hang: address,
        ngay_tao: date,
        phi_van_chuyen: shippingFee,
        chi_tiet_don_hang: {
          create: details
        },
        lich_su_don_hang: {
          create: [
            { trang_thai: 'CHO_XAC_NHAN', thoi_gian_doi: new Date(date.getTime() - 1000 * 60 * 60 * 24 * 2) },
            { trang_thai: 'DA_GIAO', thoi_gian_doi: date }
          ]
        },
        nhiem_vu_cong_viec: {
          create: {
            ma_nguoi_dung: staff.id,
            loai_nhiem_vu: 'XU_LY_DON',
            trang_thai: 'HOAN_THANH',
            thoi_gian_giao: date,
            thoi_gian_hoan_thanh: date
          }
        },
        giao_dich_thanh_toan: {
          create: {
            so_tien: total,
            trang_thai: 'DA_THANH_TOAN',
            phuong_thuc_thanh_toan: Math.random() > 0.4 ? 'VNPAY' : (Math.random() > 0.5 ? 'MOMO' : 'COD')
          }
        }
      }
    });

    if (i % 20 === 0) console.log(`Created ${i} orders...`);
  }

  console.log('Seeded revenue data successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
