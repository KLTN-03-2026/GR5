import { NextResponse } from "next/server";
import { WarehouseAdminService } from "@/services/admin/warehouse-admin.service";

export async function GET() {
  try {
    const data = await WarehouseAdminService.getMapData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[GET /api/admin/warehouse/map]", error);
    return NextResponse.json({ error: "Không thể tải sơ đồ kho" }, { status: 500 });
  }
}