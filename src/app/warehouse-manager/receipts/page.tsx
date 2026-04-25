import WarehouseReceivingClient from "@/components/admin/warehouse/WarehouseReceivingClient";

export default function WarehouseReceiptsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Duyệt Phiếu Nhập</h1>
        <p className="mt-1 text-sm text-slate-500">Xem xét và phê duyệt các phiếu nhập đã được nhân viên tiếp nhận và cập nhật số lượng.</p>
      </div>
      <WarehouseReceivingClient />
    </div>
  );
}
