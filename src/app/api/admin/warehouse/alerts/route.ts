import { NextResponse } from "next/server";
import { WarehouseAdminService } from "@/services/admin/warehouse-admin.service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "all";
    const data = await WarehouseAdminService.getAlerts(filter);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[GET /api/admin/warehouse/alerts]", error);
    return NextResponse.json({ error: "Không thể tải cảnh báo HSD" }, { status: 500 });
  }
}