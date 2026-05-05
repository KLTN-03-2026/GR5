import PurchaseOrderCreation from "@/components/warehouse-manager/PurchaseOrderCreation";
import prisma from "@/lib/prisma";

export default async function WarehouseManagerOrdersPage() {
  const [ncc, spRaw] = await Promise.all([
    prisma.nha_cung_cap.findMany({ select: { id: true, ten_ncc: true }, where: { trang_thai: "DANG_HOP_TAC" } }),
    prisma.san_pham.findMany({
      select: {
        ten_san_pham: true,
        bien_the_san_pham: { select: { id: true, ten_bien_the: true } }
      }
    }),
  ]);

  const sp = [];
  for (const s of spRaw) {
    for (const bt of s.bien_the_san_pham) {
      sp.push({ id: bt.id, name: bt.ten_bien_the || s.ten_san_pham });
    }
  }

  const formOptions = {
    ncc: ncc.map((n) => ({ id: n.id, name: n.ten_ncc })),
    sp,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Đơn đặt hàng NCC</h1>
        <p className="mt-1 text-sm text-slate-500">Tạo đơn đặt hàng và theo dõi tình trạng dự kiến giao hàng.</p>
      </div>
      <PurchaseOrderCreation formOptions={formOptions} />
    </div>
  );
}
