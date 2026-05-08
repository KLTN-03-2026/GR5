import WarehouseMapView from "@/components/admin/warehouse/WarehouseMapView";

export const metadata = {
  title: "Sơ Đồ Kho - NV Vận Hành",
  description: "Xem sơ đồ kho hàng",
};

export default function StaffMapPage() {
  return <WarehouseMapView readOnly />;
}
