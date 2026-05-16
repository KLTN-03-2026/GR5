import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

type TxClient = Prisma.TransactionClient | typeof prisma;

/**
 * Tự động chuyển san_pham sang NGUNG_BAN khi tổng tồn kho = 0.
 *
 * Why: tránh hiển thị sản phẩm hết hàng cho khách trên store. Chỉ flip
 * DANG_BAN → NGUNG_BAN; không tự bật lại để tôn trọng các lần admin
 * ngưng bán thủ công (sẽ bật lại bằng tay khi admin nhập hàng mới).
 *
 * @param tx Prisma tx client hoặc prisma global
 * @param variantIds Danh sách ma_bien_the vừa bị trừ kho — sẽ truy ngược lên san_pham
 */
export async function syncProductStatusFromStock(
  tx: TxClient,
  variantIds: Array<number | null | undefined>
) {
  const ids = Array.from(new Set(variantIds.filter((v): v is number => typeof v === "number" && v > 0)));
  if (ids.length === 0) return;

  const variants = await tx.bien_the_san_pham.findMany({
    where: { id: { in: ids } },
    select: { ma_san_pham: true },
  });
  const productIds = Array.from(
    new Set(variants.map((v) => v.ma_san_pham).filter((x): x is number => typeof x === "number"))
  );

  for (const productId of productIds) {
    const agg = await tx.ton_kho_tong.aggregate({
      _sum: { so_luong: true },
      where: {
        lo_hang: {
          bien_the_san_pham: { ma_san_pham: productId },
          trang_thai: { notIn: ["DA_TIEU_HUY", "TRA_NCC"] },
        },
      },
    });
    const total = agg._sum.so_luong ?? 0;
    if (total <= 0) {
      await tx.san_pham.updateMany({
        where: { id: productId, trang_thai: "DANG_BAN" },
        data: { trang_thai: "NGUNG_BAN" },
      });
    }
  }
}
