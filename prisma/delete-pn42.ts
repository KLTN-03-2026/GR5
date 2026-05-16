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

const PHIEU_ID = 42;

async function main() {
  const phieu = await prisma.phieu_nhap_kho.findUnique({
    where: { id: PHIEU_ID },
    include: {
      chi_tiet_phieu_nhap: { select: { id: true, ma_bien_the: true } },
    },
  });
  if (!phieu) {
    console.log(`Không tìm thấy phieu_nhap_kho #${PHIEU_ID}.`);
    return;
  }
  console.log(`Tìm thấy PN-${PHIEU_ID}, trạng thái: ${phieu.trang_thai}`);

  const variantIds = phieu.chi_tiet_phieu_nhap.map((c) => c.ma_bien_the).filter((v): v is number => v != null);

  // Tìm lo_hang được tạo từ phiếu này
  const loHangList = await prisma.lo_hang.findMany({
    where: { ma_phieu_nhap: PHIEU_ID },
    select: { id: true, ma_lo_hang: true },
  });
  const loHangIds = loHangList.map((l) => l.id);
  console.log(`- Lô hàng liên quan: ${loHangIds.length} (${loHangList.map((l) => l.ma_lo_hang).join(", ") || "không có"})`);

  await prisma.$transaction(async (tx) => {
    // 1. Xóa các bảng phụ thuộc vào lo_hang (cascade đa số nhưng explicit để chắc)
    if (loHangIds.length > 0) {
      const delTon = await tx.ton_kho_tong.deleteMany({ where: { ma_lo_hang: { in: loHangIds } } });
      console.log(`  ton_kho_tong: -${delTon.count}`);

      const delKien = await tx.kien_hang_chi_tiet.deleteMany({ where: { ma_lo_hang: { in: loHangIds } } });
      console.log(`  kien_hang_chi_tiet: -${delKien.count}`);

      const delCanhBao = await tx.canh_bao_lo_hang.deleteMany({ where: { ma_lo_hang: { in: loHangIds } } });
      console.log(`  canh_bao_lo_hang: -${delCanhBao.count}`);

      const delLo = await tx.lo_hang.deleteMany({ where: { id: { in: loHangIds } } });
      console.log(`  lo_hang: -${delLo.count}`);
    }

    // 2. Xóa công nợ NCC gắn với phiếu này (không có cascade)
    const delCongNo = await tx.cong_no_ncc.deleteMany({ where: { ma_phieu_nhap: PHIEU_ID } });
    console.log(`- cong_no_ncc: -${delCongNo.count}`);

    // 3. Xóa phiếu nhập — cascade sẽ tự dọn:
    //    chi_tiet_phieu_nhap, nhiem_vu_kiem_dinh, chi_tiet_luan_chuyen_kho,
    //    danh_gia_giao_hang_ncc, lich_su_nhan_hang
    await tx.phieu_nhap_kho.delete({ where: { id: PHIEU_ID } });
    console.log(`- phieu_nhap_kho #${PHIEU_ID}: xóa thành công (cascade các bảng con)`);
  });

  console.log(`\n✓ Đã xóa PN-${PHIEU_ID} và toàn bộ dữ liệu liên quan.`);
  if (variantIds.length > 0) {
    console.log(`  (Lưu ý: tồn kho của biến thể ${variantIds.join(", ")} đã giảm theo. Kiểm tra lại nếu cần.)`);
  }
}

main()
  .catch((e) => {
    console.error("LỖI:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
