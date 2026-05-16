type WarehouseIssueDb = {
  don_hang: {
    findUnique(args: any): Promise<any>;
  };
  phieu_xuat_kho: {
    findFirst(args: any): Promise<any>;
    create(args: any): Promise<any>;
  };
  chi_tiet_phieu_xuat: {
    createMany(args: any): Promise<any>;
  };
};

export async function ensureOrderIssueTicket(db: WarehouseIssueDb, orderId: number) {
  const existing = await db.phieu_xuat_kho.findFirst({
    where: {
      ma_don_hang: orderId,
      ly_do_xuat: "XUAT_THEO_DON_HANG",
    },
    select: { id: true },
  });

  if (existing) return existing.id;

  const order = await db.don_hang.findUnique({
    where: { id: orderId },
    select: {
      chi_tiet_don_hang: {
        select: {
          ma_bien_the: true,
          so_luong: true,
        },
      },
    },
  });

  const details = (order?.chi_tiet_don_hang ?? [])
    .filter((item: any) => item.ma_bien_the)
    .map((item: any) => ({
      ma_bien_the: item.ma_bien_the,
      so_luong_yeu_cau: item.so_luong ?? 1,
      so_luong_thuc_xuat: 0,
    }));

  if (details.length === 0) return null;

  const phieuXuat = await db.phieu_xuat_kho.create({
    data: {
      ma_don_hang: orderId,
      trang_thai: "DANG_SOAN",
      ly_do_xuat: "XUAT_THEO_DON_HANG",
      ngay_tao: new Date(),
    },
  });

  await db.chi_tiet_phieu_xuat.createMany({
    data: details.map((item: any) => ({
      ma_phieu_xuat: phieuXuat.id,
      ...item,
    })),
  });

  return phieuXuat.id;
}
